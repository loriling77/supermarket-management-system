# Deploy the Supermarket website and API

GitHub Actions builds React and ASP.NET Core and packages both into the existing
`supermarket-api-ll` App Service. The React build is copied into the API publish
folder's `wwwroot`. Opening `/` or `/login` loads the website; browser API calls
use `/api` on the same HTTPS host. No separate frontend Azure service is needed.

## Azure configuration required

1. In **App Services > supermarket-api-ll > Settings > Configuration > Stack
   settings**, select the **.NET 10** runtime. This is a framework-dependent
   .NET 10 application. Save changes and restart if needed. Leave a custom startup
   command empty unless explicitly needed for your App Service configuration.
2. Create or use an **Azure SQL database**. The repository's localhost SQL Server
   connection string is only for local development and cannot connect to your
   computer from Azure.
3. In **App Service > Settings > Environment variables > Connection strings**,
   add **DefaultConnection**, type **SQLAzure**, with your Azure SQL connection
   string. Alternatively, use an app setting named
   **ConnectionStrings__DefaultConnection**. Keep the real value only in Azure,
   not in the repository or the frontend.
4. Configure Azure SQL networking to permit the App Service's connection. Use
   your deployment's selected private-network setup or allow the App Service
   outbound IP addresses in the SQL server firewall. Ensure SQL credentials or
   the configured managed identity have access to the database.
5. Apply the project's existing EF Core migrations to this Azure SQL database
   before expecting registration, login, or product operations to work. The app
   creates the Admin and User roles after it can reach the migrated database;
   it does **not** automatically modify your database schema or create an admin.
   If applying migrations locally, use EF CLI 10 and supply the Azure connection
   through `ConnectionStrings__DefaultConnection` in your local environment,
   then run `dotnet ef database update --project backend/Supermarket.Api`.

## What starts during a database problem

Role initialization retries in the background every 30 seconds after a failed
attempt. SQL connection retries can make an individual attempt take longer.
The website stays accessible, while API operations return HTTP 503 until roles
have been initialized. Once the database is reachable and migrations are applied,
initialization can recover without another deployment.

- `/health/live`: HTTP 200 when the web process is running.
- `/health/ready`: HTTP 200 only after role initialization and a successful
  database connectivity check; HTTP 503 while unavailable.

Do not use `/health/ready` as an automatic restart trigger for database outages.
A restart will not fix missing database configuration. Use it for deployment
readiness and use `/health/live` if a process-liveness check is needed.

GitHub Actions verifies the homepage and readiness after deploying. A failed
readiness step means upload succeeded but the full application is not usable yet.

## When the Azure log viewer says Forbidden

An `extensions API` Forbidden message is an access failure to the logging tool,
not the application's startup exception. Ask the subscription/resource owner for
access to App Service logs, or have them inspect startup logs for you. The public
health URLs and GitHub deployment verification remain available without access
to that log viewer. They indicate readiness, not private exception details.

## Development and verification

Run the API locally and use `npm run dev` in `frontend`. Vite proxies `/api` to
`http://localhost:5252`, so the browser always uses relative API paths. No CORS
configuration is needed for this setup.

To verify a production package:

```sh
npm ci --prefix frontend
npm run build --prefix frontend
dotnet publish backend/Supermarket.Api/Supermarket.Api.csproj -c Release -o publish
mkdir -p publish/wwwroot
cp -a frontend/dist/. publish/wwwroot/
node --test tests/smoke.mjs
```

The smoke test starts the real published app against an intentionally unreachable
local test database. It verifies the homepage, direct login navigation, JavaScript
assets, health endpoints, unavailable API responses, and unknown route handling.
It never connects to or modifies your Azure database.

For development-only admin assignment, explicitly set `AdminSetup:Enabled` to
true and `AdminSetup:Email` to an already registered user's email in local
configuration. This is disabled by default and never enabled in production.
