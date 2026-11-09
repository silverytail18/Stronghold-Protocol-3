using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
namespace Stronghold.Protocol;
sealed record ResourceEntry(string Path,string Hash,long Size,string Mime);
sealed class ResourceStore : IDisposable
{
    readonly string directory;
    readonly ZipArchive archive;
    readonly byte[] baseline;
    readonly Dictionary<string,ZipArchiveEntry> embedded = new();
    readonly Dictionary<string,ResourceEntry> baselineFiles;
    Dictionary<string,ResourceEntry> files;
    readonly SemaphoreSlim gate = new(1);
    readonly RSA key = RSA.Create();
    public string Hash { get; private set; }
    public string Agent => $"StrongholdProtocolApp/{ResourceBuild.Contract} Resources/{Hash} ClientLine/{ResourceBuild.ClientLine} Build/{ResourceBuild.Build} Epoch/{ResourceBuild.Epoch}";
    public ResourceStore(string install,string directory)
    {
        directory=Path.Combine(directory,ResourceBuild.ManifestHash);this.directory=directory;Directory.CreateDirectory(Path.Combine(directory,"blobs"));Directory.CreateDirectory(Path.Combine(directory,"generations"));
        baseline=File.ReadAllBytes(Path.Combine(install,"resources.json"));
        if(Sha(baseline)!=ResourceBuild.ManifestHash)throw new IOException("客户端资源清单损坏，请重新安装完整客户端");
        Hash=ResourceBuild.ManifestHash;files=baselineFiles=Manifest(baseline);key.ImportFromPem(ResourceBuild.PublicKey);
        archive=ZipFile.OpenRead(Path.Combine(install,"resource-pack.zip"));
        foreach(var entry in archive.Entries){if(!Regex.IsMatch(entry.FullName,"^blobs/[a-f0-9]{64}$")||!embedded.TryAdd(entry.FullName[6..],entry))throw new IOException("资源包目录无效");}
    }
    public static string Sha(byte[] bytes)=>Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
    static bool ValidHash(string? hash)=>hash!=null&&Regex.IsMatch(hash,"^[a-f0-9]{64}$");
    static Dictionary<string,ResourceEntry> Manifest(byte[] bytes)
    {
        var doc=JsonNode.Parse(bytes)??throw new IOException("资源清单缺失");
        if((int?)doc["format"]!=1||(int?)doc["contract"]!=ResourceBuild.Contract||(string?)doc["clientLine"]!=ResourceBuild.ClientLine||(int?)doc["epoch"]!=ResourceBuild.Epoch)throw new IOException("资源代际不兼容，请安装新客户端");
        var list=doc["files"]?.AsArray()??throw new IOException("资源清单为空");if(list.Count<1||list.Count>100000)throw new IOException("资源数量无效");
        var result=new Dictionary<string,ResourceEntry>();string previous="";long total=0;
        foreach(var item in list){var p=(string?)item?["path"]??"";var hash=(string?)item?["sha256"];var size=(long?)item?["size"]??-1;var mime=(string?)item?["mime"]??"";
            if(!(Regex.IsMatch(p,"^/(assets|fonts|icons)/[A-Za-z0-9_@.,+~()!\\[\\]/-]+$")||p is "/data/assets.json" or "/data/local-assets.json" or "/data/local-fx.json")||p[1..].Split('/').Any(s=>s is "" or "." or "..")||string.CompareOrdinal(p,previous)<=0||!ValidHash(hash)||size<0||size>512L*1024*1024||!Regex.IsMatch(mime,"^[a-z0-9.+-]+/[a-z0-9.+-]+(; charset=utf-8)?$"))throw new IOException("资源条目无效");
            result.Add(p,new(p,hash!,size,mime));previous=p;total+=size;
        }
        if(total>8L*1024*1024*1024)throw new IOException("资源总量无效");return result;
    }
    (JsonNode Doc,byte[] Manifest,Dictionary<string,ResourceEntry> Files) Signed(byte[] envelope)
    {
        var e=JsonNode.Parse(envelope)??throw new IOException("更新清单为空");if((string?)e["algorithm"]!="RSA-SHA256")throw new IOException("不支持的更新签名");
        var payload=Convert.FromBase64String((string?)e["payload"]??"");
        if(payload.Length>24*1024*1024||!key.VerifyData(payload,Convert.FromBase64String((string?)e["signature"]??""),HashAlgorithmName.SHA256,RSASignaturePadding.Pkcs1))throw new IOException("资源更新签名校验失败");
        var doc=JsonNode.Parse(payload)??throw new IOException("更新清单无效");var bytes=Convert.FromBase64String((string?)doc["manifestBase64"]??"");
        if((int?)doc["format"]!=1||!ValidHash((string?)doc["from"])||Sha(bytes)!=(string?)doc["to"])throw new IOException("更新摘要不符");
        return(doc,bytes,Manifest(bytes));
    }
    public async Task Initialize(Action<string,long,long> progress)
    {
        await gate.WaitAsync();try{
            var unique=baselineFiles.Values.DistinctBy(f=>f.Hash).ToArray();int n=0;progress("校验本地资源",0,unique.Length);
            foreach(var entry in unique){if(!embedded.TryGetValue(entry.Hash,out var zip)||zip.Length!=entry.Size)throw new IOException("完整资源包缺少文件");using var stream=zip.Open();var digest=Convert.ToHexString(await SHA256.HashDataAsync(stream)).ToLowerInvariant();if(digest!=entry.Hash)throw new IOException("完整资源包内容校验失败");if(++n%100==0||n==unique.Length)progress("校验本地资源",n,unique.Length);}
            var pointer=Path.Combine(directory,"active.json");if(!File.Exists(pointer))return;
            var active=JsonNode.Parse(await File.ReadAllBytesAsync(pointer));var wanted=(string?)active?["current"];
            if(!ValidHash(wanted))throw new IOException("本地更新指针损坏");var seen=new HashSet<string>();var cursor=wanted;Dictionary<string,ResourceEntry>? newest=null;
            while(cursor!=ResourceBuild.ManifestHash){if(!seen.Add(cursor!)||seen.Count>64)throw new IOException("本地更新链无效");var signed=Signed(await File.ReadAllBytesAsync(Path.Combine(directory,"generations",cursor+".json")));if((string?)signed.Doc["to"]!=cursor)throw new IOException("更新代际不符");newest??=signed.Files;cursor=(string?)signed.Doc["from"];}
            if(newest!=null){var activeFiles=newest.Values.DistinctBy(f=>f.Hash).ToArray();n=0;progress("校验已更新资源",0,activeFiles.Length);foreach(var entry in activeFiles){await CheckAvailable(entry);if(++n%100==0||n==activeFiles.Length)progress("校验已更新资源",n,activeFiles.Length);}files=newest;Hash=wanted!;}
        }finally{gate.Release();}
    }
    async Task CheckAvailable(ResourceEntry entry)
    {
        if(embedded.TryGetValue(entry.Hash,out var zip)&&zip.Length==entry.Size)return;
        var filename=Path.Combine(directory,"blobs",entry.Hash);if(!File.Exists(filename)||new FileInfo(filename).Length!=entry.Size)throw new IOException("本地更新资源缺失，请重装客户端");
        using var stream=File.OpenRead(filename);if(Convert.ToHexString(await SHA256.HashDataAsync(stream)).ToLowerInvariant()!=entry.Hash)throw new IOException("本地更新资源损坏，请重装客户端");
    }
    public object Status()=>new{contract=ResourceBuild.Contract,clientLine=ResourceBuild.ClientLine,epoch=ResourceBuild.Epoch,build=ResourceBuild.Build,resourceHash=Hash};
    public async Task<object> Prepare(Uri server,string cookies,Action<string,long,long> progress)
    {
        await gate.WaitAsync();try{
            using var client=new HttpClient(new HttpClientHandler{AllowAutoRedirect=false}){Timeout=TimeSpan.FromMinutes(5)};client.DefaultRequestHeaders.UserAgent.ParseAdd(Agent);client.DefaultRequestHeaders.TryAddWithoutValidation("Cookie",cookies);
            async Task<byte[]> Get(string route,long max){using var response=await client.GetAsync(new Uri(server,route),HttpCompletionOption.ResponseHeadersRead);response.EnsureSuccessStatusCode();if(response.Content.Headers.ContentLength>max)throw new IOException("更新下载超出大小限制");using var source=await response.Content.ReadAsStreamAsync();using var output=new MemoryStream();var buffer=new byte[65536];int count;while((count=await source.ReadAsync(buffer))>0){if(output.Length+count>max)throw new IOException("更新下载过大");await output.WriteAsync(buffer.AsMemory(0,count));}return output.ToArray();}
            progress("检查兼容更新",-1,0);var policy=JsonNode.Parse(await Get("/product/client.json",1024*1024))??throw new IOException("服务器兼容信息无效");
            if((int?)policy["contract"]!=ResourceBuild.Contract||(string?)policy["clientLine"]!=ResourceBuild.ClientLine||(int?)policy["epoch"]!=ResourceBuild.Epoch||((int?)policy["minBuild"]??int.MaxValue)>ResourceBuild.Build)return new{action="installer"};
            var target=(string?)policy["resourceHash"];if(target==Hash){progress("资源已就绪",1,1);return new{action="ready"};}
            var update=policy["updates"]?.AsArray().FirstOrDefault(u=>(string?)u?["from"]==Hash&&(string?)u?["to"]==target);var id=(string?)update?["id"];
            if(!ValidHash(id))return new{action="installer"};
            var envelope=await Get("/client-updates/manifests/"+id+".json",32*1024*1024);if(Sha(envelope)!=id)throw new IOException("更新清单摘要不符");var signed=Signed(envelope);
            if((string?)signed.Doc["from"]!=Hash||(string?)signed.Doc["to"]!=target)throw new IOException("更新基线不符");
            var allowed=signed.Doc["blobs"]?.AsArray().Select(n=>(string?)n??"").ToHashSet()??throw new IOException("更新文件列表缺失");int n=0;var nextFiles=signed.Files.Values.DistinctBy(f=>f.Hash).ToArray();progress("核验与更新资源",0,nextFiles.Length);
            foreach(var entry in nextFiles){
                try{await CheckAvailable(entry);}catch(IOException){if(!allowed.Contains(entry.Hash))throw;progress("下载兼容更新",n,nextFiles.Length);var bytes=await Get("/client-updates/blobs/"+entry.Hash,entry.Size);if(bytes.LongLength!=entry.Size||Sha(bytes)!=entry.Hash)throw new IOException("资源更新 SHA256 校验失败");Atomic(Path.Combine(directory,"blobs",entry.Hash),bytes);}
                if(++n%100==0||n==nextFiles.Length)progress("核验与更新资源",n,nextFiles.Length);
            }
            Atomic(Path.Combine(directory,"generations",target+".json"),envelope);
            Atomic(Path.Combine(directory,"active.json"),Encoding.UTF8.GetBytes(new JsonObject{["format"]=1,["current"]=target,["previous"]=Hash}.ToJsonString()));files=signed.Files;Hash=target!;progress("资源已就绪",1,1);return new{action="ready"};
        }finally{gate.Release();}
    }
    static void Atomic(string filename,byte[] bytes){var temporary=filename+"."+Guid.NewGuid()+".tmp";try{using(var output=new FileStream(temporary,FileMode.CreateNew,FileAccess.Write,FileShare.None)){output.Write(bytes);output.Flush(true);}File.Move(temporary,filename,true);}finally{if(File.Exists(temporary))File.Delete(temporary);}}
    public static bool Fixed(string p)=>Regex.IsMatch(p,"^/(assets|fonts|icons|media)(/|$)")||p is "/data/assets.json" or "/data/local-assets.json" or "/data/local-fx.json";
    public async Task<(byte[] Bytes,string Mime)?> Read(string p)
    {
        await gate.WaitAsync();try{
            p=Uri.UnescapeDataString(p);if(p.Contains('\\')||p.Contains('%')||p[1..].Split('/').Any(s=>s is "." or ".."))return null;
            if(p.StartsWith("/media/")){var stem="/assets/audio/"+p[7..];p=new[]{".mp3",".ogg",".wav",".m4a",".aac"}.Select(ext=>stem+ext).FirstOrDefault(files.ContainsKey)??stem;}
            if(!files.TryGetValue(p,out var entry))return null;byte[] bytes;
            if(embedded.TryGetValue(entry.Hash,out var zip)){using var stream=zip.Open();using var output=new MemoryStream();await stream.CopyToAsync(output);bytes=output.ToArray();}else bytes=await File.ReadAllBytesAsync(Path.Combine(directory,"blobs",entry.Hash));
            if(bytes.LongLength!=entry.Size||Sha(bytes)!=entry.Hash)throw new IOException("本地资源损坏");return(bytes,entry.Mime);
        }finally{gate.Release();}
    }
    public void Dispose(){archive.Dispose();key.Dispose();gate.Dispose();}
}
