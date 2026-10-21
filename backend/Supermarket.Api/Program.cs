
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Supermarket.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    );

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found."
    );
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        sqlOptions => sqlOptions.EnableRetryOnFailure()
    )
);


builder.Services.AddHttpClient<AzureAiService>();
// Controllers
builder.Services.AddControllers();
builder.Services.AddOpenApi();



// ASP.NET Core Identity
builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();



if (app.Environment.IsDevelopment() &&
    builder.Configuration.GetValue<bool>("AdminSetup:Enabled"))
{
    using var scope = app.Services.CreateScope();

    var adminEmail =
        builder.Configuration["AdminSetup:Email"];

    if (string.IsNullOrWhiteSpace(adminEmail))
    {
        throw new InvalidOperationException(
            "AdminSetup:Email is missing."
        );
    }

    await IdentitySeeder.SeedRolesAsync(
        scope.ServiceProvider
    );

    await IdentitySeeder.AssignAdminAsync(
        scope.ServiceProvider,
        adminEmail
    );
}



app.UseRouting();

app.UseCors("ReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();



// Authentication must run before Authorization


app.MapControllers();

// Identity endpoints

using (var scope = app.Services.CreateScope())
{
    await IdentitySeeder.SeedRolesAsync(scope.ServiceProvider);
}

app.Run();
