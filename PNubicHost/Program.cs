using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var adminPassword = builder.Configuration["AdminPassword"] ?? "pnubic-local-admin";

builder.Services.AddResponseCompression();
builder.Services.AddCors(options =>
{
    options.AddPolicy("VisitorPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "pnubic-visitors.db");
using (var connection = new SqliteConnection($"Data Source={dbPath}"))
{
    connection.Open();
    using var command = connection.CreateCommand();
    command.CommandText = @"
        CREATE TABLE IF NOT EXISTS VisitorLogs (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            TimestampUtc TEXT NOT NULL,
            PageUrl TEXT,
            Referrer TEXT,
            IpAddress TEXT,
            UserAgent TEXT,
            Language TEXT,
            Timezone TEXT,
            Screen TEXT,
            Name TEXT,
            Email TEXT,
            SocialHandle TEXT,
            ConsentGranted INTEGER NOT NULL DEFAULT 0
        );";
    command.ExecuteNonQuery();
}

static bool IsLocalRequest(HttpContext context)
{
    var host = context.Request.Host.Host ?? "";
    var remote = context.Connection.RemoteIpAddress?.ToString() ?? "";
    return host == "localhost" || host == "127.0.0.1" || host == "::1" || host.StartsWith("localhost:") || host.StartsWith("127.0.0.1:") || remote == "127.0.0.1" || remote == "::1" || remote == "localhost";
}

static async Task<List<object>> GetVisitorRowsAsync(string dbPath)
{
    var rows = new List<object>();
    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    await using var command = connection.CreateCommand();
    command.CommandText = @"
        SELECT Id, TimestampUtc, PageUrl, Referrer, IpAddress, UserAgent, Language, Timezone, Screen, Name, Email, SocialHandle, ConsentGranted
        FROM VisitorLogs
        ORDER BY Id DESC
        LIMIT 100;";

    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        rows.Add(new
        {
            id = reader.GetInt32(0),
            timestampUtc = reader.IsDBNull(1) ? null : reader.GetString(1),
            pageUrl = reader.IsDBNull(2) ? null : reader.GetString(2),
            referrer = reader.IsDBNull(3) ? null : reader.GetString(3),
            ipAddress = reader.IsDBNull(4) ? null : reader.GetString(4),
            userAgent = reader.IsDBNull(5) ? null : reader.GetString(5),
            language = reader.IsDBNull(6) ? null : reader.GetString(6),
            timezone = reader.IsDBNull(7) ? null : reader.GetString(7),
            screen = reader.IsDBNull(8) ? null : reader.GetString(8),
            name = reader.IsDBNull(9) ? null : reader.GetString(9),
            email = reader.IsDBNull(10) ? null : reader.GetString(10),
            socialHandle = reader.IsDBNull(11) ? null : reader.GetString(11),
            consentGranted = reader.GetInt32(12) == 1
        });
    }

    return rows;
}

static string BuildAdminHtml(List<object> rows)
{
    var rowsHtml = rows.Count == 0
        ? "<tr><td colspan='8' style='padding:16px; color:#9ca3af;'>No visitors yet.</td></tr>"
        : string.Join("\n", rows.Select(r =>
        {
            var row = (dynamic)r;
            var name = row.name ?? "—";
            var email = row.email ?? "—";
            var social = row.socialHandle ?? "—";
            var ip = row.ipAddress ?? "—";
            var page = row.pageUrl ?? "—";
            var time = row.timestampUtc ?? "—";
            return $@"<tr><td>{name}</td><td>{email}</td><td>{social}</td><td>{ip}</td><td>{page}</td><td>{time}</td></tr>";
        }));

    return $@"<!doctype html><html><head><meta charset='utf-8' /><title>PNubic Admin</title><style>body{{font-family:Segoe UI, sans-serif; background:#050505; color:#f5f5f5; padding:24px;}} table{{width:100%; border-collapse:collapse; background:#0c0c0f;}} th,td{{padding:10px 12px; border-bottom:1px solid #1f1f23; text-align:left; vertical-align:top;}} th{{color:#9ca3af; font-size:11px; letter-spacing:.18em; text-transform:uppercase;}} tr:nth-child(even){{background:rgba(255,255,255,.02);}} .wrap{{max-width:1200px; margin:0 auto;}} h1{{margin-bottom:20px;}} .muted{{color:#9ca3af; margin-bottom:20px;}} a{{color:#f87171;}}</style></head><body><div class='wrap'><h1>PNubic Visitor Admin</h1><div class='muted'>Private local-only dashboard. Only visible on localhost.</div><table><thead><tr><th>Name</th><th>Email</th><th>Social</th><th>IP</th><th>Page</th><th>Time</th></tr></thead><tbody>{rowsHtml}</tbody></table></div></body></html>";
}

app.UseCors("VisitorPolicy");
app.UseResponseCompression();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/admin", async (HttpContext context) =>
{
    if (!IsLocalRequest(context))
        return Results.Text("Forbidden", statusCode: 403);

    var password = context.Request.Query["pw"].ToString();
    if (!string.Equals(password, adminPassword, StringComparison.Ordinal))
    {
        return Results.Content(
            "<!doctype html><html><head><meta charset='utf-8' /><title>PNubic Admin Login</title><style>body{font-family:Segoe UI,sans-serif; background:#050505; color:#fff; display:grid; place-items:center; min-height:100vh;} .box{background:#0b0b0d; border:1px solid rgba(255,255,255,.08); padding:28px; border-radius:16px; width:min(420px,90vw);} input{width:100%; padding:12px; margin-top:10px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:#101013; color:#fff;} button{margin-top:16px; width:100%; background:#ef4444; color:white; border:none; padding:12px; border-radius:10px; cursor:pointer;}</style></head><body><form class='box' method='get' action='/admin'><h2>Local Admin Access</h2><input type='password' name='pw' placeholder='Password' /><button type='submit'>Enter</button></form></body></html>",
            "text/html"
        );
    }

    var rows = await GetVisitorRowsAsync(dbPath);
    return Results.Content(BuildAdminHtml(rows), "text/html");
});

app.MapGet("/api/visitors", async (HttpContext context) =>
{
    if (!IsLocalRequest(context))
        return Results.Json(new { error = "Forbidden" }, statusCode: 403);

    var rows = await GetVisitorRowsAsync(dbPath);
    return Results.Ok(new { total = rows.Count, records = rows });
});

app.MapPost("/api/visitors", async (VisitorSubmission payload, HttpContext context) =>
{
    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var timestamp = DateTime.UtcNow;

    await using var connection = new SqliteConnection($"Data Source={dbPath}");
    await connection.OpenAsync();

    await using var command = connection.CreateCommand();
    command.CommandText = @"
        INSERT INTO VisitorLogs (
            TimestampUtc, PageUrl, Referrer, IpAddress, UserAgent, Language, Timezone, Screen,
            Name, Email, SocialHandle, ConsentGranted
        )
        VALUES (
            $timestamp, $pageUrl, $referrer, $ipAddress, $userAgent, $language, $timezone, $screen,
            $name, $email, $socialHandle, $consentGranted
        );";

    command.Parameters.AddWithValue("$timestamp", timestamp.ToString("O"));
    command.Parameters.AddWithValue("$pageUrl", payload.PageUrl ?? string.Empty);
    command.Parameters.AddWithValue("$referrer", payload.Referrer ?? string.Empty);
    command.Parameters.AddWithValue("$ipAddress", ip);
    command.Parameters.AddWithValue("$userAgent", payload.UserAgent ?? string.Empty);
    command.Parameters.AddWithValue("$language", payload.Language ?? string.Empty);
    command.Parameters.AddWithValue("$timezone", payload.Timezone ?? string.Empty);
    command.Parameters.AddWithValue("$screen", payload.Screen ?? string.Empty);
    command.Parameters.AddWithValue("$name", payload.Name ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("$email", payload.Email ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("$socialHandle", payload.SocialHandle ?? (object)DBNull.Value);
    command.Parameters.AddWithValue("$consentGranted", payload.ConsentGranted ? 1 : 0);

    await command.ExecuteNonQueryAsync();

    return Results.Ok(new { success = true, storedAt = timestamp });
});

app.MapFallbackToFile("index.html");
app.Run();

public record VisitorSubmission(
    string? PageUrl,
    string? Referrer,
    string? UserAgent,
    string? Language,
    string? Timezone,
    string? Screen,
    string? Name,
    string? Email,
    string? SocialHandle,
    bool ConsentGranted
);
