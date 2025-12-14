require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./models');
const router = require('./routers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Start server
const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Sync models (use {alter: true} in development)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('✅ Models synchronized');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (e) {
        console.error('❌ Server start error:', e);
        process.exit(1);
    }
};

start();
