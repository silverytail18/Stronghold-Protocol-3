package io.stronghold.protocol;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.*;

// Native UI is available while the embedded resource pack and WebView are still starting.
final class ClientConnectionView extends LinearLayout {
  static final int MINT=Color.rgb(78,216,175),MUTED=Color.rgb(138,148,143),LINE=Color.rgb(47,58,53);
  final EditText address;final Button connect;
  private final LinearLayout heading;private final TextView field,status,count;private final ProgressBar progress;
  private int dp(float value){return Math.round(value*getResources().getDisplayMetrics().density);}
  private TextView label(String text,int size,int color){TextView view=new TextView(getContext());view.setText(text);view.setTextSize(size);view.setTextColor(color);return view;}
  private GradientDrawable background(int color,int border){GradientDrawable shape=new GradientDrawable();shape.setColor(color);if(border!=0)shape.setStroke(dp(1),border);return shape;}
  ClientConnectionView(Context context){super(context);setOrientation(VERTICAL);setPadding(dp(24),dp(22),dp(24),dp(22));setBackgroundColor(Color.rgb(20,24,22));
    heading=new LinearLayout(context);heading.setOrientation(VERTICAL);addView(heading);
    heading.addView(label("STRONGHOLD PROTOCOL / CLIENT",12,MINT));
    TextView title=label("卫戍协议：盟约",26,Color.rgb(242,242,242));title.setPadding(0,dp(6),0,dp(6));heading.addView(title);
    TextView hint=label("连接服务器，继续你的部署。",14,MUTED);hint.setPadding(0,0,0,dp(22));heading.addView(hint);
    field=label("服务器地址",13,MUTED);addView(field);
    LinearLayout row=new LinearLayout(context);row.setGravity(Gravity.CENTER_VERTICAL);LayoutParams rowParams=new LayoutParams(-1,dp(48));rowParams.topMargin=dp(8);addView(row,rowParams);
    address=new EditText(context);address.setSingleLine();address.setTextSize(16);address.setTextColor(Color.rgb(242,242,242));address.setHintTextColor(MUTED);address.setHint("http://服务器IP:3000");address.setContentDescription("服务器地址");address.setSelectAllOnFocus(true);address.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_URI);address.setImeOptions(EditorInfo.IME_ACTION_GO|EditorInfo.IME_FLAG_NO_EXTRACT_UI);address.setBackground(background(Color.rgb(12,15,14),LINE));address.setPadding(dp(12),0,dp(12),0);row.addView(address,new LayoutParams(0,-1,1));
    connect=new Button(context){@Override public void setEnabled(boolean enabled){super.setEnabled(enabled);setAlpha(enabled?1f:.45f);}};connect.setText("连接服务器");connect.setTextSize(14);connect.setTextColor(Color.rgb(6,17,13));connect.setAllCaps(false);connect.setBackground(background(MINT,0));connect.setEnabled(false);LayoutParams buttonParams=new LayoutParams(dp(116),-1);buttonParams.leftMargin=dp(10);row.addView(connect,buttonParams);
    LinearLayout state=new LinearLayout(context);state.setGravity(Gravity.CENTER_VERTICAL);LayoutParams stateParams=new LayoutParams(-1,-2);stateParams.topMargin=dp(15);stateParams.bottomMargin=dp(8);addView(state,stateParams);
    status=label("正在准备本地资源…",13,MUTED);status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);state.addView(status,new LayoutParams(0,-2,1));count=label("准备中",12,MINT);count.setGravity(Gravity.RIGHT);state.addView(count);
    progress=new ProgressBar(context,null,android.R.attr.progressBarStyleHorizontal);progress.setMax(1000);progress.setProgressTintList(ColorStateList.valueOf(MINT));progress.setProgressBackgroundTintList(ColorStateList.valueOf(LINE));progress.setIndeterminateTintList(ColorStateList.valueOf(MINT));progress.setIndeterminate(true);addView(progress,new LayoutParams(-1,dp(5)));
  }
  void compact(){heading.setVisibility(GONE);field.setVisibility(GONE);setPadding(dp(16),dp(8),dp(16),dp(12));}
  void update(String text,long completed,long total){status.setText(text);status.setTextColor(MUTED);progress.setVisibility(VISIBLE);boolean known=total>0&&completed>=0;progress.setIndeterminate(!known);if(known){double fraction=Math.max(0,Math.min(1,(double)completed/total));progress.setProgress((int)Math.round(fraction*1000));count.setText(String.format(java.util.Locale.getDefault(),"%.0f%%  ·  %,d / %,d",fraction*100,Math.min(completed,total),total));}else count.setText("准备中");}
  void error(String text){status.setText(text);status.setTextColor(Color.rgb(255,84,84));count.setText("请重试");progress.setVisibility(INVISIBLE);}
  void idle(String text){status.setText(text);status.setTextColor(MUTED);count.setText("");progress.setVisibility(INVISIBLE);}
}
