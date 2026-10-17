
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Supermarket.Api.Data;
using Supermarket.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

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

if (app.Environment.IsDevelopment())
{

    using var scope = app.Services.CreateScope();

    await IdentitySeeder.AssignAdminAsync(
        scope.ServiceProvider,
        "admin@example.com"
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
