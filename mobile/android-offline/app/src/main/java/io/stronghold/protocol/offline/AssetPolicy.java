package io.stronghold.protocol.offline;
import java.net.URI;
import java.util.Locale;
// Shared by native serving and plain-Java packaging tests; rejects unknown origins and private paths.
public final class AssetPolicy {
    public static final String ORIGIN="https://offline.stronghold.invalid";
    public static String entry(String url) {
        try {
            URI uri=new URI(url);
            if(!"https".equals(uri.getScheme())||!"offline.stronghold.invalid".equals(uri.getHost())||uri.getPort()!=-1||uri.getUserInfo()!=null)return null;
            String raw=uri.getRawPath(),p=uri.getPath();
            if(raw==null||p==null||raw.toLowerCase(Locale.ROOT).contains("%2f")||raw.toLowerCase(Locale.ROOT).contains("%5c")||p.contains("\\")||p.indexOf('\0')>=0)return null;
            for(String part:p.split("/",-1))if("..".equals(part)||".".equals(part)||part.startsWith("."))return null;
            if("/".equals(p)||"/index.html".equals(p))return "assets/web/index.html";
            if("/data.js".equals(p))return "assets/web/data.js";
            if(!(p.startsWith("/offline/")||p.startsWith("/assets/")||p.startsWith("/data/")||p.startsWith("/js/")||p.startsWith("/css/")||p.startsWith("/vendor/")||p.startsWith("/fonts/")||p.startsWith("/icons/")||p.startsWith("/shared/")||p.startsWith("/sim/")))return null;
            return "assets/web"+p;
        } catch(Exception e){return null;}
    }
    public static String mime(String name) {
        String n=name.toLowerCase(Locale.ROOT);
        if(n.endsWith(".html"))return "text/html";
        if(n.endsWith(".js")||n.endsWith(".mjs"))return "text/javascript";
        if(n.endsWith(".css"))return "text/css";
        if(n.endsWith(".json"))return "application/json";
        if(n.endsWith(".png"))return "image/png";
        if(n.endsWith(".jpg")||n.endsWith(".jpeg"))return "image/jpeg";
        if(n.endsWith(".webp"))return "image/webp";
        if(n.endsWith(".svg"))return "image/svg+xml";
        if(n.endsWith(".mp3"))return "audio/mpeg";
        if(n.endsWith(".ogg")||n.endsWith(".oga"))return "audio/ogg";
        if(n.endsWith(".wav"))return "audio/wav";
        if(n.endsWith(".woff2"))return "font/woff2";
        if(n.endsWith(".woff"))return "font/woff";
        if(n.endsWith(".ttf"))return "font/ttf";
        if(n.endsWith(".otf"))return "font/otf";
        if(n.endsWith(".atlas")||n.endsWith(".txt")||n.endsWith(".obj")||n.endsWith(".mtl"))return "text/plain";
        return "application/octet-stream";
    }
    public static long[] range(String header,long size) {
        if(header==null)return new long[]{0,size-1};
        try {
            if(!header.startsWith("bytes=")||header.contains(","))return null;
            String[] p=header.substring(6).split("-",-1);if(p.length!=2||size<=0)return null;
            long start,end;
            if(p[0].isEmpty()){long suffix=Long.parseLong(p[1]);if(suffix<=0)return null;start=Math.max(0,size-suffix);end=size-1;}
            else{start=Long.parseLong(p[0]);end=p[1].isEmpty()?size-1:Math.min(size-1,Long.parseLong(p[1]));}
            if(start<0||start>=size||end<start)return null;
            return new long[]{start,end};
        }catch(Exception e){return null;}
    }
}
