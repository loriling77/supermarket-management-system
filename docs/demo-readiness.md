# Local Demo Preparation and Verification

This guide explains how to run and demonstrate the application.

## Local demo account

Run from the repository root:

```powershell
node scripts/prepare-local-demo.mjs
```

The generated customer credentials are stored in `.demo-credentials.local.json`, which Git ignores. Repeated runs reuse and verify the existing account. View the password locally; keep it out of the README, screenshots and commits.
The script only accesses the local API. It does not create an Azure account or grant administrator permissions.

### Administrator demo

Use an existing administrator account. To configure a new local administrator:

1. Register a dedicated account through the registration page.
2. Temporarily configure the development environment:

   ```powershell
   dotnet user-secrets set "AdminSetup:Enabled" "true" --project backend/Supermarket.Api
   dotnet user-secrets set "AdminSetup:Email" "YOUR_REGISTERED_DEMO_EMAIL" --project backend/Supermarket.Api
   ```

3. Restart the local API and wait for `/health/ready` to return 200.
4. Set `AdminSetup:Enabled` to `false`, restart, and sign in with that account.

Initialization only runs in Development and promotes the specified existing account. It is not a public role-management endpoint and does not automatically grant permissions in Azure.

## Five-minute demonstration

| Time | Action | What to explain |
| --- | --- | --- |
| 0:00-0:40 | Sign in as a customer | A usable entry point; keep the credentials file private |
| 0:40-1:30 | Search with Enter, choose quantities and add the same product again | Case-insensitive search, accumulated quantities and stock limits |
| 1:30-2:15 | Complete simulated checkout and open My orders | Database prices, stock deduction and persistent orders; no real charge |
| 2:15-3:00 | Generate an AI list and edit quantities when AI is configured | Recalculated totals, stock boundaries and failure feedback |
| 3:00-4:15 | Log out, sign in as an administrator and edit a product | Session logout, highlighted Save/muted Add, and refreshed data after saving |
| 4:15-5:00 | Show statistics, customer orders and the relevant tests/source | Explain the implementation and its verification limits |

Customer search matches usernames only. Product/category/manufacturer writes require Admin; category/manufacturer reads allow Admin or User; AI requires User.
Use dedicated temporary records when demonstrating deletion. Records referenced by products or orders may be protected from deletion.

## Local verification

```powershell
# Check login, cookies, products, personal orders and logout
node scripts/verify-local-demo.mjs

# Optional: create one simulated order and consume one unit of stock
node scripts/verify-local-demo.mjs --checkout
```

The recorded `--checkout` run created local simulated order 7 and verified the database price, a one-unit stock deduction, personal order history and cookie logout. No real payment occurred.
This check depends on a real local API/SQL database and is not part of database-free CI. One successful purchase is not a concurrency test.

## Verification record (2026-10-22)

| Check | Result and limits |
| --- | --- |
| `npm test` | After correcting the test directory, all 12 Node tests and 14 Vitest tests passed |
| `dotnet test` | 45 passed, including 30 HTTP routing/authorization cases; test identities and InMemory are not real login/SQL verification |
| Local API/SQL | Readiness, demo account, one simulated purchase, stock deduction, order history and logout passed |
| Dashboard test | Previously matched identical empty-state text across sections; now scoped to the chart section with empty/error coverage |
| Logout | Calls the backend, keeps the current page and shows an error on failure, and allows expired sessions to return to sign-in |
| Order dialog | Displays request errors rather than reporting an empty order history |
| Dependencies | Pkcs upgraded to 10.0.13; the previous two vulnerability warnings no longer appeared in the backend test run |
| Frontend build/backend publish | Both passed; separate output directories avoided interfering with the running local API |
| Published application smoke test | One passed, covering pages, static assets and correct health/API statuses with an unavailable database |
| Final read-only review | No concrete issues blocking the commit were found |
| Azure, initial readiness check | The page and readiness requests timed out during the initial check; this was not the final deployment result |

Static analysis reported no errors and four existing React effect warnings. The build also reported a large bundle. These warnings have not been eliminated.

After the recorded initial check, deployment of commit `a34c25a` succeeded, the online login page and readiness endpoint returned 200, and the user confirmed the AI assistant worked after configuring the Azure AI app settings. These are point-in-time results, not a guarantee of current uptime.

## Commit and deployment

The project uses the existing Azure site. Before sharing a new version:

1. Review the diff and commit the intended source, tests, documentation and configuration.
2. Confirm `.demo-credentials.local.json`, `.env`, database passwords and AI keys are not tracked.
3. Run frontend tests/build/lint, backend tests and the published application smoke check.
4. Commit locally and push to GitHub. Main pushes trigger the existing deployment workflow; PRs only build and test.
5. Follow the [Azure deployment guide](azure-deployment.md) for configuration, networking, migrations and AI. Confirm `/health/ready` returns 200 before sharing the site.
6. Customers can register online. The owner configures administrator accounts separately; local demo accounts are not online accounts.

Verify commits, remote branches and Actions results separately. Local demo accounts are not automatically created in Azure; the site owner prepares online data, configuration and administrator access.
