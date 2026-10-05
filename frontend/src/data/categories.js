// Categories used by the dropdown and the home page cards.
// (Products themselves now come from MongoDB, not from this file.)
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const categories = [
  { name: 'Electronics', image: img('1518444065439-e933c06ce9cd') },
  { name: 'Fashion', image: img('1521572267360-ee0c2909d518') },
  { name: 'Books', image: img('1512820790803-83ca734da794') },
  { name: 'Home', image: img('1505693416388-ac5ce068fe85') }
];

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
