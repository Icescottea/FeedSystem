import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Beaker,
  Library,
  Factory,
  DollarSign,
  Wrench,
  User as UserIcon,
  ChevronDown,
  CreditCard,
  Target
} from 'lucide-react';

const Sidebar = ({ roles }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`
        flex items-center gap-2 px-6 py-2 rounded-md text-sm transition
        ${isActive(to)
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
      `}
    >
      <Icon size={16} />
      {children}
    </Link>
  );

  const Dropdown = ({ label, icon: Icon, menuKey, children }) => (
    <div>
      <button
        onClick={() => toggleMenu(menuKey)}
        className="flex w-full items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform ${openMenus[menuKey] ? 'rotate-180' : ''}`}
        />
      </button>

      {openMenus[menuKey] && (
        <div className="mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col h-full shadow-md text-sm leading-tight">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <Target size={14} className="text-white"/>
          </div>
          <div>
            <h1 className="text-lg font-bold">Feed</h1>
            <p className="text-[10px] text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scroll-smooth 
                      [&::-webkit-scrollbar]:w-1
                      [&::-webkit-scrollbar-thumb]:bg-gray-600
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb:hover]:bg-gray-500
                      [&::-webkit-scrollbar-track]:bg-gray-800">
        <NavLink to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavLink>

        {(roles.includes('ADMIN') || roles.includes('INVENTORY_MANAGER')) && (
          <NavLink to="/inventory" icon={Package}>
            Inventory
          </NavLink>
        )}
        
        {(roles.includes('ADMIN') || roles.include('OPERATOR')) && (
          <NavLink to="/pelleting" icon={Factory}>
            Pelleting
          </NavLink>
        )}

        {(roles.includes('ADMIN') || roles.include('FINANACE_OFFICER')) && (
          <NavLink to="/finance" icon={DollarSign}>
            Finance
          </NavLink>
        )}

        {(roles.includes('ADMIN') || roles.includes('FINANCE_OFFICER')) && (
          <Dropdown label="Sales" icon={DollarSign} menuKey="sales">
            <NavLink to="/sales/customers">
              Customers
            </NavLink>
            <NavLink to="/sales/quotes">
              Quotes
            </NavLink>
            <NavLink to="/sales/sales-orders">
              Sales Orders
            </NavLink>
            <NavLink to="/sales/invoices">
              Invoices
            </NavLink>
            <NavLink to="/sales/receipts">
              Sales Receipts
            </NavLink>
            <NavLink to="/sales/payaments-received">
              Payments Received
            </NavLink>
          </Dropdown>
        )}

        {(roles.includes('ADMIN') || roles.includes('FINANCE_OFFICER')) && (
          <Dropdown label="Purchases" icon={CreditCard} menuKey="purchases">
            <NavLink to="/sales/vendors">
              Vendors
            </NavLink>
            <NavLink to="/sales/expenses">
              Expenses
            </NavLink>
            <NavLink to="/sales/purchase-orders">
              Purchase Orders
            </NavLink>
            <NavLink to="/sales/bills">
              Bills
            </NavLink>
            <NavLink to="/sales/payments-made">
              Payments Made
            </NavLink>
          </Dropdown>
        )}

        {(roles.includes('ADMIN') || roles.includes('FORMULATOR')) && (
          <Dropdown label="Formulation" icon={Beaker} menuKey="formulation">
            <NavLink to="/formulations" icon={Beaker}>
              Engine
            </NavLink>
            <NavLink to="/formulation-library" icon={Library}>
              Library
            </NavLink>
            <NavLink to="/feed-profiles" icon={Target}>
              Profiles
            </NavLink>
          </Dropdown>
        )}

        {roles.includes('ADMIN') && (
          <Dropdown label="Admin" icon={UserIcon} menuKey="admin">
            <NavLink to="/users" icon={UserIcon}>
              Users
            </NavLink>
            <NavLink to="/factories" icon={Factory}>
              Factories
            </NavLink>
          </Dropdown>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
