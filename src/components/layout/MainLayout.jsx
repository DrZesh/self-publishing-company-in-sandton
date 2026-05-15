import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DesktopMegaMenu from './DesktopMegaMenu';
import Footer from './Footer';
import WhatsAppButton from '../shared/WhatsAppButton';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Desktop Mega Menu (hidden on mobile) */}
      <div className="hidden lg:block">
        <DesktopMegaMenu />
      </div>

      {/* Mobile Hamburger Menu (hidden on desktop) */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}