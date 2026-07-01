# NAWAPAY Architecture

NAWAPAY is organized as a workspace so each domain can become an independently deployed microservice as volume grows. The product acts as a middleman payment switch: customers pay NAWAPAY, then NAWAPAY routes and settles value to electricity, airtime, merchant, and regulated betting providers.

## Domain Boundaries

- Wallet service: balances, KYC state, limits, wallet lifecycle.
- Payment switch service: payment initiation, provider routing, screening, settlement orchestration.
- Provider service: electricity, MTC/TN airtime, data bundles, betting wallets, and other biller integrations.
- Merchant service: merchant onboarding, settlement wallet assignment, compliance tiering.
- Compliance service: KYC/AML policy checks, GDPR data minimization, audit reports.
- Ledger service: SQL-backed immutable posting records and reconciliation exports.

## Data Strategy

- MongoDB stores flexible wallet, merchant, and case-management documents.
- SQL stores ledger postings, audit evidence, settlement batches, and reconciliation data.
- Sensitive fields should be encrypted with KMS-managed keys before persistence.
- Audit events are append-only and should be shipped to a tamper-evident log sink.

## Security Controls

- JWT service tokens for API access.
- Rate limiting and hardened HTTP headers.
- KYC status enforced before settlement.
- AML score and flag evaluation before transaction approval.
- GDPR-friendly report responses that avoid unnecessary personal data.
- ISO 27001-aligned evidence points for access control, logging, and change management.

## Production Extensions

- Use managed AWS EKS, DocumentDB or MongoDB Atlas, RDS PostgreSQL, KMS, Secrets Manager, WAF, CloudTrail, GuardDuty, and centralized SIEM forwarding.
- Add PCI DSS review if handling card data directly.
- Add sanctions/PEP screening provider integrations.
- Split services behind an API gateway when teams and traffic justify independent release cycles.
