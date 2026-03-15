require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Static for uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for prescription + idCard
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper: haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'HealthEase API' });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get stock for a product across pharmacies
app.get('/api/products/:id/stock', async (req, res) => {
  const productId = Number(req.params.id);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    const stocks = await prisma.stock.findMany({
      where: { productId, quantity: { gt: 0 } },
      include: { pharmacy: true }
    });
    res.json(stocks);
  } catch (err) {
    console.error('Error fetching stock', err);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Get all categories (distinct from products)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      distinct: ['category'],
      select: { category: true }
    });
    res.json(categories.map((c) => c.category));
  } catch (err) {
    console.error('Error fetching categories', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create contact message (Get in Touch form)
app.post('/api/contact', async (req, res) => {
  const { name, email, location, type, message } = req.body;
  if (!name || !email || !type || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const created = await prisma.message.create({
      data: { name, email, location: location || null, type, message }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating message', err);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// Auth: simple email/password login, returns user + role
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Pharmacies basic listing
app.get('/api/pharmacies', async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany();
    res.json(pharmacies);
  } catch (err) {
    console.error('Error fetching pharmacies', err);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
});

// Pharmacy dashboard: stock for a pharmacy
app.get('/api/pharmacies/:id/stock', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid pharmacy id' });
  }
  try {
    const stock = await prisma.stock.findMany({
      where: { pharmacyId: id },
      include: { product: true }
    });
    res.json(stock);
  } catch (err) {
    console.error('Error fetching pharmacy stock', err);
    res.status(500).json({ error: 'Failed to fetch pharmacy stock' });
  }
});

// Pharmacy dashboard: orders for a pharmacy
app.get('/api/pharmacies/:id/orders', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid pharmacy id' });
  }
  try {
    const orders = await prisma.order.findMany({
      where: { pharmacyId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching pharmacy orders', err);
    res.status(500).json({ error: 'Failed to fetch pharmacy orders' });
  }
});

// Admin: list all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { pharmacy: true }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update stock quantity for one product in a pharmacy
app.patch('/api/pharmacies/:id/stock', async (req, res) => {
  const id = Number(req.params.id);
  const { productId, quantity } = req.body;
  if (Number.isNaN(id) || !productId || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  try {
    const existing = await prisma.stock.findFirst({
      where: { pharmacyId: id, productId }
    });
    let stock;
    if (existing) {
      stock = await prisma.stock.update({
        where: { id: existing.id },
        data: { quantity }
      });
    } else {
      stock = await prisma.stock.create({
        data: { pharmacyId: id, productId, quantity }
      });
    }
    res.json(stock);
  } catch (err) {
    console.error('Error updating stock', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Create order with file uploads and distance-based delivery fee
app.post(
  '/api/orders',
  upload.fields([
    { name: 'prescription', maxCount: 1 },
    { name: 'idCard', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        customerName,
        email,
        phone,
        deliveryMethod, // 'Pick up' or 'Delivery'
        location,
        pickupTime,
        bagTotal,
        pharmacyId,
        customerLat,
        customerLng
      } = req.body;

      const bagTotalNumber = Number(bagTotal);

      if (
        !customerName ||
        !email ||
        !phone ||
        !deliveryMethod ||
        Number.isNaN(bagTotalNumber)
      ) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const files = req.files || {};
      const prescriptionFile = files.prescription?.[0];
      const idCardFile = files.idCard?.[0];

      if (!prescriptionFile || !idCardFile) {
        return res
          .status(400)
          .json({ error: 'Prescription and ID card uploads are required' });
      }

      let selectedPharmacy = null;
      let distanceKm = null;
      let deliveryFee = 0;

      if (deliveryMethod === 'Delivery') {
        const lat = Number(customerLat);
        const lng = Number(customerLng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return res
            .status(400)
            .json({ error: 'Customer coordinates are required for delivery' });
        }

        if (pharmacyId) {
          selectedPharmacy = await prisma.pharmacy.findUnique({
            where: { id: Number(pharmacyId) }
          });
        }

        if (!selectedPharmacy) {
          return res
            .status(400)
            .json({ error: 'Valid pharmacyId is required for delivery' });
        }

        distanceKm = haversine(lat, lng, selectedPharmacy.lat, selectedPharmacy.lng);
        if (distanceKm > 15) {
          return res
            .status(400)
            .json({ error: 'Delivery distance exceeds 15km limit' });
        }

        const baseFee = 10 * distanceKm;
        deliveryFee = Math.max(100, Number(baseFee.toFixed(2)));
      }

      const adminFee = 30.0;
      const platformFee = 50.0;
      const totalAmount =
        bagTotalNumber + adminFee + platformFee + deliveryFee;

      const order = await prisma.order.create({
        data: {
          customerName,
          email,
          phone,
          deliveryMethod,
          location: location || null,
          pickupTime: pickupTime || null,
          bagTotal: bagTotalNumber,
          adminFee,
          platformFee,
          deliveryFee,
          totalAmount,
          pharmacyId: selectedPharmacy ? selectedPharmacy.id : null,
          customerLat: customerLat ? Number(customerLat) : null,
          customerLng: customerLng ? Number(customerLng) : null,
          distanceKm,
          prescriptionPath: path.join('uploads', prescriptionFile.filename),
          idCardPath: path.join('uploads', idCardFile.filename)
        }
      });

      res.status(201).json(order);
    } catch (err) {
      console.error('Error creating order', err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`HealthEase API running on http://localhost:${PORT}`);
});

