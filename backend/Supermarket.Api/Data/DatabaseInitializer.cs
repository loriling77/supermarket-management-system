namespace Supermarket.Api.Data;

public sealed class DatabaseInitializer(
    IServiceScopeFactory scopeFactory,
    ILogger<DatabaseInitializer> logger,
    IHostEnvironment environment,
    IConfiguration configuration) : BackgroundService
{
    private volatile bool isReady;
    public bool IsReady => isReady;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                await IdentitySeeder.SeedRolesAsync(scope.ServiceProvider);

                if (environment.IsDevelopment() &&
                    configuration.GetValue<bool>("AdminSetup:Enabled"))
                {
                    var email = configuration["AdminSetup:Email"];
                    if (string.IsNullOrWhiteSpace(email))
                    {
                        throw new InvalidOperationException("AdminSetup:Email is required.");
                    }
                    await IdentitySeeder.AssignAdminAsync(scope.ServiceProvider, email);
                }

                isReady = true;
                logger.LogInformation("Database role initialization completed.");
                return;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                logger.LogError(exception,
                    "Database initialization failed. Configure the Azure SQL connection string " +
                    "DefaultConnection in App Service, allow database network access, and apply " +
                    "the existing EF migrations. Retrying in 30 seconds.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
        }
    }
}
