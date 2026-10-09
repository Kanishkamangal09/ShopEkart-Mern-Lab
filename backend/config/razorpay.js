const Razorpay = require('razorpay');

// The Razorpay client is only created when both test keys are in .env.
// Without keys the rest of the app still works; checkout just returns an error.
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

module.exports = razorpay;
