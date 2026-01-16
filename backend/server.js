const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const cors = require('cors');
const connectDB = require('./config/db');

console.log("Starting Server Initialization...");

// Load config
dotenv.config();

// Passport config
require('./config/passport')(passport);

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
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sessions
let sessionStore;

if (process.env.MONGO_URI) {
    try {
        console.log("Debug MongoStore structure:", MongoStore);
        sessionStore = MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        });
        console.log("Using MongoDB Session Store");
    } catch (e) {
        console.error("Failed to create MongoStore, falling back to MemoryStore:", e.message);
    }
} else {
    console.log("Using MemoryStore for Sessions (No Mongo URI)");
}

app.use(
    session({
        name: "jodna.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore, // undefined → MemoryStore automatically
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
