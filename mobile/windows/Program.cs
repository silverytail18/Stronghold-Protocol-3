using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Net;
using System.Text;
using System.Text.Json.Nodes;

namespace Stronghold.Protocol;
static class Program
{
    [STAThread] static void Main(){ApplicationConfiguration.Initialize();Application.Run(new GameWindow());}
}
sealed class GameWindow : Form
{
    private readonly WebView2 web=new(){Dock=DockStyle.Fill};
    private readonly TextBox address=new(){Width=300};
    private readonly Button connect=new(){Text="连接服务器",AutoSize=true};
    private readonly Label status=new(){Text="填写服务器地址后连接",AutoSize=true,Padding=new Padding(8)};
    private readonly string home=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"StrongholdProtocol");
    private Uri? server;private ResourceCache? cache;private bool ready,preparing;
    public GameWindow(){Text="卫戍协议：盟约";Width=1400;Height=900;MinimumSize=new Size(960,640);
        var bar=new FlowLayoutPanel(){Dock=DockStyle.Top,AutoSize=true,Padding=new Padding(8)};bar.Controls.AddRange([address,connect,status]);Controls.Add(web);Controls.Add(bar);
        Directory.CreateDirectory(home);var settings=Path.Combine(home,"server.txt");if(File.Exists(settings))address.Text=File.ReadAllText(settings);
        connect.Click+=async(_,_)=>await Connect();Shown+=async(_,_)=>{try{await web.EnsureCoreWebView2Async(await CoreWebView2Environment.CreateAsync(null,Path.Combine(home,"webview")));
            web.CoreWebView2.Settings.UserAgent+=" "+ResourceCache.Agent;web.CoreWebView2.Settings.AreHostObjectsAllowed=false;
            web.CoreWebView2.AddWebResourceRequestedFilter("*",CoreWebView2WebResourceContext.All);
            web.CoreWebView2.WebResourceRequested+=ResourceRequested;web.CoreWebView2.NavigationStarting+=NavigationStarting;
            if(address.Text.Length>0)await Connect();
        }catch(Exception e){status.Text="无法启动 WebView2";MessageBox.Show("请安装 Microsoft Edge WebView2 Runtime 后重试。\n"+e.Message,Text);}};
    }
    private async Task Connect(){
        if(preparing)return;
        try{if(!Uri.TryCreate(address.Text.Trim(),UriKind.Absolute,out var selected)||selected.Scheme is not ("http" or "https")||selected.UserInfo.Length>0||selected.Query.Length>0||selected.Fragment.Length>0||selected.AbsolutePath!="/")throw new IOException("请填写 http://公网IP:端口 或 HTTPS 地址，不要附加页面路径。");
            if(web.CoreWebView2==null){status.Text="正在初始化客户端…";return;}
            if(server!=null&&!ResourceCache.SameOrigin(server,selected)){if(MessageBox.Show("更换服务器会断开当前对局连接，是否继续？",Text,MessageBoxButtons.YesNo)!=DialogResult.Yes)return;web.CoreWebView2.Stop();web.CoreWebView2.CookieManager.DeleteAllCookies();}
            server=selected;cache=new ResourceCache(server,Path.Combine(home,"resources"));File.WriteAllText(Path.Combine(home,"server.txt"),server.AbsoluteUri);ready=false;
            web.CoreWebView2.Navigate(new Uri(server,"login?next=%2F").AbsoluteUri);status.Text="登录后准备本地资源";
        }catch(Exception e){status.Text=e.Message;}
        await Task.CompletedTask;
    }
    private static bool Account(string path){var p=Uri.UnescapeDataString(path).Replace('\\','/').ToLowerInvariant();return p.StartsWith("/admin")||p.StartsWith("/account")||p.StartsWith("/auth/admin/")||p=="/auth/password"||p=="/js/account.js"||p=="/js/ranked-admin.js"||p=="/css/account.css";}
    private async void NavigationStarting(object? sender,CoreWebView2NavigationStartingEventArgs e){
        if(server==null||!Uri.TryCreate(e.Uri,UriKind.Absolute,out var target)||!ResourceCache.SameOrigin(server,target)||Account(target.AbsolutePath)||target.AbsolutePath is not ("/" or "/index.html" or "/login")){e.Cancel=true;return;}
        if(target.AbsolutePath=="/login")return;
        if(ready){ready=false;return;}
        e.Cancel=true;if(preparing||cache==null)return;preparing=true;connect.Enabled=false;web.Visible=false;
        try{await Cookies();await cache.Prepare(message=>{if(!IsDisposed)status.Text=message;},AppContext.BaseDirectory);status.Text="资源已就绪";ready=true;web.Visible=true;web.CoreWebView2.Navigate(target.AbsoluteUri);}
        catch(HttpRequestException error) when(error.StatusCode==HttpStatusCode.Unauthorized){web.Visible=true;web.CoreWebView2.Navigate(new Uri(server,"login?next=%2F").AbsoluteUri);status.Text="请重新登录";}
        catch(Exception error){web.Visible=true;status.Text="资源准备失败";if(MessageBox.Show(error.Message+"\n\n点击重试重新检查资源。",Text,MessageBoxButtons.RetryCancel)==DialogResult.Retry)BeginInvoke(new Action(()=>web.CoreWebView2.Navigate(target.AbsoluteUri)));}
        finally{preparing=false;connect.Enabled=true;}
    }
    private async Task Cookies(){if(cache==null||server==null)return;var cookies=await web.CoreWebView2.CookieManager.GetCookiesAsync(server.AbsoluteUri);cache.SetCookie(string.Join("; ",cookies.Select(c=>c.Name+"="+c.Value)));}
    private CoreWebView2WebResourceResponse Response(Stream body,string mime,long size,int code=200) => web.CoreWebView2.Environment.CreateWebResourceResponse(body,code,code==200?"OK":"Resource error",$"Content-Type: {mime}\r\nContent-Length: {size}\r\nCache-Control: no-store\r\nX-Stronghold-Resource: local");
    private async void ResourceRequested(object? sender,CoreWebView2WebResourceRequestedEventArgs e){
        using var deferred=e.GetDeferral();if(server==null||cache==null)return;
        try{var target=new Uri(e.Request.Uri);if(!ResourceCache.SameOrigin(server,target)||Account(target.AbsolutePath)){var body=Encoding.UTF8.GetBytes("账号管理请使用浏览器访问");e.Response=Response(new MemoryStream(body),"text/plain; charset=utf-8",body.Length,403);return;}
            if(e.Request.Method is not ("GET" or "HEAD"))return;
            if(target.AbsolutePath=="/app/resource-manifest"&&cache.Version.Length>0){await Cookies();var state=JsonNode.Parse(await cache.Read("/app/resource-manifest",65536))!;state["installedPack"]=cache.Version;var bytes=Encoding.UTF8.GetBytes(state.ToJsonString());e.Response=Response(new MemoryStream(bytes),"application/json",bytes.Length);return;}
            var local=cache.Local(target,e.Request.Method=="HEAD");if(local!=null)e.Response=Response(local.Value.body,local.Value.mime,local.Value.size);
        }catch(Exception error){var bytes=Encoding.UTF8.GetBytes(error.Message);e.Response=Response(new MemoryStream(bytes),"text/plain; charset=utf-8",bytes.Length,503);}
    }
}
