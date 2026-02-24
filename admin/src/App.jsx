import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Newspaper, Scale, BookOpen, Gavel, MessageSquare, Layout, List } from 'lucide-react'; // Added List icon

import ManageBlogs from './pages/ManageBlogs';
import ManageLaws from './pages/ManageLaws';
import ManageStories from './pages/ManageStories'; 
import ManageHero from './pages/ManageHero';
import AdminActionGuides from './pages/AdminActionGuides'; // Imported new component

// Sidebar Component
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { name: 'Manage Blogs', path: '/', icon: <BookOpen size={20} /> },
    { name: 'Manage Laws', path: '/laws', icon: <Gavel size={20} /> },
    { name: 'Manage Hero', path: '/hero', icon: <Layout size={20} /> },
    { name: 'Manage Stories', path: '/stories', icon: <MessageSquare size={20} /> }, 
    { name: 'Manage Guides', path: '/guides', icon: <List size={20} /> }, // Added new navigation link
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 fixed h-full flex flex-col border-r border-stone-800">
      <div className="p-6 flex items-center gap-3 border-b border-stone-800">
        <Scale className="text-white" />
        <h1 className="text-xl font-serif font-bold text-white">RV Admin</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(item.path) ? 'bg-stone-800 text-white' : 'hover:bg-stone-800/50'
            }`}
          >
            {item.icon} <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-stone-50 text-stone-900 font-sans">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Routes>
            <Route path="/" element={<ManageBlogs />} />
            <Route path="/laws" element={<ManageLaws />} />
            <Route path="/hero" element={<ManageHero />} />
            <Route path="/stories" element={<ManageStories />} /> 
            <Route path="/guides" element={<AdminActionGuides />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}