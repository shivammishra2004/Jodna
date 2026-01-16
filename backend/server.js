const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

console.log("Starting Server Initialization...");

// Load config
dotenv.config();

const app = express();

// Connect to Database
if (process.env.MONGO_URI) {
    console.log("Attempting to connect to MongoDB...");
    connectDB();
} else {
    console.warn("WARNING: MONGO_URI not found in .env file. Database connection skipped.");
}

// Middleware
app.use(cors({
    origin: true,
    // credentials: true // Not needed for JWT usually, but good for some headers
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/reviews', require('./routes/reviews'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
