package io.stronghold.protocol;

public final class ServerPolicyTest {
    private static int checks;
    private static void check(boolean value, String name) { checks++; if (!value) throw new AssertionError(name); }
    public static void main(String[] arguments) {
        check(ServerPolicy.normalizeServerUrl(" http://203.0.113.10:3000 ").equals("http://203.0.113.10:3000/"), "IP and port");
        check(ServerPolicy.normalizeServerUrl("HTTPS://EXAMPLE.COM").equals("https://example.com/"), "HTTPS origin");
        check(ServerPolicy.normalizeServerUrl("http://[2001:db8::1]:3000").equals("http://[2001:db8::1]:3000/"), "IPv6");
        for (String bad : new String[]{"", "203.0.113.10:3000", "file:///tmp/a", "javascript:alert(1)", "http://user:password@example.com", "http://example.com/admin", "http://example.com/?next=/admin", "http://example.com/#x", "http://example.com:0", "http://example.com:65536", "http://example.com\\evil", "http://example.com/../"}) {
            boolean rejected = false;
            try { ServerPolicy.normalizeServerUrl(bad); } catch (IllegalArgumentException error) { rejected = true; }
            check(rejected, "reject address: " + bad);
        }
        String base = "http://203.0.113.10:3000/";
        for (String allowed : new String[]{base, base + "index.html", base + "login?next=%2F"}) check(ServerPolicy.allowPage(base, allowed), "allow page " + allowed);
        for (String denied : new String[]{base + "admin", base + "account", base + "account.html", base + "data/config.json", "http://evil.test/", "https://203.0.113.10:3000/", "http://203.0.113.10:3001/", "file:///tmp/index.html", "javascript:alert(1)", base + "%61dmin"}) check(!ServerPolicy.allowPage(base, denied), "deny page " + denied);
        for (String blocked : new String[]{"admin", "admin/", "account", "account/", "account.html", "%61ccount.html", "ACCOUNT.HTML", "js//account.js", "css/account.css", "auth/password", "auth/admin/users", "auth/admin/users/player", "js/%61ccount.js", "ignored/../account.html"}) check(ServerPolicy.accountPath(base + blocked), "account path " + blocked);
        for (String allowed : new String[]{"js/auth.js", "js/main.js", "auth/login", "auth/logout", "auth/session", "data/config.json", "ws"}) check(!ServerPolicy.accountPath(base + allowed), "game resource " + allowed);
        check(ServerPolicy.sameOrigin("http://example.com/", "http://EXAMPLE.COM:80/login"), "default port equivalence");
        check(!ServerPolicy.sameOrigin(base, "http://203.0.113.10:3000@evil.test/"), "userinfo deception");
        System.out.println("ServerPolicy: " + checks + " URL checks passed");
    }
}
