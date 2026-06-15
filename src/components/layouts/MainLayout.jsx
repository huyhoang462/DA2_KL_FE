import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

const MainLayout = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <div className="pt-hheader">
        <main className="mx-auto p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
      <ScrollRestoration />
    </div>
  );
};
export default MainLayout;
