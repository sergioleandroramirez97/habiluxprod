const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const propertyRoutes = require('./routes/propertyRoutes');
const configRoutes = require('./routes/configRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const portalConfigRoutes = require('./routes/portalConfigRoutes');
const documentationRoutes = require('./routes/documentationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/config', configRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/portal-config', portalConfigRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
