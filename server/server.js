
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const cron = require('node-cron'); 
const path = require('path');

dotenv.config();

connectDB();

const app = express();


const allowedorigins = [
"http://localhost:5173",
"http://localhost:5174",
'https://righ-verse.vercel.app',
'https://righ-verse-e4ql.vercel.app'

]

app.use(cors({
  origin : allowedorigins,
  credentials : true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const newsRoutes = require('./routes/newsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const aiRoutes = require('./routes/aiRoutes');
const lawRoutes = require('./routes/lawRoutes');
const storyRoutes = require('./routes/storyRoutes'); 
const heroRoutes = require('./routes/heroRoutes');
const contactRoutes = require('./routes/contactRoutes');

const { triggerDailyUpdate } = require('./controllers/aiController');
cron.schedule('0 7 * * *', async () => {
  console.log('⏰ 7:00 AM - Triggering Daily Law Update...');
  await triggerDailyUpdate();
}, { 
  timezone: "Asia/Kolkata"
});

app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/laws', lawRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/action-guides', require('./routes/actionGuideRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));