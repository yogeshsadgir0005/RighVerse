import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Scale, Newspaper, BookOpen, FileText, LayoutDashboard, Gavel } from 'lucide-react'; // Added Gavel

export default function AdminLayout() {
  const location = useLocation();
  
  const menu = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage News', path: '/news', icon: <Newspaper size={20} /> },
    { name: 'Manage Blogs', path: '/blogs', icon: <BookOpen size={20} /> },
    { name: 'Manage Templates', path: '/templates', icon: <FileText size={20} /> },
    // Added Manage Laws with Gavel icon
    { name: 'Manage Laws', path: '/laws', icon: <Gavel size={20} /> }, 
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col fixed h-full">
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <Scale className="text-white" />
          <h1 className="text-xl font-serif font-bold text-white">RV Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path 
                ? 'bg-stone-800 text-white shadow-md' 
                : 'hover:bg-stone-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-800">
           <button className="w-full py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 text-sm">Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <Outlet /> 
      </main>
    </div>
  );
}