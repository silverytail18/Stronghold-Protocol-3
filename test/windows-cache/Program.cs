using Stronghold.Protocol;
Console.OutputEncoding=System.Text.Encoding.UTF8;
var server=new Uri(args[0]);var cache=new ResourceCache(server,args[1]);
await cache.Prepare(_=>{},args[2].Length>0?args[2]:null);
var version=cache.Version;await cache.Prepare(_=>{},args[2].Length>0?args[2]:null);
if(cache.Version!=version)throw new Exception("Version changed unexpectedly");
var index=Path.Combine(args[1],ResourceCache.Hash(System.Text.Encoding.UTF8.GetBytes(server.AbsoluteUri))+".json");
var catalog=System.Text.Json.Nodes.JsonNode.Parse(await File.ReadAllBytesAsync(index))!;int checkedFiles=0;
foreach(var entry in catalog["files"]!.AsArray()){
    var path=entry!["path"]!.GetValue<string>();var hash=entry["hash"]!.GetValue<string>();var size=entry["size"]!.GetValue<long>();
    var encoded=string.Join("/",path.Split('/').Select(Uri.EscapeDataString));
    foreach(var route in new[]{path,encoded+"?v=123","/app-cache/"+cache.Art+encoded+"?v=123"}){
        var result=cache.Local(new Uri(server,route))??throw new Exception("No local resource: "+route);
        using var memory=new MemoryStream();await result.body.CopyToAsync(memory);result.body.Dispose();
        if(memory.Length!=size||ResourceCache.Hash(memory.ToArray())!=hash)throw new Exception("Bad cached resource: "+route);
    }
    var head=cache.Local(new Uri(server,encoded),true)??throw new Exception("No local HEAD");
    if(head.size!=size||head.body.Length!=0)throw new Exception("Bad local HEAD");head.body.Dispose();checkedFiles++;
}
foreach(var route in new[]{"/assets/board/missing.png","/app-cache/"+new string('0',64)+"/assets/board/test.png"}){
    try{cache.Local(new Uri(server,route));throw new Exception("Resource miss silently fell through to HTTP");}catch(IOException){}
}
if(catalog["files"]!.AsArray().Any(e=>e!["path"]!.GetValue<string>()=="/assets/audio/bgm/test.mp3")){
    foreach(var route in new[]{"media/bgm/test?v=123","media/bgm/test.mp3?v=123"}){var alias=cache.Local(new Uri(server,route))??throw new Exception("Audio alias fell through to HTTP");alias.body.Dispose();}
}
if(cache.Local(new Uri(server,"auth/session"))!=null||cache.Local(new Uri("https://foreign.invalid/assets/board/test.png"))!=null)throw new Exception("Private/foreign request intercepted");
Console.WriteLine("Windows local resource checks passed "+cache.Version+"; verified "+checkedFiles+" paths, encoded/versioned/query/HEAD variants");
