import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../shared/Header';

const MainLayout = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <div className="pt-hheader">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
