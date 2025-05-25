import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FocusControl from '../focus/FocusControl';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <FocusControl />
      </div>
    </div>
  );
};

export default Layout;