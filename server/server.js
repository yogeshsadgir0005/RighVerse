
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const cron = require('node-cron'); 
const path = require('path');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();


const allowedorigins = [
"http://localhost:5173",
"http://localhost:5174"
]

app.use(cors({
  origin : allowedorigins,
  credentials : true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- IMPORT ROUTES ---

const newsRoutes = require('./routes/newsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const aiRoutes = require('./routes/aiRoutes');
const lawRoutes = require('./routes/lawRoutes');
const storyRoutes = require('./routes/storyRoutes'); // 1. New Import for Stories
const heroRoutes = require('./routes/heroRoutes');
const contactRoutes = require('./routes/contactRoutes');
// --- CRON JOBS ---
const { triggerDailyUpdate } = require('./controllers/aiController');
cron.schedule('0 7 * * *', async () => {
  console.log('⏰ 7:00 AM - Triggering Daily Law Update...');
  await triggerDailyUpdate();
}, { 
  timezone: "Asia/Kolkata"
});

// --- MOUNT ROUTES ---
app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/laws', lawRoutes);
app.use('/api/stories', storyRoutes); // 2. Mount Stories Route
app.use('/api/hero', heroRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/action-guides', require('./routes/actionGuideRoutes'));
// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));