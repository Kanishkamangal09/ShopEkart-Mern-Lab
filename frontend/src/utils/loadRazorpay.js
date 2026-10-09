// Adds Razorpay's checkout script to the page (only once).
// Resolves true when window.Razorpay is ready, false if the script could not load.
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove(); // so the next try adds a fresh script
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
