import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const MainLayout = ({ user }) => {
  /*  overflow‑x‑hidden  → page itself can’t scroll sideways
      flex‑shrink‑0      → sidebar keeps its 256 px width, never squashes   */
  return (
    <div className="flex h-screen w-screen overflow-x-hidden">
      <aside className="w-60 flex-shrink-0 bg-gray-900 overflow-y-auto custom-scrollbar-hide">
        <Sidebar role={user.role} />
      </aside>

      <div id="toast-container" className="fixed top-5 right-5 z-50 space-y-2" />

      <main className="flex flex-col flex-1 bg-white">
        <section className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-7xl w-full mx-auto">
            <Outlet context={{ user }} />
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
