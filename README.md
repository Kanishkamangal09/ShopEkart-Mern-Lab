# 🛍️ ShopKart

ShopKart is a small online shopping website built with the **MERN stack** (MongoDB, Express, React, Node.js) as part of my Fullstack Engineering Labs.

Each lab adds one new feature to the same project. This README explains the whole project up to the latest lab: how to run it, how it is organised, every API, and how each feature works.

---

## 📑 Table of Contents

1. [Features (lab by lab)](#-features-lab-by-lab)
2. [Tech Stack](#-tech-stack)
3. [How to Run the Project](#-how-to-run-the-project)
4. [Folder Structure](#-folder-structure)
5. [Database Models](#-database-models)
6. [API Reference](#-api-reference)
7. [Frontend Pages](#-frontend-pages)
8. [How Things Work](#-how-things-work)
9. [Testing with Postman](#-testing-with-postman)
10. [Troubleshooting](#-troubleshooting)
11. [Lab Progress](#-lab-progress)

---

## ✨ Features (lab by lab)

| Lab | Feature | What the user can do |
| --- | --- | --- |
| 01 – 02 | **Authentication** | Register, log in, stay logged in, view profile, change password, log out |
| 03 | **Product Catalog** | Browse products from the database, search by name, filter by category, sort by price, open a product details page |
| 04 | **Wishlist** | Save products with ♡, see all saved products on a Wishlist page, remove them, see the saved count in the navbar |

Also included (frontend only, not a lab requirement yet): a **cart** with quantity controls that is saved in the browser (`localStorage`).

---

## 🧰 Tech Stack

| Part | Technology | Used for |
| --- | --- | --- |
| Frontend | React 19 + Vite | User interface |
| Routing | React Router | Moving between pages without reloading |
| Backend | Node.js + Express | REST APIs |
| Database | MongoDB Atlas + Mongoose | Storing customers and products |
| Passwords | bcrypt | Hashing passwords before saving |
| Login | JSON Web Token (JWT) in an HttpOnly cookie | Remembering who is logged in |

---

## 🚀 How to Run the Project

### 1. Requirements

- **Node.js** v18 or newer (I used v22) → check with `node -v`
- A **MongoDB Atlas** cluster (free tier is fine)
- **Postman** (for testing APIs)

### 2. Set up MongoDB Atlas (one time)

1. Log in at https://cloud.mongodb.com.
2. **Database Access** → create a database user (username + password).
3. **Network Access** → **Add IP Address** → *Add Current IP* (or *Allow Access from Anywhere* `0.0.0.0/0` for lab use).
4. **Database → Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopkart?retryWrites=true&w=majority`

### 3. Create `backend/.env`

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=any_long_random_secret_text
```

> `.env` is in `.gitignore`, so your password is never pushed to GitHub.

### 4. Install and start the backend (Terminal 1)

```bash
cd backend
npm install
npm start
```

You should see:

```text
MongoDB connected
Server running on port 5001
```

### 5. Add sample products (one time)

In a **new terminal** (keep the backend running):

```bash
cd backend
npm run seed
```

This adds 10 products (Electronics, Fashion, Books, Home). It only runs if the products collection is empty, so running it twice does not create duplicates.

### 6. Install and start the frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Use exactly `localhost`, not `127.0.0.1`, because the backend only accepts requests from `http://localhost:5173`.

### 7. Useful commands

| Where | Command | What it does |
| --- | --- | --- |
| backend | `npm start` | Start the API server |
| backend | `npm run seed` | Insert sample products |
| frontend | `npm run dev` | Start React in development mode |
| frontend | `npm run build` | Create a production build in `dist/` |
| frontend | `npm run lint` | Check code for problems |

> ⚠️ After changing any backend file, stop the server (Ctrl+C) and run `npm start` again. The backend does not reload by itself. The frontend does.

---

## 📁 Folder Structure

```text
ShopEkart/
├── README.md                       ← you are here
│
├── backend/                        (Express + MongoDB, MVC structure)
│   ├── index.js                    starts the server, connects MongoDB, registers routes
│   ├── .env                        PORT, MONGO_URI, JWT_SECRET (not committed)
│   ├── models/
│   │   ├── customer.model.js       Customer schema (+ wishlist of Product ids)
│   │   └── product.model.js        Product schema
│   ├── controllers/                the logic for each API
│   │   ├── customer.controller.js  register, login, profile, logout, change password
│   │   ├── product.controller.js   create, list (search/filter/sort), get one
│   │   └── wishlist.controller.js  get, add, remove, toggle
│   ├── routes/                     connects URLs to controller functions
│   │   ├── customer.routes.js      /customers/...
│   │   ├── product.routes.js       /products/...
│   │   └── wishlist.routes.js      /wishlist/...
│   ├── middlewares/
│   │   └── auth.middleware.js      checks the JWT and sets req.user
│   └── utils/
│       ├── generateToken.js        creates the JWT
│       ├── isValidId.js            checks a MongoDB id is valid (24 hex characters)
│       └── seedProducts.js         inserts sample products
│
└── frontend/                       (React + Vite)
    ├── index.html
    └── src/
        ├── main.jsx                React entry point
        ├── App.jsx                 all routes
        ├── index.css               all styles
        ├── services/api.js         every API call lives here
        ├── context/                logged-in user (AuthContext) and cart (CartContext)
        ├── data/categories.js      category list + price formatter
        ├── components/             reusable pieces (Navbar, ProductCard, WishlistButton, ...)
        └── pages/                  one file per page (Login, Products, Wishlist, ...)
```

**MVC** = **M**odel (data shape), **V**iew (React frontend), **C**ontroller (logic). Routes only point to controllers, and controllers use models.

---

## 🗃️ Database Models

### Customer

| Field | Type | Rules |
| --- | --- | --- |
| fullName | String | required |
| email | String | required, unique |
| password | String | required, stored as a **bcrypt hash** |
| phone | String | required |
| wishlist | [ObjectId] → `ref: 'Product'` | default `[]` |
| createdAt | Date | automatic |

### Product

| Field | Type | Rules |
| --- | --- | --- |
| name | String | required |
| description | String | required |
| price | Number | required, must be **> 0** |
| category | String | required (`Electronics`, `Fashion`, `Books`, `Home`) |
| image | String | required (image URL) |
| stock | Number | required, **≥ 0** |
| createdAt | Date | automatic |

### Relationship

```text
Customer ──owns──▶ wishlist: [ ObjectId, ObjectId ] ──references──▶ Product
```

The wishlist stores **only product ids**, not copies of products. The Product collection stays the single source of truth, so if a price or stock changes, the wishlist automatically shows the new value.

---

## 🔌 API Reference

Base URL: `http://localhost:5001`
🔒 = needs login (JWT cookie, or `Authorization: Bearer <token>` header)

### Customers (Lab 01–02)

| Method | Endpoint | 🔒 | Body | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| POST | `/customers/register` | | fullName, email, password, phone | 201 | 400 missing/short password, 409 email exists |
| POST | `/customers/login` | | email, password | 200 + sets `token` cookie | 401 wrong email/password |
| GET | `/customers/me` | 🔒 | | 200 profile (no password) | 401 |
| POST | `/customers/logout` | 🔒 | | 200, cookie cleared | 401 |
| PATCH | `/customers/change-password` | 🔒 | oldPassword, newPassword | 200 | 400, 401 wrong old password |

### Products (Lab 03)

| Method | Endpoint | 🔒 | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/products` | | 201 + created product | 400 missing field / price ≤ 0 / negative stock |
| GET | `/products` | | 200 `{ success, count, products }` | 500 |
| GET | `/products/:id` | | 200 `{ success, product }` | 400 invalid id, 404 not found |

Query options for `GET /products` (all optional, can be combined):

| Query | Example | Meaning |
| --- | --- | --- |
| `search` | `/products?search=watch` | name contains "watch" (ignores capital letters) |
| `category` | `/products?category=Books` | exact category (case-sensitive) |
| `sort` | `/products?sort=price_asc` or `price_desc` | sort by price (default: newest first) |

Example: `/products?search=phone&category=Electronics&sort=price_asc`

Example body for `POST /products`:

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

### Wishlist (Lab 04), all 🔒

| Method | Endpoint | Success | Errors |
| --- | --- | --- | --- |
| GET | `/wishlist` | 200 `{ success, count, wishlist: [products] }` | 401 |
| POST | `/wishlist/:productId` | 201 "Product added to wishlist" | 400 invalid id, 401, 404 product not found, **409 already in wishlist** |
| DELETE | `/wishlist/:productId` | 200 "Product removed from wishlist" | 400, 401, 404 not in wishlist |
| PATCH | `/wishlist/:productId/toggle` (bonus) | 200 `{ saved: true/false }` | 400, 401, 404 |

There is **no** `/wishlist/:userId` route on purpose. The server always takes the user from the JWT, so nobody can open another person's wishlist.

### Status codes used

| Code | Meaning in this project |
| --- | --- |
| 200 | OK |
| 201 | Created (register, new product, added to wishlist) |
| 400 | Bad input (missing field, invalid id, wrong price/stock) |
| 401 | Not logged in, or token invalid/expired |
| 404 | Not found (product, or product not in wishlist) |
| 409 | Conflict (email already registered, product already in wishlist) |
| 500 | Unexpected server error |

---

## 🖥️ Frontend Pages

| URL | Page | Login needed | What it shows |
| --- | --- | --- | --- |
| `/login` | Login | | Email + password form |
| `/register` | Register | | Sign-up form with validation |
| `/home` | Home | ✅ | Welcome banner and category cards (link to Products) |
| `/products` | Products | ✅ | All products from the API, with search bar, category dropdown and sort dropdown |
| `/products/:id` | Product Details | ✅ | Large image, description, price, stock, Add to Cart |
| `/wishlist` | Wishlist | ✅ | Saved products with View Details and Remove |
| `/cart` | Cart | ✅ | Cart items, quantity, total (browser only) |
| `/profile` | Profile | ✅ | Account details and change password |
| anything else | 404 | | "Page not found" |

Logged-out users who open a protected page are sent to `/login`. Logged-in users who open `/login` are sent to `/home`.

Every page that loads data shows **3 states**:

- **Loading:** "Loading products..." / "Loading your wishlist..."
- **Error:** "Something went wrong..." (the Wishlist page has a **Try Again** button)
- **Empty:** "No products found." / "Your wishlist is empty" with a **Browse Products** button

---

## ⚙️ How Things Work

### 🔐 Login (JWT + cookie)

```text
User logs in
   ↓
Backend checks the password with bcrypt.compare()
   ↓
Backend creates a JWT { id: customerId } signed with JWT_SECRET (valid 1 day)
   ↓
JWT is sent as an HttpOnly cookie called "token"
   ↓
Browser sends the cookie automatically with every request
   ↓
auth.middleware.js verifies the JWT → finds the customer → puts it in req.user
```

- **bcrypt** hashes passwords one way, so even the database never holds the real password.
- **HttpOnly** means JavaScript cannot read the cookie, which protects it from XSS attacks.
- On the frontend, `AuthContext` calls `GET /customers/me` once when the app opens to find out who is logged in.

### 🔎 Product search and filter

```text
User types "phone" / picks "Electronics"
   ↓
React state changes (search, category, sort)
   ↓
useEffect waits 400 ms (so we don't call the API on every key press)
   ↓
GET /products?search=phone&category=Electronics
   ↓
Backend builds a filter object step by step:
   filter.name = { $regex: "phone", $options: "i" }   ← "i" = ignore capital letters
   filter.category = "Electronics"
   ↓
Product.find(filter).select(only needed fields).sort(...)
   ↓
React shows the result with products.map(...)
```

Filtering is done in the **backend** (MongoDB), not in React, so the browser never has to download thousands of products.

### ❤️ Wishlist

**Adding**: `POST /wishlist/:productId`

1. Check the id format → 400 if wrong.
2. Check the product exists (`Product.exists`) → 404 if not.
3. One atomic MongoDB update:

   ```js
   Customer.findOneAndUpdate(
     { _id: req.user._id, wishlist: { $ne: productId } }, // only if NOT already saved
     { $push: { wishlist: productId } }
   )
   ```

   If it returns `null`, the product was already saved → **409**.
   Because the check and the update happen in one step, even double clicks can't create duplicates.

**Reading**: `GET /wishlist`

`req.user.populate({ path: 'wishlist', select: 'name price category image stock' })` replaces each stored id with the real product data. If a product was deleted from the store, its leftover id is removed automatically.

**Frontend**

- `WishlistButton` shows **♡ Add to Wishlist → ⏳ Saving... → ♥ Remove from Wishlist**. It is disabled while saving (no duplicate requests) and shows "Unable to save product. Please try again." if the request fails.
- The navbar count (Wishlist **3**) always comes from the backend: every wishlist API response includes `count`.
- No Redux or Context is used for the wishlist. It is stored in MongoDB, so it stays after a refresh or a new login.

---

## 🧪 Testing with Postman

1. **Log in first:** `POST http://localhost:5001/customers/login` with JSON body `{ "email": "...", "password": "..." }`. Postman saves the `token` cookie and sends it automatically to protected routes. Keep the cookie jar on.
2. **Products**
   - `POST /products` with the example body → **201**
   - same body without `name` → **400**, with `"price": 0` → **400**, with `"stock": -1` → **400**
   - `GET /products?search=watch`, `?category=Books`, `?sort=price_desc`
   - `GET /products/<copy an _id>` → **200**, `/products/abc` → **400**, `/products/66d123abc456def789012345` → **404**
3. **Wishlist**
   - `POST /wishlist/<productId>` → **201**, same again → **409**
   - `GET /wishlist` → your products with full details
   - `DELETE /wishlist/<productId>` → **200**, same again → **404**
   - delete the cookie in Postman and call `GET /wishlist` → **401**

For JSON bodies: **Body → raw → JSON**.

---

## 🛠️ Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| Browser says **"localhost refused to connect"** | Frontend or backend is not running | Start both (`npm start` in backend, `npm run dev` in frontend) |
| Backend prints `MongoDB connection failed: ... IP that isn't whitelisted` | Atlas is blocking your network | Atlas → **Network Access** → add your IP (or `0.0.0.0/0`) |
| Backend can't connect even after adding IP | Free cluster is **paused**, or wrong password | Atlas → Database → **Resume**; check username/password in `MONGO_URI` |
| Every category says **"No products found"** | Products collection is empty | Run `npm run seed` or add products with Postman |
| A product doesn't appear under its category | Category spelling/case doesn't match | Use exactly `Electronics`, `Fashion`, `Books` or `Home` |
| Login works in Postman but not in the browser | Opened `127.0.0.1:5173`, or Vite moved to port 5174 | Use `http://localhost:5173` and close other Vite servers |
| New API returns `Cannot GET /...` | Backend still running old code | Stop it (Ctrl+C) and `npm start` again |

---

## 📈 Lab Progress

### ✅ Lab 01 – 02: Authentication
- Customer model, bcrypt hashing, JWT in an HttpOnly cookie
- Register, Login, Profile (`/me`), Logout, Change password
- React Login / Register pages with validation, protected routes, profile page

### ✅ Lab 03: Product Catalog & Discovery
- Product model with validation (price > 0, stock ≥ 0)
- `POST /products`, `GET /products`, `GET /products/:id`
- Backend search (case-insensitive), category filter, **bonus:** price sorting
- React Products page, SearchBar, ProductCard, Product Details page (`/products/:id`)
- Loading, error and empty states; seed script with 10 sample products

### ✅ Lab 04: Wishlist
- `wishlist` field on Customer: array of Product ObjectIds with `ref: 'Product'`
- Protected `GET`, `POST`, `DELETE /wishlist` APIs, user taken from the JWT
- Duplicate prevention with an atomic `$ne` + `$push` update (409 on duplicate)
- `populate()` to return full product details
- Wishlist button on product cards, Wishlist page, navbar link
- **Bonus:** toggle (`PATCH /wishlist/:productId/toggle`) and live wishlist count in the navbar

### ⏭️ Next lab
_Will be added here._
