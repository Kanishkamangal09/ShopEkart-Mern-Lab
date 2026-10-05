const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const categories = [
  { name: 'Electronics', image: img('1518444065439-e933c06ce9cd') },
  { name: 'Fashion', image: img('1521572267360-ee0c2909d518') },
  { name: 'Home & Living', image: img('1505693416388-ac5ce068fe85') },
  { name: 'Beauty', image: img('1522335789203-aabd1fc54bc9') }
];

export const products = [
  {
    id: 'p1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 1999,
    oldPrice: 2499,
    rating: 4.8,
    image: img('1546435770-a3e426bf472b')
  },
  {
    id: 'p2',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 2499,
    oldPrice: 3199,
    rating: 4.7,
    image: img('1523275335684-37898b6baf30')
  },
  {
    id: 'p3',
    name: 'Instant Camera',
    category: 'Electronics',
    price: 4999,
    oldPrice: 5999,
    rating: 4.6,
    image: img('1526170375885-4d8ecf77b99f')
  },
  {
    id: 'p11',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 1499,
    oldPrice: 1999,
    rating: 4.5,
    image: img('1608043152269-423dbba4e7e1')
  },
  {
    id: 'p4',
    name: 'Running Sneakers',
    category: 'Fashion',
    price: 1799,
    oldPrice: 2299,
    rating: 4.6,
    image: img('1542291026-7eec264c27ff')
  },
  {
    id: 'p5',
    name: 'Classic Sunglasses',
    category: 'Fashion',
    price: 899,
    oldPrice: 1299,
    rating: 4.4,
    image: img('1572635196237-14b3f281503f')
  },
  {
    id: 'p6',
    name: 'Everyday Handbag',
    category: 'Fashion',
    price: 1299,
    oldPrice: 1799,
    rating: 4.5,
    image: img('1584917865442-de89df76afd3')
  },
  {
    id: 'p12',
    name: 'Cotton T-Shirt',
    category: 'Fashion',
    price: 499,
    oldPrice: 799,
    rating: 4.3,
    image: img('1521572163474-6864f9cf17ab')
  },
  {
    id: 'p7',
    name: 'Indoor Plant Set',
    category: 'Home & Living',
    price: 749,
    oldPrice: 999,
    rating: 4.7,
    image: img('1485955900006-10f4d324d411')
  },
  {
    id: 'p8',
    name: 'Desk Lamp',
    category: 'Home & Living',
    price: 1149,
    oldPrice: 1499,
    rating: 4.3,
    image: img('1507473885765-e6ed057f782c')
  },
  {
    id: 'p9',
    name: 'Skincare Kit',
    category: 'Beauty',
    price: 1399,
    oldPrice: 1899,
    rating: 4.6,
    image: img('1556228578-8c89e6adf883')
  },
  {
    id: 'p10',
    name: 'Eau de Parfum',
    category: 'Beauty',
    price: 2199,
    oldPrice: 2799,
    rating: 4.8,
    image: img('1541643600914-78b084683601')
  }
];

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
