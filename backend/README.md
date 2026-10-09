# ShopKart – Backend

Express + MongoDB API for ShopKart. See the main [README](../README.md) for setup, the full API list and how everything works.

```bash
npm install
npm start        # starts the API on http://localhost:5001
npm run seed     # adds 10 sample products (only if the collection is empty)
```

Environment variables (`.env`, see `.env.example`): `PORT`, `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_KEY` (optional).
