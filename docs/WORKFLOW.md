---

## 1. Two core resources

You’ll have **both**:

* **Payment** – on-chain payment record (what we already designed)
* **CheckoutSession** – short-lived object that:

    * Handles redirect
    * Controls which coins / networks / UI options are allowed
    * Links merchant → customer → payment

Conceptually:

* Merchant creates a **CheckoutSession**
* Customer is redirected to **your hosted checkout**
* Checkout internally creates/uses a **Payment**
* Smart contract / wallet interaction happens in your frontend
* Backend watches blockchain and updates **Payment** (and Session status)
* Webhooks tell merchant when the payment is confirmed

---

## 2. Checkout Session model (API-facing)

Example JSON for a checkout session:

```json
{
  "id": "cs_123",
  "status": "open", // open | completed | expired | canceled
  "mode": "payment", // maybe later subscription, donation, etc.
  "amount_fiat_cents": 5000,
  "fiat_currency": "EUR",

  "allowed_crypto_currencies": ["ETH", "USDT"],
  "allowed_networks": ["ethereum", "polygon"],

  "payment_id": "pay_123", // or null until created
  "success_url": "https://merchant.com/checkout/success?order_id=order_987",
  "cancel_url": "https://merchant.com/checkout/cancel?order_id=order_987",

  "customer_email": "user@example.com",
  "metadata": {
    "order_id": "order_987"
  },

  "checkout_url": "https://pay.yourgateway.com/checkout/cs_123",

  "expires_at": "2025-11-23T13:05:00Z",
  "created_at": "2025-11-23T12:50:00Z",
  "updated_at": "2025-11-23T12:50:00Z"
}
```

---

## 3. Create Checkout Session endpoint

### Endpoint

```http
POST /v1/checkout/sessions
Authorization: Bearer sk_test_123...
Content-Type: application/json
Idempotency-Key: order_987
```

### Request body (merchant → you)

```json
{
  "amount_fiat": "50.00", // or "amount_fiat_cents": 5000 in your internal model
  "currency": "EUR",

  "allowed_crypto_currencies": ["ETH", "USDT"],
  "allowed_networks": ["ethereum"],

  "customer_email": "user@example.com",

  "success_url": "https://merchant.com/checkout/success?order_id=order_987",
  "cancel_url": "https://merchant.com/checkout/cancel?order_id=order_987",

  "expires_in": 900,

  "metadata": {
    "order_id": "order_987"
  }
}
```

### Response

```json
{
  "id": "cs_123",
  "status": "open",
  "amount_fiat_cents": 5000,
  "fiat_currency": "EUR",

  "allowed_crypto_currencies": ["ETH", "USDT"],
  "allowed_networks": ["ethereum"],

  "payment_id": null,
  "success_url": "https://merchant.com/checkout/success?order_id=order_987",
  "cancel_url": "https://merchant.com/checkout/cancel?order_id=order_987",

  "customer_email": "user@example.com",
  "metadata": { "order_id": "order_987" },

  "checkout_url": "https://pay.yourgateway.com/checkout/cs_123",

  "expires_at": "2025-11-23T13:05:00Z",
  "created_at": "2025-11-23T12:50:00Z",
  "updated_at": "2025-11-23T12:50:00Z"
}
```

The merchant:

- Gets `checkout_url`
- On “Pay with crypto” button click → **redirects the user there**

---

## 4. What happens on your hosted checkout page

At `https://pay.yourgateway.com/checkout/cs_123`:

1. **Frontend loads Checkout Session**
   - `GET /v1/checkout/sessions/cs_123` (from your frontend, via your backend)

2. Shows:
   - Amount in fiat + approximate crypto preview
   - Networks / tokens to choose from (ETH, USDT, etc.)
   - “Connect wallet” button (WalletConnect, MetaMask, etc.)

3. User selects:
   - Network
   - Token (e.g. ETH on Ethereum)

4. When user clicks **Pay**:
   - Your frontend calls your backend to **create a Payment** for this session (if not already created)
   - Backend:
     - Creates `Payment` row (`status = pending`, `min_confirmations` based on network)
     - Returns payment details needed for smart contract call (amount, contract address, method, etc.)

   - Frontend triggers wallet transaction to your **payment smart contract**

Internally, you might implement:

```http
POST /v1/checkout/sessions/{id}/payments
```

Response:

```json
{
  "payment": {
    "id": "pay_123",
    "status": "pending",
    "amount_fiat_cents": 5000,
    "fiat_currency": "EUR",
    "amount_crypto": "0.015",
    "crypto_currency": "ETH",
    "network": "ethereum",
    "to_contract": "0xPaymentContract...",
    "data": "0xabc123...", // encoded function call
    "min_confirmations": 12
  }
}
```

Your UI uses that to build the `eth_sendTransaction` / WalletConnect request.

---

## 5. Backend: watching the blockchain

Your blockchain watcher(s):

- Watch your **payment contract** (e.g. events like `PaymentReceived(sessionId, paymentId, from, amount)`).
- Or watch direct transfers to your address if using EOA/deposit addresses.

Flow:

1. Tx seen in mempool / block:
   - You attach `tx_hash` to `Payment`
   - Optionally send `payment.pending` webhook

2. Once `min_confirmations` reached:
   - Update `Payment.status = "confirmed"`
   - Update `CheckoutSession.status = "completed"`
   - Fire `payment.confirmed` webhook to merchant

3. If nothing is paid before `expires_at`:
   - Mark `CheckoutSession.status = "expired"`
   - Optionally mark `Payment` as expired (if you pre-created one) or just leave none.

---

## 6. Webhook and redirects

After payment is confirmed:

- Send webhook (as you already planned):

  ```json
  {
    "id": "evt_790",
    "type": "payment.confirmed",
    "data": {
      "payment": { ... },
      "checkout_session": { "id": "cs_123", "status": "completed" }
    }
  }
  ```

- On the frontend (your hosted page), once you detect `confirmed`, you **redirect**:

  ```ts
  window.location.href = checkoutSession.success_url;
  ```

If user cancels on your page (back button / cancel button):

- Mark `CheckoutSession.status = "canceled"` (optional)
- Redirect to `cancel_url`.

---

## 7. Minimal extra endpoints for checkout session

You probably want:

```http
POST /v1/checkout/sessions
GET  /v1/checkout/sessions/{id}
GET  /v1/checkout/sessions?status=open&limit=20
POST /v1/checkout/sessions/{id}/expire     // optional, force expire from merchant backend
```

The merchant never needs to manually create `Payment` objects in this flow—only **Checkout Sessions**.
Your hosted page + smart contracts + blockchain watchers handle the rest.

---

## 8. How this fits your original idea

> “when user click pay with crypto it redirects to our check page where users connects wallet and all other stuff…”

✅ That’s exactly what `CheckoutSession` + `checkout_url` gives you.
Merchant’s job is super simple:

1. Call `POST /v1/checkout/sessions`
2. Redirect user to `checkout_url`
3. Listen for webhooks

If you want, next step I can:

- Sketch a **Postgres + Drizzle schema for `checkout_sessions`**
- Draft the **smart contract interface** for a Payment contract that emits events linking `checkout_session_id` / `payment_id` to on-chain transfers.
