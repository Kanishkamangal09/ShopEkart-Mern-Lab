# 🛍️ ShopKart

An online shopping app where people can sign up, browse products, save favourites, fill a cart, pay securely with Razorpay and track their orders.

Built with **MongoDB, Express, React and Node.js**.

```text
Browse → Wishlist → Cart → Checkout → Pay (Razorpay) → Order placed → My Orders
```

---

## Features

- **Accounts:** sign up, log in, stay logged in, change password, log out
- **Catalogue:** products come from the database, with search by name, category filter and price sorting
- **Product page:** large image, description, price and stock
- **Wishlist:** save products with ♡, view them later, remove them; the saved count shows in the navbar
- **Cart:** add items, change quantities, remove items and see the order summary. The cart is saved to your account and never goes above the available stock
- **Checkout:** shipping form with validation, final review, then payment with **Razorpay** (cards, UPI, netbanking)
- **Orders:** confirmation page, order history, and a details page with a delivery tracker (Placed → Confirmed → Shipped → Delivered)
- Works on desktop and mobile

---

## Getting Started

**Requirements:** Node.js 18+, a MongoDB Atlas cluster (free tier works) and a Razorpay account (Test Mode is free).

**1. Create `backend/.env`** (see `backend/.env.example`)

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopkart
JWT_SECRET=any_long_random_text

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

ADMIN_KEY=any_secret_text        # optional, for updating order status
```

- **MongoDB:** in Atlas, go to **Network Access** and add your IP, or the backend can't connect.
- **Razorpay:** in the Razorpay Dashboard, switch to **Test Mode**, then go to **Account & Settings → API Keys → Generate Test Key**. The Key Secret stays in `.env` only and is never sent to the browser.

**2. Start the backend**

```bash
cd backend
npm install
npm start          # → "MongoDB connected", "Server running on port 5001"
npm run seed       # one time: adds 10 sample products
```

**3. Start the frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Use `localhost`, not `127.0.0.1`.

> The backend doesn't reload by itself. Restart it (Ctrl+C → `npm start`) after changing backend code or `.env`.

**Test payments:** in Test Mode no real money is charged. In the Razorpay window, pay with **UPI → `success@razorpay`** (or `failure@razorpay` to test a failed payment), or with a test card from [Razorpay's test card list](https://razorpay.com/docs/payments/payments/test-card-details/).

---

## Project Structure

```text
backend/
├── index.js            server setup, MongoDB connection, routes
├── config/razorpay.js  Razorpay client (reads keys from .env)
├── models/             Customer, Product, Order
├── controllers/        logic for each API (customer, product, wishlist, cart, order)
├── routes/             URL → controller
├── middlewares/        auth (checks the login token), admin key
└── utils/              token creation, id check, sample data

frontend/src/
├── App.jsx             all page routes
├── services/api.js     every API call
├── context/            shared state: logged-in user (AuthContext) and cart (CartContext)
├── pages/              Home, Products, ProductDetails, Wishlist, Cart, Checkout,
│                       OrderSuccess, Orders, OrderDetails, Profile, Login, Register
├── components/         Navbar, ProductCard, CartItem, CheckoutForm, OrderCard, ...
└── utils/              Razorpay script loader, address validation, date format
```

---

## Data Model

**Customer:** `fullName`, `email` (unique), `password` (bcrypt hash), `phone`, `wishlist`, `cart`, `createdAt`

**Product:** `name`, `description`, `price` (> 0), `category`, `image`, `stock` (≥ 0), `createdAt`

**Order:** `user`, `items`, `shippingAddress`, `totalAmount`, `paymentStatus` (`PENDING` / `PAID` / `FAILED`), `status` (`PENDING_PAYMENT` → `PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`), `razorpayOrderId`, `razorpayPaymentId`, `createdAt`

**References vs snapshots:**

- The **wishlist** (`[productId]`) and the **cart** (`[{ product, quantity }]`) store only product IDs, so they always show the **current** price and stock.
- An **order** copies each product's `name`, `price` and `image` at the moment of purchase. If a price changes later, old orders still show what the customer actually paid.
- Totals such as the cart subtotal and item count are never stored; they're calculated from the cart.

Categories: `Electronics`, `Fashion`, `Books`, `Home` (case-sensitive).

---

## API

Base URL `http://localhost:5001`. 🔒 = requires login.

| Method | Endpoint | | Description |
| --- | --- | --- | --- |
| POST | `/customers/register` | | Create an account |
| POST | `/customers/login` | | Log in (sets a `token` cookie) |
| GET | `/customers/me` | 🔒 | Current user's profile |
| POST | `/customers/logout` | 🔒 | Log out |
| PATCH | `/customers/change-password` | 🔒 | Change password |
| POST | `/products` | | Add a product |
| GET | `/products` | | List products (`?search=`, `?category=`, `?sort=price_asc` or `price_desc`) |
| GET | `/products/:id` | | One product |
| GET | `/wishlist` | 🔒 | Current user's saved products |
| POST | `/wishlist/:productId` | 🔒 | Save a product |
| DELETE | `/wishlist/:productId` | 🔒 | Remove a product |
| PATCH | `/wishlist/:productId/toggle` | 🔒 | Save if not saved, remove if saved |
| GET | `/cart` | 🔒 | Current user's cart (with product details) |
| POST | `/cart/:productId` | 🔒 | Add 1 (new item, or +1 if already in the cart) |
| PATCH | `/cart/:productId` | 🔒 | Set quantity, body `{ "quantity": 3 }` |
| DELETE | `/cart/:productId` | 🔒 | Remove from cart |
| POST | `/orders/create-payment-order` | 🔒 | Check the cart, create a pending order + Razorpay order. Body: `{ shippingAddress }` |
| POST | `/orders/verify-payment` | 🔒 | Verify the Razorpay signature → order `PAID`, cart emptied |
| GET | `/orders` | 🔒 | Current user's orders, newest first |
| GET | `/orders/:id` | 🔒 | One of your own orders |
| PATCH | `/orders/:id/status` | 🔑 | Move an order to the next status. Needs header `x-admin-key` |

- **Cart:** every cart endpoint returns the updated cart. Quantities must be whole numbers from 1 up to the product's stock.
- **Orders:** checkout only takes the shipping address. The server reads the cart, checks stock and calculates the total itself, and ignores any price or total sent by the browser.

**Status codes:** `200` OK · `201` created · `400` bad input, invalid ID, not enough stock or invalid payment · `401` not logged in · `403` admin only · `404` not found · `409` already exists (email or wishlist item) · `500` server error · `502` payment provider unavailable

Example bodies:

```json
// POST /products
{ "name": "Mechanical Keyboard", "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999, "category": "Electronics", "stock": 10,
  "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800" }

// POST /orders/create-payment-order
{ "shippingAddress": { "fullName": "Aarav Sharma", "phone": "9876543210", "addressLine1": "22 MG Road",
  "city": "Bengaluru", "state": "Karnataka", "pincode": "560001" } }
```

---

## How It Works

**Login:** the password is checked with bcrypt. The server then creates a JWT holding the user's ID and sends it in an **HttpOnly cookie**, so JavaScript can't read it. The browser sends the cookie with every request. The auth middleware verifies the token and sets `req.user`. The server always gets the user from this token, never from the request body.

**Search & filter:** the frontend sends `GET /products?search=phone&category=Electronics`. The backend builds a MongoDB filter from those values (search ignores capital letters), so only matching products are sent back. The frontend waits 400 ms after typing stops before sending the request.

**Wishlist:** saving runs one MongoDB update that only adds the product if it isn't already there (`$ne` + `$push`). This prevents duplicates even if the button is clicked twice, and a repeat returns `409`. Reading the wishlist uses `populate()` to turn the stored IDs into full product details.

**Cart:** adding a product first tries to insert a new row (only if the product isn't in the cart yet). If the product is already there, it adds 1 to that row (`$inc`), but only while the quantity is below the stock. Both checks run inside a single MongoDB update, so parallel clicks can neither create duplicate rows nor go past the stock. On the frontend, `CartContext` holds the one shared copy of the cart. The navbar count, product cards and cart page all read from it, and after every change it is replaced with the cart returned by the API, so they always agree.

**Checkout & payment:**

```text
Checkout form (validated in the browser)
  → POST /orders/create-payment-order
      server: load cart → reload latest products → check stock → total = Σ price × qty
              → save Order (PENDING_PAYMENT) → create Razorpay order (amount in paise, ₹1 = 100)
  → Razorpay Checkout opens in the browser → customer pays
  → Razorpay returns payment_id + order_id + signature
  → POST /orders/verify-payment
      server: HMAC-SHA256(razorpayOrderId + "|" + paymentId, KEY_SECRET) must equal the signature
              → Order PAID / PLACED → stock reduced → cart emptied
  → frontend empties CartContext (navbar shows Cart 0) → Order success page
```

- The **signature check** is what proves the payment is real. A browser can't fake it, because only the server knows the Key Secret. The server uses the Razorpay order ID saved in **its own database**, not the one the browser sends.
- The cart is emptied **only after** verification. A failed, cancelled or fake payment leaves the cart untouched.
- Verifying is safe to repeat: an order can only change from unpaid to `PAID` once, so stock is never reduced twice.
- Orders are always looked up by **order ID + logged-in user**, so nobody can open someone else's order by guessing its ID (they get `404`).

---

## Testing with Postman

1. `POST /customers/login` with your email and password. Postman stores the cookie and sends it to 🔒 routes automatically.
2. Use **Body → raw → JSON** for requests with a body.
3. You can also send the token as a header: `Authorization: Bearer <token>`.
4. **Payments:** `create-payment-order` can be tested in Postman. A real `razorpay_signature` only comes from Razorpay Checkout, so complete the payment in the app. A made-up signature should return `400 Invalid payment signature`.
5. **Order status:** `PATCH /orders/<id>/status` with header `x-admin-key: <ADMIN_KEY>` and body `{ "status": "CONFIRMED" }` (then `SHIPPED`, then `DELIVERED`).

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "localhost refused to connect" | Start both the backend and the frontend |
| `MongoDB connection failed … IP that isn't whitelisted` | Atlas → Network Access → add your IP |
| Every category shows "No products found" | Run `npm run seed`, or add products with `POST /products` |
| A product is missing from its category | Spell the category exactly: `Electronics`, `Fashion`, `Books`, `Home` |
| A new endpoint returns `Cannot GET …` | Restart the backend |
| Cart shows "Only X left. Please reduce the quantity." | Stock went down after the item was added. Press − or Remove |
| Checkout says "Payments are not configured on the server" | Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env` and restart |
| "Could not load the payment window" | Check your internet connection; Razorpay's script loads from `checkout.razorpay.com` |
| Payment shows "Invalid payment signature" | The Key Secret in `.env` doesn't match the Key ID (regenerate both together in Test Mode) |
