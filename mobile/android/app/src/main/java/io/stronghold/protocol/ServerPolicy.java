package io.stronghold.protocol;

import java.net.URI;
import java.util.Locale;

/** URL rules are independent of Android so they can also be tested on the build machine. */
public final class ServerPolicy {
    public static final String APP_USER_AGENT = "StrongholdProtocolApp/1";
    private ServerPolicy() {}

    public static String normalizeServerUrl(String input) {
        try {
            String value = input.trim();
            if (value.matches(".*[\\x00-\\x20\\x7f\\\\].*")) throw new IllegalArgumentException();
            URI uri = new URI(value);
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
            if ((!scheme.equals("http") && !scheme.equals("https")) || uri.getHost() == null
                || uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null
                || (uri.getRawPath() != null && !uri.getRawPath().isEmpty() && !uri.getRawPath().equals("/"))
                || uri.getPort() == 0 || uri.getPort() > 65535) throw new IllegalArgumentException();
            return new URI(scheme, null, uri.getHost().toLowerCase(Locale.ROOT), uri.getPort(), "/", null, null).toASCIIString();
        } catch (Exception error) {
            throw new IllegalArgumentException("请填写完整服务器地址，例如 http://公网IP:3000，不要附加页面路径。", error);
        }
    }

    private static int port(URI uri) { return uri.getPort() >= 0 ? uri.getPort() : "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80; }

    public static boolean sameOrigin(String base, String target) {
        try {
            URI left = new URI(base), right = new URI(target);
            return left.getHost() != null && right.getHost() != null && right.getRawUserInfo() == null
                && left.getScheme().equalsIgnoreCase(right.getScheme()) && left.getHost().equalsIgnoreCase(right.getHost())
                && port(left) == port(right);
        } catch (Exception error) { return false; }
    }

    public static boolean accountPath(String target) {
        try {
            String decoded = new URI(target).getPath();
            String pathname = new URI(null, null, decoded.replace('\\', '/'), null).normalize().getPath().toLowerCase(Locale.ROOT);
            pathname = pathname.replaceAll("/+", "/").replaceAll("/$", "");
            return pathname.equals("/admin") || pathname.startsWith("/admin/")
                || pathname.equals("/account") || pathname.startsWith("/account/") || pathname.equals("/account.html")
                || pathname.equals("/js/account.js") || pathname.equals("/js/ranked-admin.js") || pathname.equals("/css/account.css")
                || pathname.equals("/auth/password") || pathname.startsWith("/auth/admin/");
        } catch (Exception error) { return true; }
    }

    public static boolean allowPage(String base, String target) {
        if (!sameOrigin(base, target) || accountPath(target)) return false;
        try {
            String pathname = new URI(target).getRawPath();
            return pathname.equals("/") || pathname.equals("/index.html") || pathname.equals("/login");
        } catch (Exception error) { return false; }
    }
}
