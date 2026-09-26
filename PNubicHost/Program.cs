var builder = WebApplication.CreateBuilder(args);
builder.Services.AddResponseCompression();
var app = builder.Build();
app.UseResponseCompression();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
app.Run();
