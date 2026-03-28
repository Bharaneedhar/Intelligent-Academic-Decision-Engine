const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Main Route Check
app.get('/', (req, res) => {
    res.send('LearnBuddyyy API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/roadmaps', require('./routes/roadmapRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));

// Serve static uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
