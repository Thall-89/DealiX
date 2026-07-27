# Quality baseline

DealiX protects its core business rules with fast unit tests. Run the complete local quality gate before merging a change:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Covered workflows

- Confirmed build profit uses the actual payout, never an advertised sale price.
- Projections remain visibly incomplete when known costs or parts are missing.
- Part-out sales distinguish recovered cash from unsold estimated value.
- Build Health blocks high-priority missing parts and only marks fully tested builds ready.
- Deal scoring returns explainable recommendations and surfaces incomplete listing risks.

## Dependency review

`npm audit` currently reports high-severity transitive advisories in the Next.js and ESLint dependency trees. The available automatic remedies propose incompatible major-version downgrades, so they must not be applied automatically. Review upstream Next.js and ESLint releases before changing these packages.

## Next priorities

1. Add browser tests for sign-in, build creation, inventory assignment, and saved-data refresh.
2. Add integration tests against a disposable Supabase project for RLS and ownership policies.
3. Add CI that runs this quality gate for every pull request.
