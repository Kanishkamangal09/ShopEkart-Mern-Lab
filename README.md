# 🛍️ ShopKart

An online shopping app where people can sign up, browse products, search and filter the catalogue, and save favourites to a wishlist.

Built with **MongoDB, Express, React and Node.js**.

---

## Features

- **Accounts:** sign up, log in, stay logged in, change password, log out
- **Catalogue:** products come from the database, with search by name, category filter and price sorting
- **Product page:** large image, description, price and stock
- **Wishlist:** save products with ♡, view them later, remove them; the saved count shows in the navbar
- **Cart:** add items and change quantities (stored in the browser for now)
- Works on desktop and mobile

---

## Getting Started

**Requirements:** Node.js 18+ and a MongoDB Atlas cluster (the free tier works).

**1. Create `backend/.env`**

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopkart
JWT_SECRET=any_long_random_text
```

In Atlas, go to **Network Access** and add your IP address, or the backend won't be able to connect.

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

> The backend doesn't reload by itself. Restart it (Ctrl+C → `npm start`) after changing backend code.

---

## Project Structure

```text
backend/
├── index.js            server setup, MongoDB connection, routes
├── models/             Customer, Product
├── controllers/        logic for each API
├── routes/             URL → controller
├── middlewares/        auth (checks the login token)
└── utils/              token creation, id check, sample data

frontend/src/
├── App.jsx             all page routes
├── services/api.js     every API call
├── pages/              Home, Products, ProductDetails, Wishlist, Cart, Profile, Login, Register
├── components/         Navbar, ProductCard, WishlistButton, SearchBar, ...
└── context/            logged-in user and cart
```

---

## Data Model

**Customer:** `fullName`, `email` (unique), `password` (bcrypt hash), `phone`, `wishlist`, `createdAt`

**Product:** `name`, `description`, `price` (> 0), `category`, `image`, `stock` (≥ 0), `createdAt`

The wishlist is a list of **product IDs** (`ref: 'Product'`), not copies of products. So when a product's price or stock changes, the wishlist shows the new value automatically.

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

**Status codes:** `200` OK · `201` created · `400` bad input or invalid ID · `401` not logged in · `404` not found · `409` already exists (email or wishlist item) · `500` server error

Example product body:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
  "stock": 10
}
```

---

## How It Works

**Login:** the password is checked with bcrypt. The server then creates a JWT holding the user's ID and sends it in an **HttpOnly cookie**, so JavaScript can't read it. The browser sends the cookie with every request. The auth middleware verifies the token and sets `req.user`. The server always gets the user from this token, never from the request body.

**Search & filter:** the frontend sends `GET /products?search=phone&category=Electronics`. The backend builds a MongoDB filter from those values (search ignores capital letters), so only matching products are sent back. The frontend waits 400 ms after typing stops before sending the request.

**Wishlist:** saving runs one MongoDB update that only adds the product if it isn't already there (`$ne` + `$push`). This prevents duplicates even if the button is clicked twice, and a repeat returns `409`. Reading the wishlist uses `populate()` to turn the stored IDs into full product details.

---

## Testing with Postman

1. `POST /customers/login` with your email and password. Postman stores the cookie and sends it to 🔒 routes automatically.
2. Use **Body → raw → JSON** for requests with a body.
3. You can also send the token as a header: `Authorization: Bearer <token>`.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "localhost refused to connect" | Start both the backend and the frontend |
| `MongoDB connection failed … IP that isn't whitelisted` | Atlas → Network Access → add your IP |
| Every category shows "No products found" | Run `npm run seed`, or add products with `POST /products` |
| A product is missing from its category | Spell the category exactly: `Electronics`, `Fashion`, `Books`, `Home` |
| A new endpoint returns `Cannot GET …` | Restart the backend |
