using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;

namespace Supermarket.Api.Tests;

public class UsersTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(30)]
    public async Task ReturnsEachUserOnceWithAllRolesAndOnlyPublicProfileFields(int count)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
        services.AddIdentityCore<ApplicationUser>().AddRoles<IdentityRole>().AddEntityFrameworkStores<AppDbContext>();
        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Roles.AddRange(new IdentityRole { Id = "admin", Name = "Admin" },
            new IdentityRole { Id = "customer", Name = "User" });
        for (var index = 0; index < count; index++)
        {
            var id = $"account-{index}";
            db.Users.Add(new ApplicationUser
            {
                Id = id, UserName = $"Customer {index}", Email = $"customer{index}@example.test",
                PhoneNumber = index == 0 ? null : "0123456789", PasswordHash = "must-not-be-returned"
            });
            // Include both users with several roles and users without any role.
            if (index % 2 == 0)
            {
                db.UserRoles.AddRange(new IdentityUserRole<string> { UserId = id, RoleId = "admin" },
                    new IdentityUserRole<string> { UserId = id, RoleId = "customer" });
            }
        }
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var controller = ActivatorUtilities.CreateInstance<UsersController>(scope.ServiceProvider);
        var result = Assert.IsType<OkObjectResult>(await controller.GetUsers());
        var body = JsonSerializer.SerializeToElement(result.Value,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var users = body.EnumerateArray().ToArray();
        Assert.Equal(count, users.Length);
        Assert.Equal(count, users.Select(user => user.GetProperty("id").GetString()).Distinct().Count());
        for (var index = 0; index < count; index++)
        {
            var user = Assert.Single(users, user => user.GetProperty("id").GetString() == $"account-{index}");
            Assert.Equal($"Customer {index}", user.GetProperty("userName").GetString());
            Assert.Equal($"customer{index}@example.test", user.GetProperty("email").GetString());
            Assert.Equal(index == 0 ? null : "0123456789", user.GetProperty("phoneNumber").GetString());
            var roles = user.GetProperty("roles").EnumerateArray().Select(role => role.GetString()).Order().ToArray();
            Assert.Equal(index % 2 == 0 ? new[] { "Admin", "User" } : Array.Empty<string>(), roles);
            Assert.Equal(new[] { "email", "id", "phoneNumber", "roles", "userName" },
                user.EnumerateObject().Select(property => property.Name).Order().ToArray());
        }
    }
}
