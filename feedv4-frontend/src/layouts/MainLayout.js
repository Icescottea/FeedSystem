import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './layout.css';

const MainLayout = ({ user }) => {
  return (
    <div className="layout">
      <Sidebar role={user.role} />
      <div className="main-content">
        {/* ✅ Pass user as context to Outlet */}
        <Outlet context={{ user }} />
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
