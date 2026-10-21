using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Supermarket.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()));
builder.Services.AddHttpClient<AzureAiService>();

builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// Resolve the same initializer for hosting, API gating, and readiness checks.
builder.Services.AddSingleton<DatabaseInitializer>();
builder.Services.AddHostedService(provider =>
    provider.GetRequiredService<DatabaseInitializer>());

var app = builder.Build();

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

// Serve the website during database outages, but do not accept partially
// initialized registrations or other API operations before roles exist.
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api") &&
        !context.RequestServices.GetRequiredService<DatabaseInitializer>().IsReady)
    {
        context.Response.Headers.RetryAfter = "30";
        await Results.Problem(
            statusCode: StatusCodes.Status503ServiceUnavailable,
            title: "Database unavailable",
            detail: "The database is not ready. Please try again shortly.")
            .ExecuteAsync(context);
        return;
    }
    await next(context);
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health/live", () => Results.Ok(new { status = "Healthy" }));
app.MapGet("/health/ready", async (
    DatabaseInitializer initializer, AppDbContext db, CancellationToken cancellationToken) =>
{
    if (!initializer.IsReady || !await db.Database.CanConnectAsync(cancellationToken))
    {
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
    return Results.Ok(new { status = "Healthy" });
});

// Unknown API/health URLs must not fall through to React's index.html.
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallback("/health/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");

app.Run();
