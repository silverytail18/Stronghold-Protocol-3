package io.stronghold.protocol;

import android.content.Context;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebView;

/** Keep the real WebView input connection, including composition/password editing.
 * Landscape IMEs must not replace the login page with a fullscreen extract editor. */
final class ClientWebView extends WebView {
  ClientWebView(Context context){super(context);}
  @Override public InputConnection onCreateInputConnection(EditorInfo info){
    InputConnection connection=super.onCreateInputConnection(info);
    if(connection!=null)info.imeOptions|=EditorInfo.IME_FLAG_NO_EXTRACT_UI|EditorInfo.IME_FLAG_NO_FULLSCREEN;
    return connection;
  }
}
