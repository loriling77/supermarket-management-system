# Azure frontend deployment implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement the tasks in this isolated checkout.

**Goal:** Serve the React website and API from the existing Azure App Service and make database startup failures visible.

**Architecture:** Vite builds the frontend, then GitHub Actions places its output in the published API's wwwroot. Browser requests use /api on the same host; Vite proxies /api during local development. A background initializer creates the existing Identity roles with retries; API requests and readiness return 503 until initialization succeeds, while static pages and liveness remain accessible.

**Tech stack:** React, Vite, ASP.NET Core 10, SQL Server, GitHub Actions.

**Spec:** User request in this chat: deploy the frontend also and fix the blank site after successful deployment. Decisions made here: use the existing App Service rather than introduce a second hosting service; keep database migrations explicit; preserve all unrelated uncommitted work in the original checkout.

## Global constraints

- Keep existing Azure secret references and App Service name.
- No credentials in source, browser bundles, or test output.
- Do not automatically apply database migrations or create an administrator.
- Startup must not depend on the availability of SQL Server.
- Readiness must not report success before database role initialization succeeds.

## Review focus

- Direct navigation to /login must serve the React page.
- A missing JS file must be 404, not index.html.
- Database failure must keep pages reachable and return 503 for API/readiness.
- Unmatched /api and /health routes must never return index.html.
- Browser bundles must not call the visitor's localhost.

## Task 1: Combined site and resilient startup

- [x] Write tests/smoke.mjs using Node's built-in test runner to launch the real published app against an unreachable test database. Assert homepage and /login 200; linked JS 200 with no localhost:5252; missing assets 404; liveness 200; readiness and API 503; unknown health route 404. Run against baseline and observe failure to start.
- [x] Replace frontend localhost API references with relative /api paths and configure Vite's local /api proxy to http://localhost:5252.
- [x] Add DatabaseInitializer BackgroundService with retry logging, a readiness flag, and cancellation. Register it as the same singleton instance used by hosted-service initialization. Remove blocking startup role initialization; retain development-only administrator assignment inside the initializer, after roles exist.
- [x] Serve default/static files and React deep links; reserve /api and /health fallbacks. Add /health/live and /health/ready, and return a generic 503 problem for API requests before initialization.
- [x] Build frontend and API, copy frontend dist into publish/wwwroot, run smoke tests, lint and inspect emitted artifacts.

## Task 2: Deployment workflow and setup instructions

- [x] Add Node 22 setup, npm ci, frontend build, copy to publish/wwwroot, and the real smoke test before upload in GitHub Actions.
- [x] Verify the deployed homepage and database readiness with bounded retries after deployment, so upload success cannot conceal an unavailable application.
- [x] Document Azure .NET 10 runtime, DefaultConnection connection string, Azure SQL access/schema setup, restricted log-viewer fallback, and new health endpoints in docs/azure-deployment.md.
- [x] Parse workflow YAML, rerun all smoke checks, request independent review, and prepare only this task's changes for integration.

## Verification and decisions

- Baseline: smoke test reproduced process exit on SQL failure; frontend build failed on the corrupt route guard and unused declarations.
- Final: frontend TypeScript/Vite build passes; lint has five existing warnings. API publish passes with existing System.Security.Cryptography.Pkcs 9.0.4 vulnerability warnings. Real published-application smoke checks pass.
- Browser: login and registration pages render from the combined package.
- Independent review found a new global retry policy incompatible with the existing checkout transaction. Removed that policy; startup retries remain in DatabaseInitializer. Reviewer found no remaining actionable issues.
- The user's database is Azure SQL, but Azure CLI is not locally signed in and the portal log viewer returns Forbidden. Cloud connection settings, schema initialization, and authenticated checkout cannot be verified locally.
- Ruling: no automatic EF migrations. Database changes remain an explicit operator step to avoid modifying an existing Azure SQL database without inspection.
- Ruling: the original checkout's unrelated changes remain untouched; only its already-corrected route guard was reused to fix the committed frontend build.
