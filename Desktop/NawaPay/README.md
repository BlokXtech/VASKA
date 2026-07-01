# NAWAPAY

NAWAPAY is a secure middleman payment platform. A customer pays NAWAPAY, then NAWAPAY routes and settles the payment to the correct service provider, such as electricity vendors, MTC/TN mobile airtime, merchant tills, or regulated betting wallets like Castle Bet and JSB.

## Stack

- Frontend: React, TypeScript, HTML5, CSS3
- Backend: Node.js, Express.js, TypeScript
- Databases: MongoDB for wallet/payment documents, PostgreSQL-compatible SQL for ledgers and audit records
- DevOps: Docker, Kubernetes manifests, GitHub Actions CI
- Compliance: KYC, AML risk scoring, GDPR privacy controls, ISO 27001-aligned operational controls

## Product Model

NAWAPAY acts as the payment switch between customers and providers:

- Customer chooses a service, such as electricity, MTC airtime, TN mobile credit, merchant payment, Castle Bet, or JSB.
- NAWAPAY collects the money from the customer wallet, card, cash-in agent, or merchant QR flow.
- NAWAPAY screens the transaction for KYC/AML risk.
- NAWAPAY settles the value into the provider settlement wallet and keeps a configured commission.
- NAWAPAY stores an audit trail for compliance and reconciliation.

## Operator Provider Sales

The operator terminal supports cash-desk flows:

- Electricity: operator enters meter number and amount, NAWAPAY connects to the electricity provider and returns a token.
- Betting: customer gives cash, operator enters betting account and amount, NAWAPAY connects to the selected betting provider and returns a PIN/reference.
- Airtime/data providers can use the same connector pattern.

Provider API keys are configured through environment variables, not source code. See `apps/api/.env.example`.

Backend endpoint:

```http
POST /api/operator/provider-sales
```

Required fields include `providerId`, `customerAccount`, `amountMinor`, `cashReceivedMinor`, `operatorId`, `channel`, and `reference`. The API returns the transaction, provider fulfilment result, generated token/PIN, provider reference, and change due.

## Run Locally

```bash
npm install
npm run dev:api
npm run dev:web
```

The API runs on `http://localhost:4100` and the web app runs on `http://localhost:5173`.

Frontend pages:

- Home: `http://localhost:5173/`
- About Us: `http://localhost:5173/about`
- Privacy and Policy: `http://localhost:5173/privacy`
- Contact Us: `http://localhost:5173/contact`

## Docker

```bash
docker compose up --build
```

## Services

- `apps/api`: REST API for wallets, providers, provider payments, merchants, KYC, AML, audit events, and health checks.
- `apps/web`: NAWAPAY operations console for payment-provider routing, compliance workflows, About Us, Privacy and Policy, Contact Us, and footer content.
- `infra/k8s`: Kubernetes deployment, service, config, and secret templates.
- `infra/sql`: SQL ledger and audit schema.
- `docs/architecture.md`: microservice, data, security, and production architecture notes.

## Security And Compliance Notes

This is a starter implementation, not a certified production system. Before production use, add external identity verification, HSM-backed key management, PCI DSS scope review, independent penetration testing, formal ISO 27001 evidence collection, and jurisdiction-specific licensing/legal review.
