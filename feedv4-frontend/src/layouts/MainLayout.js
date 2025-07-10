import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const MainLayout = ({ user }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar scrollable independently */}
      <div className="h-full overflow-y-auto bg-gray-900 custom-scrollbar-hide">
        <Sidebar role={user.role} />
      </div>

      {/* Main content with footer fixed below */}
      <div className="flex flex-col flex-1 bg-white">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet context={{ user }} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
