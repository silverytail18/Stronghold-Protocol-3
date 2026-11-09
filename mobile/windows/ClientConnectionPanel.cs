using System.Drawing.Drawing2D;
namespace Stronghold.Protocol;

// Native startup surface: available before WebView2 and its local resources are ready.
sealed class ClientConnectionPanel : Panel
{
    static readonly Color Mint=Color.FromArgb(78,216,175), Muted=Color.FromArgb(138,148,143);
    readonly Label brand=new(){Text="STRONGHOLD PROTOCOL / CLIENT",AutoSize=true};
    readonly Label title=new(){Text="卫戍协议：盟约",AutoSize=true};
    readonly Label hint=new(){Text="连接服务器，继续你的部署。",AutoSize=true};
    readonly Label field=new(){Text="服务器地址",AutoSize=true};
    readonly Label state=new(){Text="正在准备本地资源…",AutoEllipsis=true};
    readonly Label count=new(){Text="准备中",TextAlign=ContentAlignment.MiddleRight};
    readonly ClientProgressBar progress=new();
    public readonly TextBox Address=new(){BorderStyle=BorderStyle.FixedSingle};
    public readonly Button Connect=new(){Text="连接服务器",FlatStyle=FlatStyle.Flat,Enabled=false};
    bool compact;
    public ClientConnectionPanel()
    {
        Dock=DockStyle.Top;Height=258;BackColor=Color.FromArgb(20,24,22);ForeColor=Color.FromArgb(242,242,242);
        Font=new Font("Microsoft YaHei UI",10);
        brand.Font=new Font("Segoe UI",9,FontStyle.Bold);brand.ForeColor=Mint;
        title.Font=new Font("Microsoft YaHei UI",23,FontStyle.Bold);hint.ForeColor=Muted;field.ForeColor=Muted;state.ForeColor=Muted;count.ForeColor=Mint;
        Address.BackColor=Color.FromArgb(12,15,14);Address.ForeColor=ForeColor;Address.Font=new Font("Segoe UI",12);
        Address.PlaceholderText="http://服务器IP:3000";Address.AccessibleName="服务器地址";
        Connect.BackColor=Mint;Connect.ForeColor=Color.FromArgb(6,17,13);Connect.FlatAppearance.BorderSize=0;Connect.Cursor=Cursors.Hand;
        Connect.EnabledChanged+=(_,_)=>Connect.BackColor=Connect.Enabled?Mint:Color.FromArgb(20,84,67);
        Connect.BackColor=Color.FromArgb(20,84,67);
        Controls.AddRange([brand,title,hint,field,Address,Connect,state,count,progress]);
        Resize+=(_,_)=>Arrange();Arrange();
    }
    void Arrange()
    {
        int left=Math.Max(24,(ClientSize.Width-1000)/2), width=Math.Max(300,ClientSize.Width-left*2), top=compact?16:126;
        brand.Location=new(left,20);title.Location=new(left,41);hint.Location=new(left,88);
        field.Location=new(left,top);Address.SetBounds(left,top+24,width-148,34);Connect.SetBounds(left+width-136,top+21,136,40);
        state.SetBounds(left,top+70,width-160,24);count.SetBounds(left+width-160,top+70,160,24);progress.SetBounds(left,top+101,width,5);
    }
    public void Compact(bool value){compact=value;brand.Visible=title.Visible=hint.Visible=!value;Height=value?142:258;Arrange();}
    public void SetProgress(string text,long completed=-1,long total=0,bool error=false)
    {
        progress.Visible=true;
        state.Text=text;state.ForeColor=error?Color.FromArgb(255,84,84):Muted;
        bool known=total>0&&completed>=0;
        double fraction=known?Math.Clamp((double)completed/total,0,1):0;
        count.Text=error?"请重试":known?$"{fraction:P0}  ·  {Math.Min(completed,total):N0} / {total:N0}":"准备中";
        progress.Fraction=known?fraction:null;progress.Failed=error;progress.Invalidate();
        progress.AccessibleName=text;progress.AccessibleDescription=count.Text;
    }
    public void SetIdle(string text){state.Text=text;state.ForeColor=Muted;count.Text="";progress.Visible=false;}
}

sealed class ClientProgressBar : Control
{
    public double? Fraction;public bool Failed;
    public ClientProgressBar(){DoubleBuffered=true;BackColor=Color.FromArgb(47,58,53);}
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        if(Failed)return;
        var color=Color.FromArgb(78,216,175);
        if(Fraction is double fraction){using var brush=new SolidBrush(color);e.Graphics.FillRectangle(brush,0,0,(int)Math.Round(Width*fraction),Height);}
        else{using var brush=new LinearGradientBrush(ClientRectangle,Color.FromArgb(20,84,67),color,0f);e.Graphics.FillRectangle(brush,0,0,Width/3,Height);}
    }
}
