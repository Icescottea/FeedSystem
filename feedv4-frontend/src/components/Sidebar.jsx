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
        flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 group
        ${isActive(to)
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
      `}
      {...props}
    >
      <Icon size={16} className={isActive(to) ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
      <span>{children}</span>
    </Link>
  );

  const SectionHeader = ({ children }) => (
    <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
      {children}
    </div>
  );

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col h-full shadow-md text-sm leading-tight">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <Target size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">FeedV4</h1>
            <p className="text-[10px] text-gray-400">Production System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        <NavLink to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>

        {(roles.includes('ADMIN') || roles.includes('INVENTORY_MANAGER')) && (
          <>
            <SectionHeader>Inventory</SectionHeader>
            <NavLink to="/inventory" icon={Package}>
              Inventory
            </NavLink>
          </>
        )}

        {(roles.includes('ADMIN') || roles.includes('FORMULATOR')) && (
          <>
            <SectionHeader>Formulation</SectionHeader>
            <NavLink to="/formulations" icon={Beaker}>
              Engine
            </NavLink>
            <NavLink to="/formulation-library" icon={Library}>
              Library
            </NavLink>
            <NavLink to="/feed-profiles" icon={Target}>
              Profiles
            </NavLink>
          </>
        )}

        {(roles.includes('ADMIN') || roles.includes('OPERATOR')) && (
          <>
            <SectionHeader>Production</SectionHeader>
            <NavLink to="/pelleting" icon={Factory}>
              Pelleting
            </NavLink>
          </>
        )}

        {(roles.includes('ADMIN') || roles.includes('FINANCE_OFFICER')) && (
          <>
            <SectionHeader>Finance</SectionHeader>
            <NavLink to="/finance" icon={DollarSign}>
              Finance
            </NavLink>
          </>
        )}

        {(roles.includes('ADMIN')) && (
          <>
          <SectionHeader>User</SectionHeader>
          <NavLink to="/users" icon={UserIcon}>
            User Management
          </NavLink></>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
