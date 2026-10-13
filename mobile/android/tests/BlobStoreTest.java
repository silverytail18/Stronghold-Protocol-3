package io.stronghold.protocol;
import java.io.*;
import java.nio.file.*;
import java.util.*;
public final class BlobStoreTest {
    public static void main(String[] args) throws Exception {
        BlobStore store=new BlobStore(new File(args[2]));Map<String,Long> sizes=new HashMap<>();for(String line:Files.readAllLines(Paths.get(args[1]))){String[] parts=line.split(" ");sizes.put(parts[0],Long.parseLong(parts[1]));}
        try(InputStream in=new FileInputStream(args[0])){store.importZip(in,sizes);}for(Map.Entry<String,Long> e:sizes.entrySet())if(!store.contains(e.getKey(),e.getValue()))throw new AssertionError("missing blob");
        try(InputStream in=new FileInputStream(args[3])){try{store.importZip(in,sizes);throw new AssertionError("traversal accepted");}catch(IOException expected){}}
        String h=sizes.keySet().iterator().next();byte[] original=Files.readAllBytes(store.file(h).toPath());
        try{store.put(h,sizes.get(h),new ByteArrayInputStream(new byte[]{1,2}));throw new AssertionError("invalid payload accepted");}catch(IOException expected){}
        if(!Arrays.equals(original,Files.readAllBytes(store.file(h).toPath())))throw new AssertionError("old blob lost");
        if(new File(args[2],"escape").exists())throw new AssertionError("escaped archive");
        System.out.println("Android blob/archive integrity checks passed");
    }
}
