
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Supermarket.Api.Data;

namespace Supermarket.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(
        AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken = default)
    {
        var users = await _db.Users
            .AsNoTracking()
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.PhoneNumber
            })
            .ToListAsync(cancellationToken);

        var memberships = await (
            from membership in _db.UserRoles.AsNoTracking()
            join role in _db.Roles.AsNoTracking() on membership.RoleId equals role.Id
            select new { membership.UserId, role.Name }
        ).ToListAsync(cancellationToken);

        // Assemble the response in memory after two bulk queries, including users without roles.
        var rolesByUser = memberships.ToLookup(membership => membership.UserId, membership => membership.Name);
        var result = users.Select(user => new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.PhoneNumber,
            Roles = rolesByUser[user.Id].ToArray()
        }).ToList();

        return Ok(result);
    }
}
