# ShopKart Customer Authentication Service

This is a simple MERN Engineering Lab 01 backend for registering customers, logging in with bcrypt and JWT, viewing a profile, logging out, and changing a password.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv

## Folder structure

```text
backend/
├── controllers/customer.controller.js
├── models/customer.model.js
├── routes/customer.routes.js
├── middlewares/auth.middleware.js
├── utils/generateToken.js
├── index.js
├── package.json
├── .env
└── README.md
```

## Installation

From the `backend` folder:

```bash
npm install
```

Make sure MongoDB is running locally, or replace `MONGO_URI` with a MongoDB connection string.

## Environment variables

The `.env` file contains:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=change_this_to_a_secret_key
```

Use your own secret for `JWT_SECRET`. Do not commit real secrets to a public repository.

## Start the server

```bash
npm start
```

The server runs at `http://localhost:5000`.

## API list

| Method | URL | Protected |
| --- | --- | --- |
| POST | `/customers/register` | No |
| POST | `/customers/login` | No |
| GET | `/customers/me` | Yes |
| POST | `/customers/logout` | Yes |
| PATCH | `/customers/change-password` | Yes |

### Register

`POST /customers/register`

```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

Returns `201` on success, `400` for missing or short password data, and `409` for an existing email.

### Login

`POST /customers/login`

```json
{
  "email": "john@gmail.com",
  "password": "john123"
}
```

Returns `200` and sets an HttpOnly `token` cookie. Invalid credentials return `401`.

### My profile

`GET /customers/me`

The login cookie is required. Returns the customer's `_id`, `fullName`, `email`, and `phone`, never the password.

### Logout

`POST /customers/logout`

The login cookie is required. The `token` cookie is cleared and `200` is returned.

### Change password

`PATCH /customers/change-password`

```json
{
  "oldPassword": "john123",
  "newPassword": "newpassword123"
}
```

Returns `200` on success, `400` for missing or short data, and `401` for a wrong old password.

## Status codes

- `200`: successful login, profile, logout, or password change
- `201`: customer created
- `400`: missing fields or password too short
- `401`: invalid credentials, missing/invalid cookie, or wrong old password
- `409`: duplicate email
- `500`: unexpected server or database error

## How authentication works

During login, bcrypt compares the entered password with the stored hash. A JWT containing the customer ID is then signed with `JWT_SECRET` and placed in an HttpOnly cookie. The authentication middleware reads `req.cookies.token`, verifies the JWT, finds the customer, and attaches the customer to `req.user` before allowing a protected route to continue.

## Postman testing order

1. Register a new customer and expect `201`.
2. Register the same email again and expect `409`.
3. Register with a missing field and expect `400`.
4. Register with a password shorter than six characters and expect `400`.
5. Check MongoDB and confirm the password is a bcrypt hash, not plain text.
6. Login with correct credentials and confirm Postman stores the HttpOnly `token` cookie.
7. Login with incorrect credentials and expect `401`.
8. Call `GET /customers/me` without a cookie and expect `401`.
9. Call `GET /customers/me` after login and check the customer details.
10. Call logout and confirm the cookie is cleared.
11. Call `/customers/me` after logout and expect `401`.
12. Change the password using a wrong old password and expect `401`.
13. Change the password using the correct old password and expect `200`.
14. Login with the new password and expect success.

Keep Postman's cookie jar enabled so the cookie is sent automatically to protected routes.

## Simple viva preparation

### 1. Why bcrypt instead of encrypting passwords?

**Simple explanation:** Hashing is one-way. We only need to compare a login password with a stored hash, so we do not need to decrypt it. bcrypt also adds a salt and is deliberately slow to make guessing harder.

**Short viva answer:** We use bcrypt because passwords should be stored as one-way hashes, not as values that can be decrypted. bcrypt also uses salting and is slow against brute-force attempts.

### 2. What is stored in a JWT payload?

**Simple explanation:** A payload contains claims such as the customer ID and token expiry. It is signed, not encrypted, so private information should not be placed in it.

**Short viva answer:** This implementation stores the customer ID in the JWT payload, and jsonwebtoken also handles expiry. The payload should not contain passwords or secrets.

### 3. Why is HttpOnly important?

**Simple explanation:** JavaScript in the browser cannot read an HttpOnly cookie. This reduces the risk of a script stealing the token through `document.cookie`.

**Short viva answer:** HttpOnly prevents client-side JavaScript from reading the authentication cookie, which helps protect the JWT from some XSS attacks.

### 4. Why should passwords never be returned?

**Simple explanation:** Even a hash is sensitive and is not needed by the frontend. Returning it increases the damage if a response or log is exposed.

**Short viva answer:** The frontend only needs customer information, never the password or its hash, so the controller excludes it from every response.

### 5. What is authentication middleware for?

**Simple explanation:** Middleware runs before a protected controller. It checks the cookie and token, finds the customer, and stops unauthenticated requests.

**Short viva answer:** Authentication middleware verifies the JWT, loads the customer, stores it in `req.user`, and calls `next()` only when authentication succeeds.

### Additional likely viva questions

**Question:** What does `bcrypt.hash()` do?

**Simple explanation:** It converts the plain password into a salted hash before saving.

**Short viva answer:** `bcrypt.hash()` creates the password hash that is stored in MongoDB instead of the plain password.

**Question:** What does `bcrypt.compare()` do?

**Simple explanation:** It checks an entered password against an existing bcrypt hash.

**Short viva answer:** `bcrypt.compare()` returns whether the login or old password matches the stored hash.

**Question:** What is a JWT?

**Simple explanation:** It is a signed token that lets the server recognize a logged-in user on later requests.

**Short viva answer:** A JWT is a signed token used to carry the customer's ID between requests after login.

**Question:** What is the JWT secret?

**Simple explanation:** It is a private value used to sign and verify tokens.

**Short viva answer:** The JWT secret proves that the token was created by our server, and it is loaded from `.env`.

**Question:** What does `jwt.sign()` do?

**Simple explanation:** It creates a signed JWT from a payload and secret.

**Short viva answer:** `jwt.sign()` creates the login token with the customer ID and one-day expiration.

**Question:** What does `jwt.verify()` do?

**Simple explanation:** It checks the signature and expiry and returns the payload if the token is valid.

**Short viva answer:** `jwt.verify()` confirms that the cookie token is genuine and has not expired.

**Question:** What is `req.cookies`?

**Simple explanation:** cookie-parser puts cookies sent by the client into this object.

**Short viva answer:** The middleware reads `req.cookies.token` to get the JWT from the request.

**Question:** What is `req.user`?

**Simple explanation:** It is a property added by our middleware for the next controller to use.

**Short viva answer:** `req.user` contains the authenticated Mongoose customer document for protected routes.

**Question:** What is Mongoose used for?

**Simple explanation:** Mongoose lets JavaScript work with MongoDB using schemas and model methods.

**Short viva answer:** Mongoose defines the Customer schema and provides methods such as `findOne`, `findById`, `create`, and `save`.

**Question:** What does `unique: true` mean for email?

**Simple explanation:** It creates a uniqueness rule so two customers cannot use the same email.

**Short viva answer:** It prevents duplicate customer emails; the controller returns `409` when the email already exists.

**Question:** Why do we use status codes 400, 401, 409, and 500?

**Simple explanation:** They describe different failures: bad input, unauthenticated access, conflict, and unexpected server failure.

**Short viva answer:** `400` is invalid input, `401` is failed authentication, `409` is a duplicate email conflict, and `500` is an unexpected server error.

**Question:** Why use `.env`?

**Simple explanation:** It keeps configuration such as database URLs and secrets outside the source code.

**Short viva answer:** `.env` stores environment-specific values like `MONGO_URI`, `PORT`, and `JWT_SECRET` without hardcoding them in JavaScript.

## Common student mistakes

- Forgetting to call `express.json()` before reading `req.body`.
- Forgetting `cookie-parser`, so `req.cookies` is undefined.
- Using a plain password in the database instead of the bcrypt hash.
- Returning the whole customer document, which could expose the password hash.
- Using different cookie names during login and logout.
- Forgetting to keep Postman's cookie jar enabled.
- Forgetting `authMiddleware` on `/me`, logout, or change-password.
- Using a different JWT secret during signing and verification.
- Testing protected routes before logging in.
- Forgetting to start MongoDB or configure `MONGO_URI`.

## Two-minute project explanation

This project is a customer authentication backend built with Node.js, Express, MongoDB, and Mongoose. The Customer model stores the name, email, phone, bcrypt password hash, and automatically generated `createdAt` value.

The register controller validates the fields, checks for a duplicate email, hashes the password with bcrypt, and saves the customer. The login controller finds the customer, compares the entered password with bcrypt, creates a JWT containing the customer ID, and stores it in an HttpOnly cookie.

Protected routes use authentication middleware. The middleware reads the token from `req.cookies`, verifies it with the JWT secret, finds the customer in MongoDB, and attaches the customer to `req.user`. The profile controller returns safe customer details, logout clears the cookie, and change-password verifies the old password before hashing and saving the new one. Passwords and password hashes are never returned in API responses.

---

# Lab 03 – Product Catalog & Discovery

## New files

```text
backend/
├── models/product.model.js           Product schema (name, description, price, category, image, stock, createdAt)
├── controllers/product.controller.js createProduct, getProducts, getProductById
├── routes/product.routes.js          /products routes
└── utils/seedProducts.js             inserts 10 sample products (npm run seed)
```

## Add sample products

```bash
npm run seed
```

The script only inserts products if the collection is empty, so running it twice does not create duplicates.

## Product APIs

| Method | URL | Purpose |
| --- | --- | --- |
| POST | `/products` | Create a product |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get one product |

Query parameters for `GET /products` (all optional, can be combined):

| Query | Example | What it does |
| --- | --- | --- |
| `search` | `?search=keyboard` | name contains the text (case-insensitive) |
| `category` | `?category=Electronics` | only that category |
| `sort` | `?sort=price_asc` / `?sort=price_desc` | sort by price (bonus) |

### Status codes

- `POST /products`: `201` created, `400` missing field / price ≤ 0 / negative stock
- `GET /products/:id`: `200` found, `400` invalid id, `404` not found
- `500`: unexpected server error

## Postman testing order

1. `POST /products` with a full body and expect `201`.
2. `POST /products` without `name` and expect `400`.
3. `POST /products` with `"price": 0` and expect `400`.
4. `POST /products` with `"stock": -1` and expect `400`.
5. `GET /products` and check `count` and the `products` array.
6. `GET /products?search=KEY` and check the search is case-insensitive.
7. `GET /products?category=Books`.
8. `GET /products?search=s&category=Fashion` (both filters together).
9. `GET /products?sort=price_asc` and `?sort=price_desc`.
10. `GET /products/<copy an _id>` and expect `200`.
11. `GET /products/abc` and expect `400`.
12. `GET /products/66d123abc456def789012345` (valid format, not in DB) and expect `404`.

---

# Lab 04 – Wishlist

## New / changed files

```text
backend/
├── models/customer.model.js           + wishlist: [ObjectId] with ref: 'Product', default []
├── controllers/wishlist.controller.js getWishlist, addToWishlist, removeFromWishlist, toggleWishlist
├── routes/wishlist.routes.js          /wishlist routes (all protected with authMiddleware)
├── middlewares/auth.middleware.js     now also accepts "Authorization: Bearer <token>"
└── utils/isValidId.js                 checks a MongoDB id is 24 hex characters
```

## Wishlist APIs (all need login)

| Method | URL | Purpose | Status codes |
| --- | --- | --- | --- |
| GET | `/wishlist` | Current user's wishlist (populated) | 200, 401 |
| POST | `/wishlist/:productId` | Add product | 201, 400, 401, 404, 409 |
| DELETE | `/wishlist/:productId` | Remove product | 200, 400, 401, 404 |
| PATCH | `/wishlist/:productId/toggle` | Bonus: add if missing, remove if saved | 200, 400, 401, 404 |

There is no `/wishlist/:userId` route. The user always comes from the JWT (`req.user`).

## Postman test plan

Log in first with `POST /customers/login`. Postman saves the `token` cookie and sends it automatically.
(Or copy the token value and add the header `Authorization: Bearer <token>`.)

1. `POST /wishlist/<productId>` and expect `201`.
2. Same request again and expect `409` (already in wishlist).
3. `GET /wishlist` and expect only your products, with full product details (populate).
4. `DELETE /wishlist/<productId>` and expect `200`.
5. Same delete again and expect `404` (not in wishlist).
6. `POST /wishlist/abc` and expect `400` (invalid id).
7. `POST /wishlist/66d123abc456def789012345` and expect `404` (product not found).
8. Delete the cookie (Cookies → token → delete) and call `GET /wishlist`; expect `401`.
9. Bonus: `PATCH /wishlist/<productId>/toggle` twice, expecting `saved: true` and then `saved: false`.
