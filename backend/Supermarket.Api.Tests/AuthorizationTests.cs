using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Supermarket.Api.Controllers;
using Supermarket.Api.Data;
using Supermarket.Api.Models;
using Supermarket.Api.Services;

namespace Supermarket.Api.Tests;

public class AuthorizationTests : IAsyncLifetime
{
    private IHost _host = null!;
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
        var databaseName = Guid.NewGuid().ToString();
        _host = await new HostBuilder()
            .ConfigureWebHost(web => web.UseTestServer()
                .ConfigureServices(services =>
                {
                    services.AddControllers().AddApplicationPart(typeof(CategoryController).Assembly);
                    services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>("Test", _ => { });
                    services.AddAuthorization();
                    services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(databaseName));
                    services.AddHttpClient<AzureAiService>()
                        .ConfigurePrimaryHttpMessageHandler(() => new RejectExternalRequestsHandler());
                })
                .Configure(app =>
                {
                    app.UseRouting();
                    app.UseAuthentication();
                    app.UseAuthorization();
                    app.UseEndpoints(endpoints => endpoints.MapControllers());
                }))
            .StartAsync();

        using var scope = _host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Categories.Add(new Category { Id = 1, CategoryName = "Food" });
        db.Manufactures.Add(new Manufacture
        {
            Id = 1, ManufactureName = "Supplier", ProductionLiscenseNumber = "TEST-1"
        });
        await db.SaveChangesAsync();
        _client = _host.GetTestClient();
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _host.StopAsync();
        _host.Dispose();
    }

    public static TheoryData<string, string> CatalogEndpoints => new()
    {
        { "GET", "/api/category" }, { "GET", "/api/category/1" },
        { "POST", "/api/category" }, { "PUT", "/api/category/1" }, { "DELETE", "/api/category/1" },
        { "GET", "/api/manufacture" }, { "GET", "/api/manufacture/1" },
        { "POST", "/api/manufacture" }, { "PUT", "/api/manufacture/1" }, { "DELETE", "/api/manufacture/1" }
    };

    [Theory]
    [MemberData(nameof(CatalogEndpoints))]
    public async Task Catalog_AnonymousRequests_AreUnauthorized(string method, string path)
    {
        using var response = await SendAsync(method, path);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("POST", "/api/category")]
    [InlineData("PUT", "/api/category/1")]
    [InlineData("DELETE", "/api/category/1")]
    [InlineData("POST", "/api/manufacture")]
    [InlineData("PUT", "/api/manufacture/1")]
    [InlineData("DELETE", "/api/manufacture/1")]
    public async Task Catalog_UserCannotMutate(string method, string path)
    {
        using var response = await SendAsync(method, path, "User");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/category")]
    [InlineData("/api/category/1")]
    [InlineData("/api/manufacture")]
    [InlineData("/api/manufacture/1")]
    public async Task Catalog_ReadsAllowBothRoles_AndRejectOtherRoles(string path)
    {
        foreach (var role in new[] { "Admin", "User", "Visitor" })
        {
            using var response = await SendAsync("GET", path, role);
            Assert.Equal(role == "Visitor" ? HttpStatusCode.Forbidden : HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Theory]
    [InlineData("POST", "/api/category", HttpStatusCode.Created)]
    [InlineData("PUT", "/api/category/1", HttpStatusCode.NoContent)]
    [InlineData("DELETE", "/api/category/1", HttpStatusCode.NoContent)]
    [InlineData("POST", "/api/manufacture", HttpStatusCode.Created)]
    [InlineData("PUT", "/api/manufacture/1", HttpStatusCode.NoContent)]
    [InlineData("DELETE", "/api/manufacture/1", HttpStatusCode.NoContent)]
    public async Task Catalog_AdminCanMutate(string method, string path, HttpStatusCode expected)
    {
        using var response = await SendAsync(method, path, "Admin");
        Assert.Equal(expected, response.StatusCode);
    }

    [Theory]
    [InlineData(null, HttpStatusCode.Unauthorized)]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Visitor", HttpStatusCode.Forbidden)]
    [InlineData("User", HttpStatusCode.OK)]
    public async Task AiChat_AllowsOnlyUsers(string? role, HttpStatusCode expected)
    {
        // Empty in-memory inventory returns before Azure AI is needed.
        using var response = await SendAsync("POST", "/api/ai/chat", role);
        Assert.Equal(expected, response.StatusCode);
        if (role == "User")
            Assert.Contains("There are currently no products in stock.", await response.Content.ReadAsStringAsync());
    }

    private Task<HttpResponseMessage> SendAsync(string method, string path, string? role = null)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), path);
        if (role != null)
            request.Headers.Add("Test-Role", role);
        if (method is "POST" or "PUT")
            request.Content = path.Contains("/ai/")
                ? JsonContent.Create(new { message = "What is available?" })
                : path.Contains("category")
                    ? JsonContent.Create(new { categoryName = "Food", detail = "Test" })
                    : JsonContent.Create(new { manufactureName = "Supplier", productionLiscenseNumber = "TEST-2", placeOfOrigin = "UK" });
        return _client.SendAsync(request);
    }

    private sealed class RejectExternalRequestsHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => throw new InvalidOperationException("Authorization tests must not call external services.");
    }

    private sealed class TestAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue("Test-Role", out var role))
                return Task.FromResult(AuthenticateResult.NoResult());

            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "authorization-test-user"),
                new Claim(ClaimTypes.Role, role.ToString())
            }, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(
                new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name)));
        }
    }
}
