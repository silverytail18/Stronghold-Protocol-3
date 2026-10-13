package io.stronghold.protocol;

import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.*;

/** Content-addressed durable files, independent of WebView's evictable HTTP cache. */
public final class BlobStore {
    private final File root;
    private final Map<String, String> verified = new ConcurrentHashMap<>();
    public BlobStore(File directory) throws IOException { root = directory; Files.createDirectories(root.toPath()); }
    public static String hash(byte[] bytes) throws Exception { return hex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static String hex(byte[] bytes) { StringBuilder b = new StringBuilder(); for(byte v:bytes)b.append(String.format(Locale.ROOT,"%02x",v&255));return b.toString(); }
    public File file(String hash) throws IOException { if(!hash.matches("[a-f0-9]{64}"))throw new IOException("无效资源哈希");return new File(root,hash); }
    public boolean contains(String hash, long size) throws Exception {
        File f=file(hash);if(!f.isFile()||f.length()!=size)return false;
        String stamp=f.length()+":"+f.lastModified();if(stamp.equals(verified.get(hash)))return true;
        MessageDigest digest=MessageDigest.getInstance("SHA-256");try(InputStream in=new FileInputStream(f)){byte[] buffer=new byte[65536];int n;while((n=in.read(buffer))!=-1)digest.update(buffer,0,n);}
        if(!hex(digest.digest()).equals(hash))return false;verified.put(hash,stamp);return true;
    }
    public void put(String hash,long size,InputStream input) throws Exception {
        if(size<=0||size>256L*1024*1024)throw new IOException("资源大小无效");
        File target=file(hash),temp=new File(root,hash+"."+System.nanoTime()+".part");
        MessageDigest digest=MessageDigest.getInstance("SHA-256");long count=0;
        try {
            try(OutputStream out=new FileOutputStream(temp)){byte[] b=new byte[65536];int n;while((n=input.read(b))!=-1){count+=n;if(count>size)throw new IOException("资源大小不匹配");digest.update(b,0,n);out.write(b,0,n);}}
            if(count!=size||!hex(digest.digest()).equals(hash))throw new IOException("资源校验失败，请重试");
            Files.move(temp.toPath(),target.toPath(),StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);
            verified.put(hash,target.length()+":"+target.lastModified());
        } finally { Files.deleteIfExists(temp.toPath()); }
    }
    public void importZip(InputStream input,Map<String,Long> allowed) throws Exception {
        Set<String> seen=new HashSet<>();try(ZipInputStream zip=new ZipInputStream(new BufferedInputStream(input))){ZipEntry e;
            while((e=zip.getNextEntry())!=null){String name=e.getName();
                if(name.equals("catalog.json")){long n=0;byte[] b=new byte[8192];int r;while((r=zip.read(b))!=-1){n+=r;if(n>16L*1024*1024)throw new IOException("资源清单过大");}continue;}
                if(!name.matches("files/[a-f0-9]{64}")||!seen.add(name))throw new IOException("资源包包含无效路径");
                String hash=name.substring(6);Long size=allowed.get(hash);if(size==null)throw new IOException("资源包包含未知文件");
                if(!contains(hash,size))put(hash,size,zip);zip.closeEntry();
            }
        }
    }
    public static void atomicWrite(File file,byte[] bytes) throws IOException {
        Files.createDirectories(file.getParentFile().toPath());File temp=new File(file.getParentFile(),file.getName()+".tmp");
        try{Files.write(temp.toPath(),bytes);Files.move(temp.toPath(),file.toPath(),StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);}finally{Files.deleteIfExists(temp.toPath());}
    }
}
