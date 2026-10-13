using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Stronghold.Protocol;

// Immutable blobs are shared by content hash; only the active catalog is specific to a server.
public sealed class ResourceCache
{
    public const string Agent = "StrongholdProtocolApp/1 StrongholdProtocolPack/1";
    private readonly Uri server;
    private readonly string root, index;
    private readonly HttpClient http = new(new HttpClientHandler { AllowAutoRedirect = false, UseCookies = false }) { Timeout = TimeSpan.FromMinutes(15) };
    private readonly Dictionary<string, (long, DateTime)> verified = new();
    private Dictionary<string, JsonObject> files = new();
    public string Version { get; private set; } = "";
    public string Art { get; private set; } = "";
    private static readonly Regex HashPattern = new("^[a-f0-9]{64}$");
    private static readonly Regex FixedPattern = new(@"^/(?:assets|fonts|icons)/.+\.(?:png|jpe?g|gif|webp|avif|svg|ico|skel|atlas|mp3|ogg|oga|opus|wav|m4a|aac|woff2?|otf|ttf|bin|obj|mtl|json|css|txt)$|^/data/(?:assets|local-assets|bands|bonds|bosses|chess|choices|config|effects|emotes|enemies|factions|garrisons|items|stages|tokens|tuning|waves)\.json$", RegexOptions.IgnoreCase);
    private static string Str(JsonNode node,string key) => node[key]?.GetValue<string>() ?? throw new IOException("资源清单缺少 "+key);
    private static long Size(JsonNode node) => node["size"]?.GetValue<long>() ?? throw new IOException("缺少资源大小");
    public static string Hash(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
    public static bool SameOrigin(Uri a,Uri b) => a.Scheme==b.Scheme && a.IdnHost==b.IdnHost && a.Port==b.Port && b.UserInfo=="";
    public static bool FixedPath(string path) => !path.Contains('%')&&!path.Contains('\\')&&!path.Contains('?')&&!path.Contains('#')&&!path.Split('/').Skip(1).Any(p=>p.Length==0||p.StartsWith('.'))&&FixedPattern.IsMatch(path);
    public ResourceCache(Uri server,string directory)
    {
        this.server=server;root=directory;Directory.CreateDirectory(Path.Combine(root,"files"));
        index=Path.Combine(root,Hash(Encoding.UTF8.GetBytes(server.AbsoluteUri))+".json");http.DefaultRequestHeaders.UserAgent.ParseAdd(Agent);
    }
    public void SetCookie(string cookie) { http.DefaultRequestHeaders.Remove("Cookie");if(cookie.Length>0)http.DefaultRequestHeaders.TryAddWithoutValidation("Cookie",cookie); }
    public async Task<byte[]> Read(string route,int limit=16*1024*1024)
    {
        using var res=await Get(route);await using var input=await res.Content.ReadAsStreamAsync();using var memory=new MemoryStream();byte[] buffer=new byte[65536];int n;
        while((n=await input.ReadAsync(buffer))>0){if(memory.Length+n>limit)throw new IOException("资源清单过大");await memory.WriteAsync(buffer.AsMemory(0,n));}return memory.ToArray();
    }
    private async Task<HttpResponseMessage> Get(string route,long offset=0)
    {
        var url=new Uri(server,route);if(!SameOrigin(server,url))throw new IOException("资源地址不属于当前服务器");
        using var request=new HttpRequestMessage(HttpMethod.Get,url);if(offset>0)request.Headers.Range=new System.Net.Http.Headers.RangeHeaderValue(offset,null);
        var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead);
        if(response.StatusCode!=HttpStatusCode.OK&&!(offset>0&&response.StatusCode==HttpStatusCode.PartialContent)){var status=response.StatusCode;response.Dispose();throw new HttpRequestException(status==HttpStatusCode.Unauthorized?"请先登录":"无法下载资源（HTTP "+(int)status+"）",null,status);}return response;
    }
    private string Blob(string hash) => HashPattern.IsMatch(hash)?Path.Combine(root,"files",hash):throw new IOException("无效资源哈希");
    private async Task<bool> Contains(string hash,long size)
    {
        var f=new FileInfo(Blob(hash));if(!f.Exists||f.Length!=size)return false;
        if(verified.TryGetValue(hash,out var stamp)&&stamp==(f.Length,f.LastWriteTimeUtc))return true;
        await using var input=f.OpenRead();if(Convert.ToHexString(await SHA256.HashDataAsync(input)).ToLowerInvariant()!=hash)return false;
        verified[hash]=(f.Length,f.LastWriteTimeUtc);return true;
    }
    private async Task Put(string hash,long size,Stream input)
    {
        if(size<=0||size>256L*1024*1024)throw new IOException("资源大小无效");
        var target=Blob(hash);var temp=target+"."+Guid.NewGuid()+".part";using var digest=IncrementalHash.CreateHash(HashAlgorithmName.SHA256);long count=0;
        try{
            await using(var output=File.Create(temp)){byte[] b=new byte[65536];int n;while((n=await input.ReadAsync(b))>0){count+=n;if(count>size)throw new IOException("资源大小不符");digest.AppendData(b,0,n);await output.WriteAsync(b.AsMemory(0,n));}}
            if(count!=size||Convert.ToHexString(digest.GetHashAndReset()).ToLowerInvariant()!=hash)throw new IOException("资源校验失败，请重试");
            File.Move(temp,target,true);var f=new FileInfo(target);verified[hash]=(f.Length,f.LastWriteTimeUtc);
        }finally{if(File.Exists(temp))File.Delete(temp);}
    }
    private static Dictionary<string,JsonObject> Parse(JsonNode catalog)
    {
        if(catalog["format"]?.GetValue<int>()!=1||!HashPattern.IsMatch(Str(catalog,"version"))||!HashPattern.IsMatch(Str(catalog,"art")))throw new IOException("资源包格式无效");
        var list=catalog["files"]?.AsArray()??throw new IOException("缺少资源清单");if(list.Count>50000)throw new IOException("资源数量过大");var result=new Dictionary<string,JsonObject>();
        foreach(var entry in list){var f=entry?.AsObject()??throw new IOException("无效文件");var p=Str(f,"path");var mime=Str(f,"mime");long size=Size(f);
            if(!FixedPath(p)||!HashPattern.IsMatch(Str(f,"hash"))||size<=0||size>256L*1024*1024||mime.Contains('\r')||mime.Contains('\n')||!result.TryAdd(p,f))throw new IOException("资源清单包含无效文件");}
        return result;
    }
    private async Task ImportZip(string filename,Dictionary<string,long> wanted)
    {
        using var zip=ZipFile.OpenRead(filename);var seen=new HashSet<string>();
        foreach(var e in zip.Entries){if(e.FullName=="catalog.json"){if(e.Length>16*1024*1024)throw new IOException("清单过大");continue;}
            if(!e.FullName.StartsWith("files/")||!HashPattern.IsMatch(e.FullName[6..])||!seen.Add(e.FullName)||!wanted.TryGetValue(e.FullName[6..],out long size)||e.Length!=size)throw new IOException("资源包包含无效路径或文件");
            var hash=e.FullName[6..];if(!await Contains(hash,size)){await using var input=e.Open();await Put(hash,size,input);}}
    }
    public async Task Prepare(Action<string> progress,string? bundledDirectory=null)
    {
        progress("正在检查服务器版本…");var state=JsonNode.Parse(await Read("/app/resource-manifest",65536))!;
        var descriptor=state["resourcePack"]??throw new IOException("服务器尚未生成资源包，请联系服主运行 npm run resources:build。");var catalogInfo=descriptor["catalog"]!;
        var archiveInfo=descriptor["archive"]!;var archiveBytes=archiveInfo["bytes"]!.GetValue<long>();if(!HashPattern.IsMatch(Str(archiveInfo,"sha256"))||archiveBytes<=0||archiveBytes>uint.MaxValue)throw new IOException("资源包描述无效");
        byte[]? bytes=null;if(File.Exists(index)){var local=await File.ReadAllBytesAsync(index);if(Hash(local)==Str(catalogInfo,"sha256"))bytes=local;}
        if(bytes==null&&bundledDirectory!=null&&File.Exists(Path.Combine(bundledDirectory,"resource-catalog.json"))){var local=await File.ReadAllBytesAsync(Path.Combine(bundledDirectory,"resource-catalog.json"));if(Hash(local)==Str(catalogInfo,"sha256"))bytes=local;}
        bytes??=await Read(Str(catalogInfo,"url"));if(Hash(bytes)!=Str(catalogInfo,"sha256"))throw new IOException("资源清单校验失败");
        var catalog=JsonNode.Parse(bytes)!;if(Str(catalog,"version")!=Str(descriptor,"version")||Str(catalog,"art")!=Str(state,"art"))throw new IOException("资源版本不一致");
        var next=Parse(catalog);var wanted=next.Values.GroupBy(f=>Str(f,"hash")).ToDictionary(g=>g.Key,g=>Size(g.First()));var missing=new List<string>();
        progress("正在检查本地资源…");foreach(var f in wanted)if(!await Contains(f.Key,f.Value))missing.Add(f.Key);
        if(missing.Count>0&&bundledDirectory!=null&&File.Exists(Path.Combine(bundledDirectory,"resource-catalog.json"))){
            var localBytes=await File.ReadAllBytesAsync(Path.Combine(bundledDirectory,"resource-catalog.json"));var marker=Path.Combine(root,"bundled-"+Hash(localBytes));
            if(!File.Exists(marker)){var local=Parse(JsonNode.Parse(localBytes)!);progress("正在准备安装包内的资源…");await ImportZip(Path.Combine(bundledDirectory,"resource-pack.zip"),local.Values.GroupBy(f=>Str(f,"hash")).ToDictionary(g=>g.Key,g=>Size(g.First())));await AtomicWrite(marker,[1]);}
            missing.Clear();foreach(var f in wanted)if(!await Contains(f.Key,f.Value))missing.Add(f.Key);
        }
        var archive=descriptor["archive"]!;long zipSize=archive["bytes"]!.GetValue<long>();
        var temp=Path.Combine(root,Str(archive,"sha256")+".download");
        // Resume the ZIP only for a completely empty cache; partial caches download missing blobs.
        if(missing.Count>0&&missing.Count==wanted.Count){
            bool installed=false;
            try{
                long count=File.Exists(temp)?new FileInfo(temp).Length:0,last=0;if(count>zipSize){File.Delete(temp);count=0;}
                using var response=count<zipSize?await Get(Str(archive,"url"),count):null;
                if(response?.StatusCode==HttpStatusCode.OK)count=0;else if(response!=null&&response.Content.Headers.ContentRange?.From!=count)throw new IOException("断点续传响应无效");
                using var hash=IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
                if(count>0){await using var existing=File.OpenRead(temp);byte[] b=new byte[65536];int n;while((n=await existing.ReadAsync(b))>0)hash.AppendData(b,0,n);}
                if(response!=null){await using var input=await response.Content.ReadAsStreamAsync();await using(var output=new FileStream(temp,count>0?FileMode.Append:FileMode.Create,FileAccess.Write)){byte[] b=new byte[65536];int n;while((n=await input.ReadAsync(b))>0){count+=n;if(count>zipSize)throw new IOException("数据包大小不符");hash.AppendData(b,0,n);await output.WriteAsync(b.AsMemory(0,n));if(Environment.TickCount64-last>250){progress($"下载资源包：{count/1048576.0:F1} / {zipSize/1048576.0:F1} MiB");last=Environment.TickCount64;}}}}
                if(count!=zipSize||Convert.ToHexString(hash.GetHashAndReset()).ToLowerInvariant()!=Str(archive,"sha256")){File.Delete(temp);throw new IOException("数据包校验失败");}
                progress("正在校验并安装资源包…");await ImportZip(temp,wanted);
                installed=true;
            }finally{if(installed&&File.Exists(temp))File.Delete(temp);}
        }else{int done=0;foreach(var h in missing){progress($"更新资源：{++done} / {missing.Count}");using var response=await Get("/app/resource-file/"+h);await using var input=await response.Content.ReadAsStreamAsync();await Put(h,wanted[h],input);}}
        foreach(var f in wanted)if(!await Contains(f.Key,f.Value))throw new IOException("资源包尚未完整，请重试");
        await AtomicWrite(index,bytes);files=next;Version=Str(catalog,"version");Art=Str(catalog,"art");
    }
    private static async Task AtomicWrite(string file,byte[] bytes){var temp=file+".tmp";try{await File.WriteAllBytesAsync(temp,bytes);File.Move(temp,file,true);}finally{if(File.Exists(temp))File.Delete(temp);}}
    public (Stream body,string mime,long size)? Local(Uri target,bool head=false)
    {
        if(!SameOrigin(server,target))return null;var path=Uri.UnescapeDataString(target.AbsolutePath);
        var versioned=path.StartsWith("/app-cache/");
        if(versioned){var prefix="/app-cache/"+Art;if(Version.Length==0||!path.StartsWith(prefix+"/"))throw new IOException("资源版本不一致，请回大厅更新");path=path[prefix.Length..];}
        var media=path.StartsWith("/media/");
        if(media){var extensions=new[]{".mp3",".m4a",".aac",".ogg",".oga",".opus",".wav"};var original="/assets/audio/"+path[7..];var ext=extensions.FirstOrDefault(original.EndsWith);if(ext!=null)original=original[..^ext.Length];path=extensions.Select(suffix=>original+suffix).FirstOrDefault(files.ContainsKey)??original+".mp3";}
        if(!files.TryGetValue(path,out var f)){
            if(versioned||media||path.StartsWith("/assets/")||path.StartsWith("/fonts/")||path.StartsWith("/icons/")||path.StartsWith("/data/"))throw new IOException("本地资源缺失，请回大厅更新");
            return null;
        }
        var file=Blob(Str(f,"hash"));if(!File.Exists(file)||new FileInfo(file).Length!=Size(f))throw new IOException("本地资源损坏，请回大厅更新");
        return (head?new MemoryStream():File.OpenRead(file),Str(f,"mime"),Size(f));
    }
}
