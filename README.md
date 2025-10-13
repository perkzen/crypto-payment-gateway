# Crypto Payment Gateway — Implementation Plan (To-Dos)

Below is a concise, practical roadmap you can execute. It includes **backend APIs**, **DB schema**, and **frontend apps** (Checkout UI, Merchant Dashboard, Admin Dashboard).

---

## 0) Tech Stack (suggested)

* **Backend**: Node.js + TypeScript, Fastify/Express, Viem, BullMQ + Redis, PostgreSQL (Prisma), Zod (validation)
* **Infra**: Alchemy/Infura (WS), Docker, Fly/Render/Vercel, KMS for secrets
* **Frontend**: Next.js (App Router), React, Wagmi + Viem, Tailwind, shadcn/ui
* **Auth**: Clerk/Auth.js (dashboards), API Keys (HMAC) for merchants
* **Compliance**: Persona/Sumsub (KYB), TRM/Chainalysis (wallet screening)

---

## 1) To-Dos (high level)

* [ ] Write deployment scripts for `CryptoPay` + verify on testnet
* [ ] Publish **ABI + addresses** to `/deployments/<chainId>.json`
* [ ] Stand up **Invoice API** (create/list/get)
* [ ] Implement **Event Listener** (PaidNative/PaidToken) + confirmations
* [ ] Implement **Webhook Dispatcher** (HMAC + retries, idempotency)
* [ ] Build **Checkout UI** (QR + WalletConnect + Pay)
* [ ] Build **Merchant Dashboard** (invoices, webhooks, API keys)
* [ ] Build **Admin Dashboard** (merchants, risk, ops actions)
* [ ] Monitoring + alerting + runbooks (pause/unpause, reorgs)
* [ ] KYB (merchant onboarding) + optional wallet screening

---

## 2) Backend APIs

### Auth & Keys

* `POST /v1/auth/keys` → create API key (merchant-scoped)
* `GET /v1/auth/keys` → list keys
* `DELETE /v1/auth/keys/:id` → revoke

### Invoices

* `POST /v1/invoices`

    * **Body**: `{ amount: string, asset: { type: "native"|"erc20", address?: string }, chainId: number, merchant: Address, successUrl: string, cancelUrl: string, expiresInSec?: number, metadata?: object }`
    * **Resp**: `{ invoiceId, chainId, asset, amount, merchant, expiresAt, checkoutUrl }`
* `GET /v1/invoices/:invoiceId`

    * **Resp**: `{ status: "created"|"pending"|"confirmed"|"expired"|"failed", txHash?, payer?, confirmations?, netAmount?, feeAmount? }`
* `GET /v1/invoices?status=&cursor=&limit=` (merchant-scoped list)
* `POST /v1/invoices/:invoiceId/cancel` (optional if you allow manual cancel)

### Webhooks

* `POST /v1/merchants/webhook-url` (set/update)
* Outbound: `payment.confirmed`, `payment.failed`, `invoice.expired`

    * Signed with HMAC: `X-Signature: sha256=<hex>`

### Events & Status

* **Server-Sent Events**: `GET /v1/invoices/:invoiceId/stream`

    * Emits: `status:update` with `{ status, txHash, confirmations }`
* **Indexer Admin** (internal):

    * `POST /v1/indexer/replay?fromBlock=` (re-sync)
    * `GET /v1/indexer/lag` (health)

### Risk (optional)

* `POST /v1/risk/screen` `{ address, chainId }` → `{ riskScore, reason }`

### Admin (internal)

* `GET /v1/admin/merchants`
* `PATCH /v1/admin/merchants/:id` (enable/disable test mode, pause merchant)
* `GET /v1/admin/webhooks?status=failed` (retry queue overview)

---

## 3) Database Schema (PostgreSQL)

```sql
-- Merchants & API keys
CREATE TABLE merchants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL,
  kyb_status      text NOT NULL DEFAULT 'pending', -- pending|verified|rejected
  webhook_url     text,
  hmac_secret     text, -- rotate regularly (store encrypted via KMS)
  test_mode       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  key_hash        text NOT NULL, -- store hash only
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz
);

-- Invoices
CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      bytea UNIQUE NOT NULL, -- bytes32 from your contract (store as bytea/hex)
  merchant_id     uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  chain_id        integer NOT NULL,
  asset_type      text NOT NULL CHECK (asset_type IN ('native','erc20')),
  asset_address   bytea, -- null for native
  amount_wei      numeric(78,0) NOT NULL, -- bigint-like
  status          text NOT NULL DEFAULT 'created', -- created|pending|confirmed|expired|failed
  payer           bytea,
  merchant        bytea NOT NULL,
  tx_hash         bytea,
  fee_wei         numeric(78,0),
  net_wei         numeric(78,0),
  success_url     text,
  cancel_url      text,
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  confirmed_at    timestamptz
);

-- Events seen on-chain (audit trail)
CREATE TABLE payment_events (
  id              bigserial PRIMARY KEY,
  invoice_id      uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  chain_id        integer NOT NULL,
  block_number    numeric(78,0) NOT NULL,
  log_index       integer NOT NULL,
  tx_hash         bytea NOT NULL,
  payer           bytea NOT NULL,
  gross_wei       numeric(78,0) NOT NULL,
  fee_wei         numeric(78,0) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chain_id, tx_hash, log_index)
);

-- Webhooks & deliveries
CREATE TABLE webhooks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  event_type      text NOT NULL,
  payload         jsonb NOT NULL,
  status          text NOT NULL DEFAULT 'queued', -- queued|sent|failed
  attempts        int  NOT NULL DEFAULT 0,
  last_status     int, -- last HTTP status
  signature       text, -- HMAC you sent
  created_at      timestamptz NOT NULL DEFAULT now(),
  sent_at         timestamptz
);

-- Optional AML-lite
CREATE TABLE risk_checks (
  id              bigserial PRIMARY KEY,
  merchant_id     uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  address         bytea NOT NULL,
  chain_id        integer NOT NULL,
  risk_score      int NOT NULL,
  verdict         text,
  checked_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (address, chain_id)
);
```

**Indexes to add**

```sql
CREATE INDEX invoices_status_idx ON invoices (status);
CREATE INDEX invoices_invoiceid_idx ON invoices (invoice_id);
CREATE INDEX events_tx_idx ON payment_events (tx_hash);
CREATE INDEX webhooks_status_idx ON webhooks (status, attempts);
```

---

## 4) Event Listener / Indexer (flow)

* Subscribe to `PaidNative` & `PaidToken`
* On log:

    1. Parse `{ invoiceId, payer, merchant, (token?), grossAmount, feeAmount }`
    2. Find invoice by `invoice_id`
    3. If first seen: set **pending**
    4. After **N confirmations**: set **confirmed**, compute `net = gross - fee`, insert `payment_events`
    5. Enqueue `webhook.send(payment.confirmed)` (BullMQ)
* Handle **reorgs**: on reorg callback or missing receipt, roll back → `pending` and re-check.

---

## 5) Webhook Dispatcher

* Queue job: `{ merchantId, eventType, payload }`
* Compute signature: `sig = HMAC_SHA256(secret, JSON.stringify(payload))`
* POST with headers:

    * `X-Signature: sha256=${sig}`
    * `X-Event: payment.confirmed`
    * `Idempotency-Key: <invoiceId>`
* Retries: **exponential backoff** (e.g., 1m, 5m, 15m, 1h, 6h, 24h; max 8)
* Mark `sent` or `failed` with last status & attempts

**Sample payload**

```json
{
  "event": "payment.confirmed",
  "invoiceId": "0x...",
  "txHash": "0x...",
  "chainId": 84532,
  "payer": "0x...",
  "merchant": "0x...",
  "asset": { "type": "native" },
  "grossAmount": "100000000000000000",
  "feeAmount": "2500000000000000",
  "netAmount": "97500000000000000",
  "confirmedAt": "2025-10-11T10:00:00Z"
}
```

---

## 6) Frontend Apps

### A) **Checkout UI (Hosted)**

**Pages**

* `/checkout/[invoiceId]`

    * Fetch invoice via `GET /v1/invoices/:id`
    * Show **amount**, **token/native**, **merchant**, **expiry timer**
    * **QR code** (address + calldata if token), **Pay** button
    * Wallet connect (RainbowKit: https://rainbowkit.com/)
    * Logic:

        * If **native** → `payNative(invoiceId, merchant)` with `{ value }`
        * If **ERC-20** → `permit` (if supported) then `payToken(...)`
    * Stream updates via **SSE** to show `pending/confirmed/expired`
    * Redirect to `successUrl`/`cancelUrl`

**Components**

* InvoiceSummary, QRCode, WalletButton, PayButton, StatusBadge, Countdown

**Edge cases**

* Wrong network → prompt switch
* Insufficient funds
* Expired invoice → regenerate link

---

### B) **Merchant Dashboard**

**Views**

* Overview (KPIs: volume, fees, success rate)
* Invoices (table + filters; create invoice modal)
* Webhooks (status, retry button)
* API Keys (create/rotate/revoke)
* Settings (webhook URL, allowed assets/chains, test mode)
* KYB status (submit docs, track status)

**Actions**

* Create invoice (calls `POST /v1/invoices`)
* Retry webhook
* Rotate HMAC secret

---

### C) **Admin Dashboard**

**Views**

* Merchants list (status, KYB state, test/prod toggle)
* Risk queue (high-risk addresses, manual review)
* Webhooks failures digest
* Indexer health (lag, last block processed)
* Contract controls (pause/unpause banner + runbook link)

---

## 7) Security & Resilience To-Dos

* [ ] Enforce **HMAC** on all outbound webhooks; idempotency keys
* [ ] **Rate-limit** all public APIs; per-merchant quotas
* [ ] Use **Zod** to validate all requests
* [ ] **Confirm after N blocks** (per chain configurable)
* [ ] **Reorg** handling and replay capability
* [ ] **Pausable** surfaced in admin with SOP
* [ ] Secrets in **KMS/Vault**, not in envs long-term
* [ ] Logs + metrics (request rate, error %, queue lag, event lag)

---

## 8) Milestones (execution order)

1. Contracts deployed & verified (testnet)
2. Indexer + DB + Webhook dispatcher running (testnet)
3. Invoice API stable + Checkout UI MVP
4. Merchant Dashboard (API keys, invoices, webhooks)
5. Admin Dashboard (ops/health)
6. KYB + optional AML-lite
7. Monitoring/alerts + runbooks
8. Mainnet pilot with 1–2 merchants

---

## 9) Minimal ER Outline

```
Merchants (1)───(N) APIKeys
    │
    └──(1)───(N) Invoices ───(1)───(N) PaymentEvents
    │
    └──(1)───(N) Webhooks
```

---

If you want, I can generate **Prisma models**, **Fastify route stubs**, and a **Next.js page skeleton** for `/checkout/[invoiceId]` based on this plan.
