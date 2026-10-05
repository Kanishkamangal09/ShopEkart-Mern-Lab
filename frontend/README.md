# ShopKart – Frontend

React + Vite frontend for the ShopKart MERN mini project. It talks to the Express backend in `../backend`.

## Features

- Register / login with validation, show-password toggle and friendly error messages
- Protected routes (auth state comes from `GET /customers/me`, JWT stays in an HttpOnly cookie)
- Home page with hero, category cards, category chips and working product search
- Cart with quantity controls, savings, free-delivery threshold and demo checkout (saved in `localStorage`)
- Profile page with account details and change password (`PATCH /customers/change-password`)
- Responsive layout (desktop, tablet, mobile) and a 404 page

## Run locally

```bash
# terminal 1 – backend (http://localhost:5001)
cd backend && npm install && npm start

# terminal 2 – frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

Set `VITE_API_URL` if the backend runs somewhere other than `http://localhost:5001`.

## Folder structure

```text
src/
├── components/   Navbar, Footer, ProductCard, AuthLayout, RouteGuards, Icon, ...
├── context/      AuthContext (logged-in user) and CartContext (cart state)
├── data/         product + category data and price formatter
├── pages/        Login, Register, Home, Cart, Profile, NotFound
├── services/     api.js – fetch wrapper that sends cookies
└── index.css     all styles (CSS variables at the top)
```
