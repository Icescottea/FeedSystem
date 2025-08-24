import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Beaker,
  Library,
  Wrench,
  Target,
  Factory,
  DollarSign,
  User as UserIcon
} from 'lucide-react';

const Sidebar = ({ roles }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, ...props }) => (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group
        ${isActive(to)
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
      `}
      {...props}
    >
      <Icon size={18} className={isActive(to) ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
      <span className="font-medium">{children}</span>
    </Link>
  );

  const SectionHeader = ({ children }) => (
    <div className="px-4 pt-6 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700/50 mb-2">
      {children}
    </div>
  );

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Feed</h1>
            <p className="text-xs text-gray-400 mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation - Improved spacing */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto scroll-smooth 
                      [&::-webkit-scrollbar]:w-1
                      [&::-webkit-scrollbar-thumb]:bg-gray-600
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb:hover]:bg-gray-500
                      [&::-webkit-scrollbar-track]:bg-gray-800">
        
        <div className="mb-4">
          <NavLink to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
        </div>

        {(roles.includes('ADMIN') || roles.includes('INVENTORY_MANAGER')) && (
          <div className="mb-6">
            <SectionHeader>Inventory</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/inventory" icon={Package}>
                Inventory
              </NavLink>
            </div>
          </div>
        )}

        {(roles.includes('ADMIN') || roles.includes('FORMULATOR')) && (
          <div className="mb-6">
            <SectionHeader>Formulation</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/formulations" icon={Beaker}>
                Engine
              </NavLink>
              <NavLink to="/formulation-library" icon={Library}>
                Library
              </NavLink>
              <NavLink to="/feed-profiles" icon={Target}>
                Profiles
              </NavLink>
            </div>
          </div>
        )}

        {(roles.includes('ADMIN') || roles.includes('OPERATOR')) && (
          <div className="mb-6">
            <SectionHeader>Production</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/pelleting" icon={Factory}>
                Pelleting
              </NavLink>
            </div>
          </div>
        )}

        {(roles.includes('ADMIN') || roles.includes('FINANCE_OFFICER')) && (
          <div className="mb-6">
            <SectionHeader>Finance</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/finance" icon={DollarSign}>
                Finance
              </NavLink>
            </div>
          </div>
        )}

        {(roles.includes('ADMIN')) && (
          <div className="mb-6">
            <SectionHeader>User Management</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/users" icon={UserIcon}>
                Users
              </NavLink>
            </div>
          </div>
        )}

        {(roles.includes('ADMIN')) && (
          <div className="mb-6">
            <SectionHeader>Factory</SectionHeader>
            <div className="space-y-2">
              <NavLink to="/factories" icon={Factory}>
                Factories
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;