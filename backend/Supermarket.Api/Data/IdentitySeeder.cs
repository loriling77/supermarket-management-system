
using Microsoft.AspNetCore.Identity;
using Supermarket.Api.Models;
namespace Supermarket.Api.Data;

public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(
        IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        string[] roles = { "Admin", "User" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(
                    new IdentityRole(role)
                );

                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Failed to create {role}: " +
                        string.Join(", ",
                            result.Errors.Select(e => e.Description))
                    );
                }
            }
        }
    }

    public static async Task AssignAdminAsync(
    IServiceProvider serviceProvider,
    string email)
    {
        var userManager = serviceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new InvalidOperationException(
                "Admin account not found.");
        }

        if (!await userManager.IsInRoleAsync(user, "Admin"))
        {
            var result = await userManager.AddToRoleAsync(
                user, "Admin");

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to assign Admin role.");
            }
        }
    }
}
