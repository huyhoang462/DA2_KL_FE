import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import ScrollToTop from '../shared/ScrollToTop';

const MainLayout = () => {
  return (
    <div className="bg-background min-h-screen">
      <ScrollToTop />
      <Header />
      <div className="pt-hheader">
        <main className="mx-auto p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
export default MainLayout;
