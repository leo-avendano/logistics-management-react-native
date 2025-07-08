import React, { createContext, useContext, useState } from 'react';
import { Navbar } from '@/components/Navbar';

const NavbarContext = createContext();

export function NavbarProvider({ children }) {
  const [showNavbar, setShowNavbar] = useState(true);
  
  return (
    <NavbarContext.Provider value={{ showNavbar, setShowNavbar }}>
      {children}
      {showNavbar && <Navbar/>}
    </NavbarContext.Provider>
  );
}

export function useShowNavbar() {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useShowNavbar debe usarse dentro de NavbarProvider');
  }
  
  return [context.showNavbar, context.setShowNavbar];
}