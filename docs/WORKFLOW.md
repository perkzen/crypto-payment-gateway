You can think of a crypto payment gateway API as “Stripe PaymentIntents + blockchain stuff.”

Here’s a concrete example of **how your REST API could look**, with endpoints and JSON payloads you could actually implement.

---

## 1. Auth

Simple API key in header (like Stripe):

```http
Authorization: Bearer sk_test_123...
Content-Type: application/json
```

---

## 2. Core concept: `Payment`

A **Payment** represents a single on-chain payment for an order.

Basic fields:

```json
{
  "id": "pay_123",
  "status": "pending",              // pending | underpaid | overpaid | confirmed | expired | canceled
  "amount_fiat": "50.00",
  "fiat_currency": "EUR",
  "amount_crypto": "0.001234",
  "crypto_currency": "BTC",
  "network": "bitcoin",             // or ethereum, polygon, etc.
  "address": "bc1qxyz...",
  "tx_hash": null,
  "min_confirmations": 1,
  "confirmations": 0,
  "expires_at": "2025-11-23T13:05:00Z",
  "metadata": {
    "order_id": "order_987"
  },
  "created_at": "2025-11-23T12:50:00Z",
  "updated_at": "2025-11-23T12:50:00Z"
}
```

---

## 3. Create a payment

**Endpoint**

```http
POST /v1/payments
```

**Request body**

```json
{
  "amount": "50.00",
  "currency": "EUR",
  "crypto_currency": "BTC",
  "network": "bitcoin",
  "min_confirmations": 1,
  "expires_in": 900,
  "customer_email": "user@example.com",
  "success_url": "https://merchant.com/checkout/success?order_id=order_987",
  "cancel_url": "https://merchant.com/checkout/cancel?order_id=order_987",
  "callback_url": "https://merchant.com/webhooks/crypto",
  "metadata": {
    "order_id": "order_987"
  }
}
```

**What your gateway does internally**

* Fetches a crypto rate (BTC/EUR)
* Calculates `amount_crypto`
* Generates a **unique deposit address** for that payment
* Stores everything and starts watching the blockchain for that address

**Response**

```json
{
  "id": "pay_123",
  "status": "pending",
  "amount_fiat": "50.00",
  "fiat_currency": "EUR",
  "amount_crypto": "0.001234",
  "crypto_currency": "BTC",
  "network": "bitcoin",
  "address": "bc1qxyz...",
  "qr_code_url": "https://api.yourgateway.com/v1/payments/pay_123/qr",
  "min_confirmations": 1,
  "expires_at": "2025-11-23T13:05:00Z",
  "callback_url": "https://merchant.com/webhooks/crypto",
  "metadata": {
    "order_id": "order_987"
  }
}
```

The merchant shows the **address**, **amount**, and maybe the **QR** to the customer.

---

## 4. Get payment status

**Endpoint**

```http
GET /v1/payments/{payment_id}
```

**Sample response (after user paid, 0 confs)**

```json
{
  "id": "pay_123",
  "status": "pending",
  "amount_fiat": "50.00",
  "fiat_currency": "EUR",
  "amount_crypto": "0.001234",
  "crypto_currency": "BTC",
  "network": "bitcoin",
  "address": "bc1qxyz...",
  "tx_hash": "f2a5c7...",
  "received_amount_crypto": "0.001234",
  "min_confirmations": 1,
  "confirmations": 0,
  "expires_at": "2025-11-23T13:05:00Z",
  "metadata": {
    "order_id": "order_987"
  }
}
```

**After 1 confirmation**

```json
{
  "id": "pay_123",
  "status": "confirmed",
  "confirmations": 1,
  "tx_hash": "f2a5c7...",
  "received_amount_crypto": "0.001234",
  ...
}
```

---

## 5. Webhooks (callbacks to the merchant)

The most important part: notifying merchants.

**Merchant sets `callback_url`** on `POST /v1/payments`.
Your gateway sends webhooks on important events:

* `payment.pending` – seen on-chain, awaiting confirmations
* `payment.confirmed` – required confirmations reached
* `payment.underpaid` – amount < expected
* `payment.overpaid` – amount > expected
* `payment.expired` – no (or insufficient) funds until expiration

### Example webhook: payment.pending

```json
{
  "id": "evt_789",
  "type": "payment.pending",
  "created_at": "2025-11-23T12:55:00Z",
  "data": {
    "payment": {
      "id": "pay_123",
      "status": "pending",
      "crypto_currency": "BTC",
      "network": "bitcoin",
      "address": "bc1qxyz...",
      "tx_hash": "f2a5c7...",
      "received_amount_crypto": "0.001234",
      "min_confirmations": 1,
      "confirmations": 0,
      "metadata": {
        "order_id": "order_987"
      }
    }
  }
}
```

### Example webhook: payment.confirmed

```json
{
  "id": "evt_790",
  "type": "payment.confirmed",
  "created_at": "2025-11-23T12:57:00Z",
  "data": {
    "payment": {
      "id": "pay_123",
      "status": "confirmed",
      "crypto_currency": "BTC",
      "network": "bitcoin",
      "address": "bc1qxyz...",
      "tx_hash": "f2a5c7...",
      "received_amount_crypto": "0.001234",
      "min_confirmations": 1,
      "confirmations": 1,
      "metadata": {
        "order_id": "order_987"
      }
    }
  }
}
```

**Merchant response**

Your docs should say: respond with `200 OK` as acknowledgment. You can recommend retries if merchant returns non-2xx.

---

## 6. List payments

```http
GET /v1/payments?status=confirmed&limit=20
```

Response:

```json
{
  "data": [
    { "id": "pay_123", "status": "confirmed", ... },
    { "id": "pay_124", "status": "confirmed", ... }
  ],
  "has_more": false
}
```

---

## 7. Rates endpoint (optional but useful)

For merchants that want to show prices in crypto.

```http
GET /v1/rates?fiat=EUR&crypto=BTC
```

```json
{
  "fiat": "EUR",
  "crypto": "BTC",
  "rate": "40500.34",       // 1 BTC = 40500.34 EUR
  "timestamp": "2025-11-23T12:40:00Z"
}
```

---

## 8. Security details you’d want

* **API keys** for merchants (secret key, maybe also a public key if you offer client-side calls).

* **Webhook signatures** (HMAC):

  Header example:

  ```http
  X-Signature: t=1732362850,v1=hexhmac...
  ```

* **Idempotency keys** for `POST /v1/payments` so merchants don’t create duplicates if they retry.

  ```http
  Idempotency-Key: order_987
  ```

---

## 9. Typical merchant flow with this API

1. Merchant backend calls `POST /v1/payments` with order info.
2. Merchant frontend redirects user to **payment page** you host *or* renders a page with your returned `address` + `amount_crypto` + QR.
3. Customer sends crypto to the address.
4. Your gateway:

    * Detects incoming tx
    * Sends `payment.pending` webhook
    * Waits for `min_confirmations`
    * Sends `payment.confirmed` webhook
5. Merchant:

    * On `payment.confirmed`, marks `order_987` as paid and grants access / ships product.
6. Later, you batch on-chain balances and send to merchant’s **payout wallet** (another API concept if you want to expose it).

---

