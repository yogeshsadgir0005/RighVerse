import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Pages
import HomePage from './pages/HomePage';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Blogs from './pages/Blogs';
import ArticleDetail from './pages/ArticleDetail';
import Contact from './pages/Contact';

// Law Library Imports
import LawLibrary from './pages/LawLibrary';
import LawDetail from './pages/LawDetail';

// New Feature Imports
import YourVoice from './pages/YourVoice'; 
import HelpResources from './pages/HelpResources';

// Global Components
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot'; // <--- 1. Import the Chatbot here
import ScrollToTop from './components/ScrollToTop';
import Policies from './pages/Policies';
export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Law Library Routes */}
            <Route path="/law-library" element={<LawLibrary />} />
            <Route path="/law-library/citizens" element={<LawLibrary />} />
            <Route path="/law-library/lawyers" element={<LawLibrary />} />
            
            {/* Law Detail Page */}
            <Route path="/law/:slug" element={<LawDetail />} />

            {/* Feature Routes */}
            <Route path="/your-voice" element={<YourVoice />} /> 
            <Route path="/resources" element={<HelpResources />} />
            
            {/* Other Routes */}
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<ArticleDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policies" element={<Policies />} />
          </Routes>
        </main>
        
        <Footer />
        
        {/* 2. Place it here, outside the Routes, so it persists on every page */}
        <AIChatbot /> 
      </div>
    </BrowserRouter>
  );
}