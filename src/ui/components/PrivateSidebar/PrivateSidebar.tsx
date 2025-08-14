import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';

import SidebarNav from '@ui/components/SidebarNav/SidebarNav';

const PrivateSidebar: React.FC = () => {
  const toggleAppSidebarMobile = () => {
    const elm = document.querySelector('.app');
    if (elm) {
      elm.classList.toggle('app-sidebar-mobile-toggled');
    }
  };

  return (
    <>
      <div id="sidebar" className="app-sidebar">
        <PerfectScrollbar className="app-sidebar-content" options={{ suppressScrollX: true }}>
          <SidebarNav />
        </PerfectScrollbar>
      </div>
      <button
        type="button"
        className="app-sidebar-mobile-backdrop"
        onClick={toggleAppSidebarMobile}
        title="Toggle sidebar">
        <i className="simple-icon-close" />
      </button>
    </>
  );
};

export default PrivateSidebar;
