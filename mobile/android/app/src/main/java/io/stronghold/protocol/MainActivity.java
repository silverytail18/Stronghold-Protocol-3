package io.stronghold.protocol;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Build;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/** Thin game client. No native JavaScript bridge and no account-management screens. */
public final class MainActivity extends Activity {
    private SharedPreferences preferences;
    private FrameLayout root;
    private WebView web;
    private String server;
    private View fullscreen;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private boolean errorShown;
    private ResourcePackManager resources;
    private boolean preparingResources;
    private boolean preparedNavigation;
    private int connectionGeneration;
    private View resourceOverlay;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        preferences = getSharedPreferences("connection", MODE_PRIVATE);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(12, 15, 14));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        setContentView(root);
        server = preferences.getString("server", "");
        if (server.isEmpty()) showConnection();
        else {
            try { server = ServerPolicy.normalizeServerUrl(server); openGame(); }
            catch (IllegalArgumentException error) { showConnection(); }
        }
    }

    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

    private void applySystemBars() {
        boolean hideStatus = fullscreen != null || getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                if (hideStatus) controller.hide(WindowInsets.Type.statusBars());
                else controller.show(WindowInsets.Type.statusBars());
                if (fullscreen != null) controller.hide(WindowInsets.Type.navigationBars());
                else controller.show(WindowInsets.Type.navigationBars());
            }
        } else {
            if (hideStatus) getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            int flags = hideStatus ? View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY : View.SYSTEM_UI_FLAG_VISIBLE;
            if (fullscreen != null) flags |= View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
            getWindow().getDecorView().setSystemUiVisibility(flags);
        }
        // Recalculate padding after hiding the status bar so no empty strip remains above the game.
        if (root != null) root.requestApplyInsets();
    }

    @Override public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        applySystemBars();
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applySystemBars();
    }
    private TextView text(String value, int size, int color) {
        TextView view = new TextView(this); view.setText(value); view.setTextSize(size); view.setTextColor(color);
        view.setPadding(0, dp(8), 0, dp(8)); return view;
    }

    private void showConnection() {
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        applySystemBars();
        root.removeAllViews();
        LinearLayout form = new LinearLayout(this);
        form.setOrientation(LinearLayout.VERTICAL); form.setPadding(dp(28), dp(28), dp(28), dp(28));
        FrameLayout.LayoutParams layout = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        root.addView(form, layout);
        form.addView(text("STRONGHOLD PROTOCOL", 12, Color.rgb(78, 216, 175)));
        form.addView(text("卫戍协议：盟约", 26, Color.WHITE));
        form.addView(text("连接你的服务器，登录后即可游玩。", 14, Color.LTGRAY));
        form.addView(text("服务器地址", 14, Color.WHITE));
        EditText address = new EditText(this);
        address.setSingleLine(true); address.setTextColor(Color.WHITE); address.setHintTextColor(Color.GRAY);
        address.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        address.setHint("http://公网IP:3000"); address.setText(server);
        form.addView(address, new LinearLayout.LayoutParams(-1, -2));
        TextView status = text("", 13, Color.rgb(255, 158, 152)); form.addView(status);
        Button connect = new Button(this); connect.setText("连接并登录");
        form.addView(connect, new LinearLayout.LayoutParams(-1, dp(52)));
        form.addView(text("修改密码和账号管理请使用手机或电脑浏览器。", 12, Color.LTGRAY));
        connect.setOnClickListener(view -> {
            try {
                String selected = ServerPolicy.normalizeServerUrl(address.getText().toString());
                connect.setEnabled(false);
                Runnable load = () -> {
                    server = selected; preferences.edit().putString("server", server).apply(); openGame();
                };
                if (!selected.equals(server)) {
                    WebStorage.getInstance().deleteAllData();
                    CookieManager.getInstance().removeAllCookies(ignored -> { CookieManager.getInstance().flush(); load.run(); });
                } else load.run();
            } catch (IllegalArgumentException error) { status.setText(error.getMessage()); }
        });
    }

    private void openGame() {
        connectionGeneration++;
        preparingResources=false;preparedNavigation=false;
        try { resources=new ResourcePackManager(this,server); }
        catch(Exception error){new AlertDialog.Builder(this).setMessage(error.getMessage()).setPositiveButton("返回连接设置",(d,w)->showConnection()).show();return;}
        if (web != null) { web.stopLoading(); web.destroy(); }
        root.removeAllViews();
        web = new WebView(this); web.setBackgroundColor(Color.rgb(12, 15, 14));
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false); settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUserAgentString(settings.getUserAgentString() + " " + ServerPolicy.APP_USER_AGENT);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                if (ServerPolicy.allowPage(server, request.getUrl().toString())) {
                    if(gamePage(request.getUrl().toString())&&!preparedNavigation){prepareResources(request.getUrl().toString());return true;}
                    return false;
                }
                Toast.makeText(MainActivity.this, "App 只提供登录和游玩；账号管理请在浏览器访问。", Toast.LENGTH_LONG).show();
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String target = request.getUrl().toString();
                if (ServerPolicy.sameOrigin(server, target) && !ServerPolicy.accountPath(target)) return resources.intercept(request);
                byte[] body = "该页面仅通过浏览器访问".getBytes(StandardCharsets.UTF_8);
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden", Collections.singletonMap("Cache-Control", "no-store"), new ByteArrayInputStream(body));
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                errorShown = false;
                if (!ServerPolicy.allowPage(server, url)) view.stopLoading();
                else if(gamePage(url)){
                    if(preparedNavigation)preparedNavigation=false;
                    else{view.stopLoading();prepareResources(url);}
                }
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!ServerPolicy.allowPage(server, url)) return;
                CookieManager.getInstance().flush();
                boolean login = android.net.Uri.parse(url).getPath().equals("/login");
                setRequestedOrientation(login ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED : ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                if (login) getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                applySystemBars();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) connectionError();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame()) connectionError();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); connectionError();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreen != null) { callback.onCustomViewHidden(); return; }
                fullscreen = view; fullscreenCallback = callback; web.setVisibility(View.GONE);
                root.addView(view, new FrameLayout.LayoutParams(-1, -1));
                applySystemBars();
            }
            @Override public void onHideCustomView() { hideFullscreen(); }
        });
        web.loadUrl(server + "login?next=%2F");
    }

    private boolean gamePage(String url) {
        if(!ServerPolicy.sameOrigin(server,url))return false;
        String path=android.net.Uri.parse(url).getPath();return "/".equals(path)||"/index.html".equals(path);
    }
    private void prepareResources(String target) {
        if(preparingResources||isFinishing())return;
        preparingResources=true;final int generation=connectionGeneration;final ResourcePackManager manager=resources;
        LinearLayout overlay=new LinearLayout(this);overlay.setOrientation(LinearLayout.VERTICAL);overlay.setGravity(Gravity.CENTER);overlay.setPadding(dp(24),dp(24),dp(24),dp(24));overlay.setBackgroundColor(Color.rgb(12,15,14));
        overlay.addView(text("准备游戏资源",24,Color.WHITE));TextView status=text("正在检查服务器版本…",15,Color.LTGRAY);overlay.addView(status);
        overlay.addView(text("资源保存到本机，更新时只下载变化的文件。请保持 App 打开。",13,Color.LTGRAY));
        resourceOverlay=overlay;root.addView(overlay,new FrameLayout.LayoutParams(-1,-1));
        Thread task=new Thread(()->{
            try{
                manager.prepare(message->runOnUiThread(()->{if(generation==connectionGeneration)status.setText(message);}));
                runOnUiThread(()->{if(generation!=connectionGeneration||isFinishing())return;preparingResources=false;root.removeView(overlay);resourceOverlay=null;preparedNavigation=true;web.loadUrl(target);});
            }catch(Exception error){runOnUiThread(()->{
                if(generation!=connectionGeneration||isFinishing())return;preparingResources=false;status.setText(error.getMessage());
                Button retry=new Button(this);retry.setText("重试");overlay.addView(retry);retry.setOnClickListener(v->{root.removeView(overlay);resourceOverlay=null;prepareResources(target);});
                Button connection=new Button(this);connection.setText("返回连接设置");overlay.addView(connection);connection.setOnClickListener(v->changeConnection());
            });}
        },"resource-preflight");task.setDaemon(true);task.start();
    }

    private void connectionError() {
        if (errorShown || isFinishing()) return;
        errorShown = true;
        new AlertDialog.Builder(this).setTitle("无法连接服务器")
            .setMessage("检查服务器地址、网络和 TCP 端口是否开放。服务器需要先部署本项目的 App 支持代码。")
            .setPositiveButton("重新连接", (dialog, which) -> web.loadUrl(server + "login?next=%2F"))
            .setNeutralButton("连接设置", (dialog, which) -> changeConnection())
            .setNegativeButton("取消", null).show();
    }

    private void hideFullscreen() {
        if (fullscreen == null) return;
        root.removeView(fullscreen); fullscreen = null; web.setVisibility(View.VISIBLE);
        applySystemBars();
        if (fullscreenCallback != null) { fullscreenCallback.onCustomViewHidden(); fullscreenCallback = null; }
    }

    private void changeConnection() {
        connectionGeneration++;preparingResources=false;preparedNavigation=false;resourceOverlay=null;
        hideFullscreen();
        if (web != null) { web.stopLoading(); root.removeView(web); web.destroy(); web = null; }
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); showConnection();
    }

    @Override public void onBackPressed() {
        if (fullscreen != null) { hideFullscreen(); return; }
        if (web == null) { finish(); return; }
        new AlertDialog.Builder(this).setTitle("离开游戏？").setMessage("退出或更换服务器会断开当前游戏连接。")
            .setPositiveButton("退出 App", (dialog, which) -> finish())
            .setNeutralButton("连接设置", (dialog, which) -> changeConnection())
            .setNegativeButton("继续游戏", null).show();
    }

    @Override protected void onPause() { if (web != null) web.onPause(); CookieManager.getInstance().flush(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); applySystemBars(); }
    @Override protected void onDestroy() { hideFullscreen(); if (web != null) { root.removeView(web); web.destroy(); web = null; } super.onDestroy(); }
}
