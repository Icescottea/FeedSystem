import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Login from './pages/Login';
import InventoryPage from './pages/InventoryPage';
import FeedProfilePage from './pages/FeedProfilePage';
import FormulationEnginePage from './pages/FormulationEnginePage';
import FormulationLibraryPage from './pages/FormulationLibraryPage';
import FormulationBuilderPage from './pages/FormulationBuilderPage';
import PelletingQueuePage from './pages/PelletingQueuePage';


const App = () => {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout user={user} />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/feed-profiles" element={<FeedProfilePage />} />
        <Route path="/formulations" element={<FormulationEnginePage />} />
        <Route path="/formulation-library" element={<FormulationLibraryPage />} />   
        <Route path="/formulation-builder" element={<FormulationBuilderPage />} /> 
        <Route path="/pelleting" element={<PelletingQueuePage />} />
        {/* Add more as needed */}
      </Route>
    </Routes>
  );
};

export default App;
