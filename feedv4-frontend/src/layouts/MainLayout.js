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
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
