require('dotenv').config();

// Ensure this only runs if needed (usually local dev specific)
if (process.env.NODE_EXTRA_CA_CERTS) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  console.log('Using custom CA certificate...');
}

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./DataBase'); // Ensure this connects to MongoDB Atlas

// Routes
const userRoutes = require('./routes/userRoutes');
const OrganisationRoutes = require('./routes/organaisationRoute');
const adminRoutes = require('./routes/adminroute');
const contactRoute = require('./routes/contact');
const moderatorRoutes = require('./routes/moderatorroute');
const itemRoutes = require('./routes/itemroute');
const chatRoutes = require('./routes/chatroute');

// Middleware
app.use(bodyParser.json());

// CORS Configuration (Important for Vercel)
app.use(cors({
    origin: "*", // Allow all origins for now (or put your frontend URL here)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));

// Route Definitions
app.use('/api/users', userRoutes);
app.use('/api/organaisation', OrganisationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoute);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/chat', chatRoutes);

// Base Route to check if server is running
app.get('/', (req, res) => {
    res.send("Findy Server is Running on Vercel!");
});

// --- IMPORTANT NOTE ON UPLOADS ---
// Vercel DOES NOT support local file storage. 
// Any file saved to './uploads' will disappear immediately.
// You MUST use Cloudinary for image storage in production.
// This line is kept only for local development compatibility:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SERVER STARTUP LOGIC ---
// Only listen on port if running locally. 
// Vercel handles the port automatically in production.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless environment
module.exports = app;