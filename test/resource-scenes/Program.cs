using Stronghold.Protocol;
using System.Text.Json.Nodes;
using System.Text;

Console.OutputEncoding=Encoding.UTF8;
var origin=new Uri(args[0]);var cache=new ResourceCache(origin,args[1]);
await cache.Prepare(_=>{},args[2]);
Console.WriteLine(new JsonObject{{"ready",true},{"art",cache.Art},{"version",cache.Version}}.ToJsonString());
// A test-only transport for the same native Local() call used by WebView2's request callback.
// It does not serve files itself, and has no remote-file fallback.
string? line;
while((line=Console.ReadLine())!=null){
    var request=JsonNode.Parse(line)!;var response=new JsonObject{{"id",request["id"]!.GetValue<int>()}};
    try{
        var route=request["route"]!.GetValue<string>();byte[] bytes;string mime;
        if(route=="/app/resource-manifest"){
            var state=JsonNode.Parse(await cache.Read(route,65536))!;state["installedPack"]=cache.Version;
            bytes=Encoding.UTF8.GetBytes(state.ToJsonString());mime="application/json";
        }else{
            var local=cache.Local(new Uri(origin,route),request["head"]?.GetValue<bool>()==true)??throw new IOException("Resource bypassed native cache: "+route);
            using var stream=local.body;using var memory=new MemoryStream();await stream.CopyToAsync(memory);bytes=memory.ToArray();mime=local.mime;
        }
        response["status"]=200;response["mime"]=mime;response["body"]=Convert.ToBase64String(bytes);
    }catch(Exception error){response["status"]=503;response["mime"]="text/plain; charset=utf-8";response["body"]=Convert.ToBase64String(Encoding.UTF8.GetBytes(error.Message));}
    Console.WriteLine(response.ToJsonString());
}
