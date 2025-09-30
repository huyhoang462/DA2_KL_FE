// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../shared/Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header variant="main" />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
export default MainLayout;
