# Graduate portfolio readiness plan

> **For agentic workers:** Use the executing-plans workflow to complete the checklist; independent documentation and bounded test fixes can run in parallel.

**Goal:** Make the existing supermarket project reliable, demonstrable and understandable without expanding its feature set.

**Architecture:** Keep React, ASP.NET Core Identity, EF Core/SQL Server and Azure deployment. Correct existing behavior and test wiring, then document the actual implementation and its limits.

**Tech Stack:** React/TypeScript, Vitest, Node tests, ASP.NET Core 10, xUnit, SQL Server, GitHub Actions.

**Spec:** The user's request to stabilize the current flows, prepare demo/README materials and explain the code for graduate interviews.

## Constraints and review focus

- Preserve unrelated uncommitted work; no reset, automatic commit, push or deployment.
- No real payment integration, inventory expansion or other new business features.
- Never claim an online environment or credentials work without checking them.
- Test directory errors must not produce a misleading zero-test success.
- Logout must end the server session; UI routing alone is insufficient.
- Permissions must protect API writes as well as page navigation.
- Empty/error/loading dashboard states are independent between sections.
- Do not claim in-memory tests prove SQL Server transaction/concurrency behavior.

## Tasks

- [x] Correct the chart test scope and test entry point; run all frontend tests.
- [x] Fix logout and uncovered API authorization; verify with regression tests.
- [x] Run backend tests, build, lint and published application smoke checks; address material failures.
- [x] Extend CI to run frontend/backend tests on pull requests without deploying a PR.
- [x] Prepare an accurate README, demo checklist and Chinese project walkthrough, including demo account setup and explicit limitations.
- [x] Review the complete change and record final evidence and any external blockers.

## Decisions and evidence

- Work in the existing checkout because the task concerns extensive current uncommitted changes.
- Initial backend suite: 15 passed; dependency audit reports vulnerable transitive Pkcs 9.0.4.
- Initial chart failure is a test scoping problem: the chart and top-selling list share empty-state wording.
- Initial npm test command targets deleted tests/ instead of current test/ and runs zero tests.
- Public Azure URL and demo account availability must be checked separately from local source readiness.
- Final evidence: 12 Node and 14 Vitest frontend tests, 45 backend tests, one published-app smoke check all pass; frontend build and backend publish succeed. Four pre-existing React effect warnings and a bundle-size warning remain.
- Local SQL: customer demo login, one simulated order (ID 7), trusted total, one-unit stock deduction, own history and cookie logout verified. No real payment; this is not concurrency testing.
- Read-only final review found no blocking issues. Azure URL timed out; user elected to keep the same Azure target and handle online availability after local readiness.
- User subsequently authorized committing and pushing to the existing GitHub repository. The checked-out branch is main; its push triggers the existing Azure deployment workflow.
