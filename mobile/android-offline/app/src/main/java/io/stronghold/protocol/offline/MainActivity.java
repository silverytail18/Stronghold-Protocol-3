package io.stronghold.protocol.offline;
import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import java.io.*;
import java.util.*;
import java.util.zip.*;

public final class MainActivity extends Activity {
    private WebView web;
    private ZipFile apk;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        try{apk=new ZipFile(getApplicationInfo().sourceDir);}catch(IOException error){new AlertDialog.Builder(this).setMessage("无法读取单机资源，请重新安装。 ").setPositiveButton("退出",(d,w)->finish()).show();return;}
        web=new WebView(this);setContentView(web);
        WebSettings s=web.getSettings();
        s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);s.setSupportMultipleWindows(false);
        s.setMediaPlaybackRequiresUserGesture(false);s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return true;}
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){return serve(request);}
            @Override public void onReceivedSslError(WebView view,android.webkit.SslErrorHandler handler,android.net.http.SslError error){handler.cancel();}
        });
        fullscreen();web.loadUrl(AssetPolicy.ORIGIN+"/");
    }
    private void fullscreen(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_STABLE|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);}
    @Override public void onWindowFocusChanged(boolean focused){super.onWindowFocusChanged(focused);if(focused)fullscreen();}
    private WebResourceResponse error(int code,String reason,Map<String,String> headers){return new WebResourceResponse("text/plain","UTF-8",code,reason,headers,new ByteArrayInputStream(new byte[0]));}
    private WebResourceResponse serve(WebResourceRequest request) {
        String entryName=AssetPolicy.entry(request.getUrl().toString());
        Map<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-store");headers.put("X-Content-Type-Options","nosniff");
        if(entryName==null)return error(403,"Forbidden",headers);
        String method=request.getMethod();if(!"GET".equals(method)&&!"HEAD".equals(method))return error(405,"Method Not Allowed",headers);
        try {
            ZipEntry entry=apk.getEntry(entryName);if(entry==null||entry.isDirectory())return error(404,"Not Found",headers);
            long size=entry.getSize();String rangeHeader=null;
            for(Map.Entry<String,String> h:request.getRequestHeaders().entrySet())if("range".equalsIgnoreCase(h.getKey()))rangeHeader=h.getValue();
            long[] range=AssetPolicy.range(rangeHeader,size);headers.put("Accept-Ranges","bytes");
            if(range==null){headers.put("Content-Range","bytes */"+size);return error(416,"Range Not Satisfiable",headers);}
            final long length=size==0?0:range[1]-range[0]+1;
            headers.put("Content-Length",Long.toString(length));
            if(rangeHeader!=null)headers.put("Content-Range","bytes "+range[0]+"-"+range[1]+"/"+size);
            if(entryName.endsWith("/index.html"))headers.put("Content-Security-Policy","default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'");
            InputStream stream;
            if("HEAD".equals(method))stream=new ByteArrayInputStream(new byte[0]);
            else{
                InputStream raw=apk.getInputStream(entry);
                long skip=range[0];while(skip>0){long n=raw.skip(skip);if(n<=0){if(raw.read()<0){raw.close();return error(500,"Read Error",headers);}n=1;}skip-=n;}
                stream=new FilterInputStream(raw){long remaining=length;
                    @Override public int read()throws IOException{if(remaining<=0)return -1;int n=super.read();if(n>=0)remaining--;return n;}
                    @Override public int read(byte[] b,int o,int n)throws IOException{if(remaining<=0)return -1;int r=in.read(b,o,(int)Math.min(n,remaining));if(r>0)remaining-=r;return r;}
                };
            }
            String mime=AssetPolicy.mime(entryName);String encoding=(mime.startsWith("text/")||mime.equals("application/json"))?"UTF-8":null;
            return new WebResourceResponse(mime,encoding,rangeHeader==null?200:206,rangeHeader==null?"OK":"Partial Content",headers,stream);
        }catch(Exception error){return error(500,"Read Error",headers);}
    }
    @Override public void onBackPressed(){new AlertDialog.Builder(this).setTitle("退出单机版？").setMessage("本局进度保存在内存中，退出后将结束本局。调配与设置会保留。").setNegativeButton("继续游戏",(d,w)->{}).setPositiveButton("退出",(d,w)->finish()).show();}
    @Override protected void onPause(){if(web!=null)web.evaluateJavascript("window.__SP_OFFLINE_SUSPEND__ && window.__SP_OFFLINE_SUSPEND__()",null);super.onPause();}
    @Override protected void onDestroy(){if(web!=null){web.loadUrl("about:blank");web.destroy();}try{if(apk!=null)apk.close();}catch(IOException ignored){}super.onDestroy();}
}
