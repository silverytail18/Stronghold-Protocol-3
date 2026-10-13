package io.stronghold.protocol;

import android.content.Context;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;

/** Preflight runs before loading the game page, never during a match. No JavaScript bridge. */
public final class ResourcePackManager {
    public interface Progress { void show(String message); }
    private final Context context;
    private final String server;
    private final BlobStore blobs;
    private final File index;
    private volatile JSONObject active;
    private volatile Map<String,JSONObject> entries=Collections.emptyMap();
    public ResourcePackManager(Context context,String server) throws Exception {
        this.context=context;this.server=server;
        File root=new File(context.getFilesDir(),"resources");blobs=new BlobStore(new File(root,"files"));
        index=new File(root,BlobStore.hash(server.getBytes(StandardCharsets.UTF_8))+".json");
    }
    private HttpURLConnection connection(String route) throws Exception {
        return connection(route,0);
    }
    private HttpURLConnection connection(String route,long offset) throws Exception {
        URL url=new URL(new URL(server),route);if(!ServerPolicy.sameOrigin(server,url.toString()))throw new IOException("资源地址必须属于当前服务器");
        HttpURLConnection c=(HttpURLConnection)url.openConnection();c.setConnectTimeout(20000);c.setReadTimeout(60000);c.setInstanceFollowRedirects(false);
        c.setRequestProperty("User-Agent",ServerPolicy.APP_USER_AGENT+" StrongholdProtocolPack/1");c.setRequestProperty("Cache-Control","no-cache");
        if(offset>0)c.setRequestProperty("Range","bytes="+offset+"-");
        String cookie=CookieManager.getInstance().getCookie(server);if(cookie!=null)c.setRequestProperty("Cookie",cookie);
        if(c.getResponseCode()!=200&&!(offset>0&&c.getResponseCode()==206)){int code=c.getResponseCode();c.disconnect();throw new IOException(code==401?"请先登录":code==409?"服务器资源已更新，请重试":"无法下载资源（HTTP "+code+"）");}return c;
    }
    private byte[] read(String route,int limit) throws Exception {
        HttpURLConnection c=connection(route);try(InputStream in=c.getInputStream()){return bounded(in,limit);}finally{c.disconnect();}
    }
    private static byte[] bounded(InputStream in,int limit) throws Exception {
        ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1){if(out.size()+n>limit)throw new IOException("资源清单过大");out.write(b,0,n);}return out.toByteArray();
    }
    private static JSONObject json(byte[] bytes) throws Exception { return new JSONObject(new String(bytes,StandardCharsets.UTF_8)); }
    private static boolean fixed(String path) {
        if(path.contains("%")||path.contains("\\")||path.contains("?")||path.contains("#")||path.matches(".*(?:/\\.|//).*"))return false;
        return path.matches("/(assets|fonts|icons)/.+\\.(?i:png|jpe?g|gif|webp|avif|svg|ico|skel|atlas|mp3|ogg|oga|opus|wav|m4a|aac|woff2?|otf|ttf|bin|obj|mtl|json|css|txt)")
            || path.matches("/data/(assets|local-assets|bands|bonds|bosses|chess|choices|config|effects|emotes|enemies|factions|garrisons|items|stages|tokens|tuning|waves)\\.json");
    }
    private static Map<String,JSONObject> parse(JSONObject catalog) throws Exception {
        if(catalog.getInt("format")!=1||!catalog.getString("version").matches("[a-f0-9]{64}")||!catalog.getString("art").matches("[a-f0-9]{64}"))throw new IOException("资源包格式无效");
        JSONArray files=catalog.getJSONArray("files");if(files.length()>50000)throw new IOException("资源数量过大");
        Map<String,JSONObject> result=new HashMap<>();for(int i=0;i<files.length();i++){JSONObject f=files.getJSONObject(i);String path=f.getString("path"),hash=f.getString("hash"),mime=f.getString("mime");long size=f.getLong("size");
            if(!fixed(path)||!hash.matches("[a-f0-9]{64}")||size<=0||size>256L*1024*1024||mime.contains("\r")||mime.contains("\n")||result.put(path,f)!=null)throw new IOException("资源清单无效");
        }return result;
    }
    private static Map<String,Long> sizes(Map<String,JSONObject> files) throws Exception {Map<String,Long> result=new HashMap<>();for(JSONObject f:files.values())result.put(f.getString("hash"),f.getLong("size"));return result;}
    private void bundled(Progress progress) throws Exception {
        try(InputStream meta=context.getAssets().open("resource-catalog.json")){
            byte[] bytes=bounded(meta,16*1024*1024);JSONObject local=json(bytes);Map<String,JSONObject> files=parse(local);
            File marker=new File(index.getParentFile(),"bundled-"+BlobStore.hash(bytes));if(marker.isFile())return;
            progress.show("正在准备安装包内的资源…");
            try(InputStream zip=context.getAssets().open("resource-pack.zip")){blobs.importZip(zip,sizes(files));}
            BlobStore.atomicWrite(marker,new byte[]{1});
        }catch(FileNotFoundException missing){/* Small APK: download from the server. */}
    }
    public void prepare(Progress progress) throws Exception {
        JSONObject state=json(read("/app/resource-manifest",65536));JSONObject descriptor=state.optJSONObject("resourcePack");
        if(descriptor==null)throw new IOException("服务器尚未生成资源包，请联系服主更新服务器并运行 npm run resources:build。");
        JSONObject archiveInfo=descriptor.getJSONObject("archive");long archiveBytes=archiveInfo.getLong("bytes");
        if(!archiveInfo.getString("sha256").matches("[a-f0-9]{64}")||archiveBytes<=0||archiveBytes>0xffffffffL)throw new IOException("资源包描述无效");
        JSONObject catalogInfo=descriptor.getJSONObject("catalog");byte[] bytes=null;
        if(index.isFile()){byte[] local=Files.readAllBytes(index.toPath());if(BlobStore.hash(local).equals(catalogInfo.getString("sha256")))bytes=local;}
        if(bytes==null){try(InputStream in=context.getAssets().open("resource-catalog.json")){byte[] local=bounded(in,16*1024*1024);if(BlobStore.hash(local).equals(catalogInfo.getString("sha256")))bytes=local;}catch(FileNotFoundException missing){}}
        if(bytes==null)bytes=read(catalogInfo.getString("url"),16*1024*1024);
        if(!BlobStore.hash(bytes).equals(catalogInfo.getString("sha256")))throw new IOException("资源清单校验失败");
        JSONObject catalog=json(bytes);if(!catalog.getString("version").equals(descriptor.getString("version"))||!catalog.getString("art").equals(state.getString("art")))throw new IOException("资源版本不一致，请重试");
        Map<String,JSONObject> files=parse(catalog);Map<String,Long> wanted=sizes(files);List<String> missing=new ArrayList<>();
        progress.show("正在检查本地资源…");for(Map.Entry<String,Long> f:wanted.entrySet())if(!blobs.contains(f.getKey(),f.getValue()))missing.add(f.getKey());
        if(!missing.isEmpty()) {bundled(progress);missing.clear();for(Map.Entry<String,Long> f:wanted.entrySet())if(!blobs.contains(f.getKey(),f.getValue()))missing.add(f.getKey());}
        JSONObject archive=descriptor.getJSONObject("archive");File zip=new File(index.getParentFile(),archive.getString("sha256")+".download");
        // A partial cache downloads only missing blobs, even if an old ZIP download remains.
        if(!missing.isEmpty()&&missing.size()==wanted.size()){
            long expected=archive.getLong("bytes"),count=zip.isFile()?zip.length():0,last=0;
            if(count>expected){Files.deleteIfExists(zip.toPath());count=0;}
            HttpURLConnection c=null;java.security.MessageDigest hash=java.security.MessageDigest.getInstance("SHA-256");boolean installed=false;
            try {
                if(count<expected){c=connection(archive.getString("url"),count);if(c.getResponseCode()==200)count=0;else if(!String.valueOf(c.getHeaderField("Content-Range")).startsWith("bytes "+count+"-"))throw new IOException("断点续传响应无效");}
                if(count>0){try(InputStream old=new FileInputStream(zip)){byte[] b=new byte[65536];int n;while((n=old.read(b))!=-1)hash.update(b,0,n);}}
                if(c!=null){try(InputStream in=c.getInputStream();OutputStream out=new FileOutputStream(zip,count>0)){byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1){count+=n;if(count>expected){Files.deleteIfExists(zip.toPath());throw new IOException("数据包大小不匹配");}hash.update(b,0,n);out.write(b,0,n);if(System.currentTimeMillis()-last>250){progress.show(String.format(Locale.ROOT,"下载资源包：%.1f / %.1f MiB",count/1048576.0,expected/1048576.0));last=System.currentTimeMillis();}}}}
                StringBuilder hex=new StringBuilder();for(byte b:hash.digest())hex.append(String.format(Locale.ROOT,"%02x",b&255));if(count!=expected||!hex.toString().equals(archive.getString("sha256"))){Files.deleteIfExists(zip.toPath());throw new IOException("数据包校验失败，请重试");}
                progress.show("正在校验并安装资源包…");try(InputStream in=new FileInputStream(zip)){blobs.importZip(in,wanted);}
                installed=true;
            }finally{if(c!=null)c.disconnect();if(installed)Files.deleteIfExists(zip.toPath());}
        }else{int done=0;for(String h:missing){progress.show("更新资源："+(++done)+" / "+missing.size());HttpURLConnection c=connection("/app/resource-file/"+h);try(InputStream in=c.getInputStream()){blobs.put(h,wanted.get(h),in);}finally{c.disconnect();}}}
        for(Map.Entry<String,Long> f:wanted.entrySet())if(!blobs.contains(f.getKey(),f.getValue()))throw new IOException("资源包尚未完整，请重试");
        // Publish the new index only after every file validates. Interrupted updates leave the old index intact.
        BlobStore.atomicWrite(index,bytes);entries=Collections.unmodifiableMap(files);active=catalog;
    }
    public WebResourceResponse intercept(WebResourceRequest request) {
        String target=request.getUrl().toString();if(!ServerPolicy.sameOrigin(server,target))return null;
        String path=request.getUrl().getPath();if(!request.getMethod().equals("GET")&&!request.getMethod().equals("HEAD"))return null;
        try {
            if(path.equals("/app/resource-manifest")&&active!=null){JSONObject state=json(read(path,65536));state.put("installedPack",active.getString("version"));byte[] body=state.toString().getBytes(StandardCharsets.UTF_8);
                return new WebResourceResponse("application/json","UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-store"),new ByteArrayInputStream(body));}
            boolean versioned=path.startsWith("/app-cache/"),media=path.startsWith("/media/");
            boolean fixed=path.startsWith("/assets/")||path.startsWith("/fonts/")||path.startsWith("/icons/")||path.startsWith("/data/");
            if(active==null){if(versioned||media||fixed)throw new IOException("资源尚未准备，请回大厅更新");return null;}
            if(versioned){String prefix="/app-cache/"+active.getString("art");if(!path.startsWith(prefix+"/"))throw new IOException("资源版本不一致，请回大厅更新");path=path.substring(prefix.length());}
            if(media){String[] extensions={".mp3",".m4a",".aac",".ogg",".oga",".opus",".wav"};String original="/assets/audio/"+path.substring(7);for(String ext:extensions)if(original.endsWith(ext)){original=original.substring(0,original.length()-ext.length());break;}path=original+".mp3";for(String ext:extensions)if(entries.containsKey(original+ext)){path=original+ext;break;}}
            JSONObject f=entries.get(path);if(f==null){if(versioned||media||fixed)throw new IOException("本地资源缺失，请回大厅更新");return null;}
            File file=blobs.file(f.getString("hash"));if(!file.isFile()||file.length()!=f.getLong("size"))return new WebResourceResponse("text/plain","UTF-8",503,"Missing resource",Collections.singletonMap("Cache-Control","no-store"),new ByteArrayInputStream("本地资源损坏，请回大厅更新".getBytes(StandardCharsets.UTF_8)));
            Map<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-store");headers.put("Content-Length",String.valueOf(file.length()));headers.put("X-Stronghold-Resource","local");
            return new WebResourceResponse(f.getString("mime"),null,200,"OK",headers,request.getMethod().equals("HEAD")?new ByteArrayInputStream(new byte[0]):new FileInputStream(file));
        }catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",503,"Resource error",Collections.singletonMap("Cache-Control","no-store"),new ByteArrayInputStream(e.getMessage().getBytes(StandardCharsets.UTF_8)));}
    }
}
