import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {
  return (
    <div className="sidebar">
      <h2>FeedV4</h2>
      <nav>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        {(role === 'ADMIN' || role === 'INVENTORY_MANAGER') && (
          <Link to="/inventory" className="nav-link">Inventory</Link>
        )}
        {(role === 'ADMIN' || role === 'FORMULATOR') && (
          <>
            <Link to="/formulations" className="nav-link">Formulation Engine</Link>
            <Link to="/formulation-library" className="nav-link">Formulation Library</Link>
            <Link to="/formulation-builder" className="nav-link">Build Formulation</Link>
          </>
        )}
        {role === 'ADMIN' && (
          <Link to="/users" className="nav-link">Users</Link>
        )}
        {role === 'FINANCE_OFFICER' && (
          <Link to="/finance" className="nav-link">Finance</Link>
        )}
        {(role == 'ADMIN' || role == 'FORMULATOR' ) && ( 
          <Link to="/feed-profiles" className="nav-link">Feed Profiles</Link>
        )}
        {(role === 'ADMIN' || role === 'OPERATOR') && (
          <li><Link to="/pelleting">Pelleting Queue</Link></li>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
