// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer'; 

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F1E8]">
      {/* Fixed Header */}
      <Header />

      {/* Main Content (Outlet renders the current page) */}
      <main className="grow mt-[72px] md:mt-[72px]"> 
        <Outlet />
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;