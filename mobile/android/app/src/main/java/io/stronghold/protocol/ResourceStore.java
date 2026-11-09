package io.stronghold.protocol;
import android.content.Context;
import android.webkit.WebResourceResponse;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import java.util.zip.*;

final class ResourceStore {
  private final File directory;
  private final ZipFile zip;
  private final PublicKey publicKey;
  private Map<String,Entry> files;
  private final Set<String> embedded=new HashSet<>();
  private String hash=ResourceBuild.MANIFEST_HASH;
  static final class Entry {String path,hash,mime;long size;Entry(JSONObject doc)throws Exception{path=doc.getString("path");hash=doc.getString("sha256");size=doc.getLong("size");mime=doc.getString("mime");}}
  interface Progress {void update(String text,long completed,long total);}
  ResourceStore(Context context,Progress progress)throws Exception {
    directory=new File(context.getFilesDir(),"resources-v2/"+ResourceBuild.MANIFEST_HASH);new File(directory,"blobs").mkdirs();new File(directory,"generations").mkdirs();
    byte[] baseline=read(context.getAssets().open("resources.json"),32*1024*1024);
    if(!sha(baseline).equals(hash))throw new IOException("客户端资源清单损坏，请重装完整客户端");files=manifest(baseline);
    publicKey=KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(ResourceBuild.PUBLIC_KEY)));
    File archive=new File(directory,"baseline-"+hash+".zip");
    if(!archive.isFile()){progress.update("首次安装，正在准备完整资源…",-1,0);File temporary=new File(archive+".tmp");try(InputStream input=context.getAssets().open("resource-pack.zip");FileOutputStream output=new FileOutputStream(temporary)){copy(input,output,8L*1024*1024*1024);output.getFD().sync();}Files.move(temporary.toPath(),archive.toPath(),StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);}
    zip=new ZipFile(archive);Enumeration<? extends ZipEntry> entries=zip.entries();while(entries.hasMoreElements()){ZipEntry entry=entries.nextElement();String name=entry.getName();if(!name.matches("blobs/[a-f0-9]{64}")||!embedded.add(name.substring(6)))throw new IOException("完整资源包目录无效");}
    Set<String> hashes=new HashSet<>();for(Entry entry:files.values())hashes.add(entry.hash);Set<String> checked=new HashSet<>();int n=0;progress.update("校验本地资源",0,hashes.size());for(Entry entry:files.values()){if(!checked.add(entry.hash))continue;ZipEntry item=zip.getEntry("blobs/"+entry.hash);if(item==null||item.getSize()!=entry.size)throw new IOException("完整资源包缺失文件");try(InputStream input=zip.getInputStream(item)){if(!shaStream(input).equals(entry.hash))throw new IOException("完整资源包校验失败");}if(++n%100==0||n==hashes.size())progress.update("校验本地资源",n,hashes.size());}
    File pointer=new File(directory,"active.json");if(pointer.isFile()){
      String wanted=new JSONObject(new String(read(new FileInputStream(pointer),8192),StandardCharsets.UTF_8)).getString("current");if(!validHash(wanted))throw new IOException("本地更新指针无效");String cursor=wanted;Set<String> seen=new HashSet<>();Map<String,Entry> newest=null;
      while(!cursor.equals(ResourceBuild.MANIFEST_HASH)){if(!seen.add(cursor)||seen.size()>64)throw new IOException("本地更新链无效");JSONObject doc=signed(read(new FileInputStream(new File(directory,"generations/"+cursor+".json")),32*1024*1024));if(!doc.getString("to").equals(cursor))throw new IOException("更新代际不符");if(newest==null)newest=manifest(Base64.getDecoder().decode(doc.getString("manifestBase64")));cursor=doc.getString("from");}
      if(newest!=null){n=0;progress.update("校验已更新资源",0,newest.size());for(Entry entry:newest.values()){available(entry);if(++n%100==0||n==newest.size())progress.update("校验已更新资源",n,newest.size());}files=newest;hash=wanted;}
    }
  }
  synchronized String agent(){return "StrongholdProtocolApp/"+ResourceBuild.CONTRACT+" Resources/"+hash+" ClientLine/"+ResourceBuild.CLIENT_LINE+" Build/"+ResourceBuild.BUILD+" Epoch/"+ResourceBuild.EPOCH;}
  synchronized JSONObject status()throws Exception{return new JSONObject().put("contract",ResourceBuild.CONTRACT).put("clientLine",ResourceBuild.CLIENT_LINE).put("epoch",ResourceBuild.EPOCH).put("build",ResourceBuild.BUILD).put("resourceHash",hash);}
  private static boolean validHash(String value){return value!=null&&value.matches("[a-f0-9]{64}");}
  static String sha(byte[] bytes)throws Exception{return hex(MessageDigest.getInstance("SHA-256").digest(bytes));}
  static String hex(byte[] bytes){StringBuilder result=new StringBuilder();for(byte b:bytes)result.append(String.format(Locale.ROOT,"%02x",b&255));return result.toString();}
  static String shaStream(InputStream input)throws Exception{MessageDigest digest=MessageDigest.getInstance("SHA-256");byte[] buffer=new byte[65536];int count;while((count=input.read(buffer))!=-1)digest.update(buffer,0,count);return hex(digest.digest());}
  static byte[] read(InputStream input,long max)throws IOException{try(InputStream source=input;ByteArrayOutputStream output=new ByteArrayOutputStream()){copy(source,output,max);return output.toByteArray();}}
  static void copy(InputStream input,OutputStream output,long max)throws IOException{byte[] buffer=new byte[65536];int count;long size=0;while((count=input.read(buffer))!=-1){size+=count;if(size>max)throw new IOException("资源超过大小限制");output.write(buffer,0,count);}}
  private static Map<String,Entry> manifest(byte[] bytes)throws Exception{
    JSONObject doc=new JSONObject(new String(bytes,StandardCharsets.UTF_8));if(doc.getInt("format")!=1||doc.getInt("contract")!=ResourceBuild.CONTRACT||!doc.getString("clientLine").equals(ResourceBuild.CLIENT_LINE)||doc.getInt("epoch")!=ResourceBuild.EPOCH)throw new IOException("资源代际不兼容，需要新客户端");
    JSONArray list=doc.getJSONArray("files");if(list.length()<1||list.length()>100000)throw new IOException("资源数量无效");Map<String,Entry> result=new LinkedHashMap<>();String previous="";long total=0;
    for(int i=0;i<list.length();i++){Entry entry=new Entry(list.getJSONObject(i));String p=entry.path;if(!(p.matches("/(assets|fonts|icons)/[A-Za-z0-9_@.,+~()!\\[\\]/-]+")||p.matches("/data/(assets|local-assets|local-fx)\\.json"))||p.contains("//")||p.matches(".*(?:^|/)\\.\\.?(?:/|$).*")||p.compareTo(previous)<=0||!validHash(entry.hash)||entry.size<0||entry.size>512L*1024*1024||!entry.mime.matches("[a-z0-9.+-]+/[a-z0-9.+-]+(; charset=utf-8)?"))throw new IOException("资源条目无效");result.put(p,entry);previous=p;total+=entry.size;}
    if(total>8L*1024*1024*1024)throw new IOException("资源总量无效");return result;
  }
  private JSONObject signed(byte[] envelope)throws Exception{
    JSONObject e=new JSONObject(new String(envelope,StandardCharsets.UTF_8));if(!e.getString("algorithm").equals("RSA-SHA256"))throw new IOException("不支持的更新签名");byte[] payload=Base64.getDecoder().decode(e.getString("payload"));if(payload.length>24*1024*1024)throw new IOException("更新清单过大");Signature signature=Signature.getInstance("SHA256withRSA");signature.initVerify(publicKey);signature.update(payload);if(!signature.verify(Base64.getDecoder().decode(e.getString("signature"))))throw new IOException("资源更新签名校验失败");
    JSONObject doc=new JSONObject(new String(payload,StandardCharsets.UTF_8));byte[] bytes=Base64.getDecoder().decode(doc.getString("manifestBase64"));if(doc.getInt("format")!=1||!validHash(doc.getString("from"))||!sha(bytes).equals(doc.getString("to")))throw new IOException("资源更新摘要不符");manifest(bytes);return doc;
  }
  private void available(Entry entry)throws Exception{
    ZipEntry item=zip.getEntry("blobs/"+entry.hash);if(item!=null&&item.getSize()==entry.size)return;
    File file=new File(directory,"blobs/"+entry.hash);if(!file.isFile()||file.length()!=entry.size)throw new IOException("本地更新资源缺失，请重装客户端");try(InputStream input=new FileInputStream(file)){if(!shaStream(input).equals(entry.hash))throw new IOException("本地更新资源损坏，请重装客户端");}
  }
  private byte[] get(URI server,String route,String cookie,long max)throws Exception{
    HttpURLConnection connection=(HttpURLConnection)server.resolve(route).toURL().openConnection();connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(30000);connection.setReadTimeout(120000);connection.setRequestProperty("User-Agent",agent());connection.setRequestProperty("Cookie",cookie==null?"":cookie);
    try{if(connection.getResponseCode()!=200)throw new IOException("资源下载失败 HTTP "+connection.getResponseCode());if(connection.getContentLengthLong()>max)throw new IOException("更新资源过大");return read(connection.getInputStream(),max);}finally{connection.disconnect();}
  }
  synchronized JSONObject prepare(URI server,String cookie,Progress progress)throws Exception{
    progress.update("检查兼容更新",-1,0);JSONObject policy=new JSONObject(new String(get(server,"/product/client.json",cookie,1024*1024),StandardCharsets.UTF_8));
    if(policy.optInt("contract")!=ResourceBuild.CONTRACT||!policy.optString("clientLine").equals(ResourceBuild.CLIENT_LINE)||policy.optInt("epoch")!=ResourceBuild.EPOCH||policy.optInt("minBuild",Integer.MAX_VALUE)>ResourceBuild.BUILD)return new JSONObject().put("action","installer");
    String target=policy.getString("resourceHash");if(target.equals(hash)){progress.update("资源已就绪",1,1);return new JSONObject().put("action","ready");}JSONArray updates=policy.getJSONArray("updates");String id=null;
    for(int i=0;i<updates.length();i++){JSONObject update=updates.getJSONObject(i);if(update.optString("from").equals(hash)&&update.optString("to").equals(target)){id=update.optString("id");break;}}
    if(!validHash(id))return new JSONObject().put("action","installer");
    byte[] envelope=get(server,"/client-updates/manifests/"+id+".json",cookie,32*1024*1024);if(!sha(envelope).equals(id))throw new IOException("资源更新清单摘要不符");JSONObject doc=signed(envelope);if(!doc.getString("from").equals(hash)||!doc.getString("to").equals(target))throw new IOException("更新基线不符");
    Map<String,Entry> next=manifest(Base64.getDecoder().decode(doc.getString("manifestBase64")));Set<String> allowed=new HashSet<>();JSONArray blobs=doc.getJSONArray("blobs");for(int i=0;i<blobs.length();i++)allowed.add(blobs.getString(i));int n=0;
    progress.update("核验与更新资源",0,next.size());for(Entry entry:next.values()){try{available(entry);}catch(IOException error){if(!allowed.contains(entry.hash))throw error;progress.update("下载兼容更新",n,next.size());byte[] bytes=get(server,"/client-updates/blobs/"+entry.hash,cookie,entry.size);if(bytes.length!=entry.size||!sha(bytes).equals(entry.hash))throw new IOException("资源更新 SHA256 校验失败");atomic(new File(directory,"blobs/"+entry.hash),bytes);}if(++n%100==0||n==next.size())progress.update("核验与更新资源",n,next.size());}
    atomic(new File(directory,"generations/"+target+".json"),envelope);atomic(new File(directory,"active.json"),new JSONObject().put("format",1).put("current",target).put("previous",hash).toString().getBytes(StandardCharsets.UTF_8));files=next;hash=target;progress.update("资源已就绪",1,1);return new JSONObject().put("action","ready");
  }
  static void atomic(File file,byte[] bytes)throws Exception{File temporary=new File(file+"."+UUID.randomUUID()+".tmp");try{try(FileOutputStream output=new FileOutputStream(temporary)){output.write(bytes);output.getFD().sync();}Files.move(temporary.toPath(),file.toPath(),StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);}finally{temporary.delete();}}
  static boolean fixed(String p){return p.matches("^/(assets|fonts|icons|media)(/.*)?$")||p.matches("/data/(assets|local-assets|local-fx)\\.json");}
  synchronized WebResourceResponse response(String raw,String method,String range)throws Exception{
    String p=URLDecoder.decode(raw.replace("+","%2B"),"UTF-8");if(p.contains("\\")||p.contains("%"))return error(404);for(String part:p.split("/"))if(part.equals(".")||part.equals(".."))return error(404);
    if(p.startsWith("/media/")){String stem="/assets/audio/"+p.substring(7);p=stem;for(String ext:new String[]{".mp3",".ogg",".wav",".m4a",".aac"})if(files.containsKey(stem+ext)){p=stem+ext;break;}}
    Entry entry=files.get(p);if(entry==null)return error(404);byte[] bytes;ZipEntry item=zip.getEntry("blobs/"+entry.hash);bytes=read(item!=null?zip.getInputStream(item):new FileInputStream(new File(directory,"blobs/"+entry.hash)),entry.size);if(bytes.length!=entry.size||!sha(bytes).equals(entry.hash))return error(503);
    int start=0,end=bytes.length-1,code=200;Map<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-store");headers.put("Accept-Ranges","bytes");headers.put("X-Stronghold-Resource","local");
    if(range!=null){java.util.regex.Matcher m=java.util.regex.Pattern.compile("bytes=(\\d*)-(\\d*)").matcher(range);if(!m.matches()||m.group(1).isEmpty()&&m.group(2).isEmpty())return error(416);if(m.group(1).isEmpty())start=(int)Math.max(0,bytes.length-Long.parseLong(m.group(2)));else{start=(int)Math.min(Integer.MAX_VALUE,Long.parseLong(m.group(1)));if(!m.group(2).isEmpty())end=(int)Math.min(end,Long.parseLong(m.group(2)));}if(start>end)return error(416);code=206;headers.put("Content-Range","bytes "+start+"-"+end+"/"+bytes.length);}
    headers.put("Content-Length",String.valueOf(end-start+1));String[] mime=entry.mime.split(";");return new WebResourceResponse(mime[0],mime[0].startsWith("text/")||mime[0].equals("application/json")?"UTF-8":null,code,code==206?"Partial Content":"OK",headers,new ByteArrayInputStream(method.equals("HEAD")?new byte[0]:Arrays.copyOfRange(bytes,start,end+1)));
  }
  static WebResourceResponse error(int status){return new WebResourceResponse("text/plain","UTF-8",status,"Resource unavailable",Collections.singletonMap("Cache-Control","no-store"),new ByteArrayInputStream(new byte[0]));}
  void close()throws IOException{zip.close();}
}
