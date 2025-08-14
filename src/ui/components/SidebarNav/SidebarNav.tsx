import React from 'react';

import NavItem from '@ui/components/NavItem/NavItem';
import usePrivateMenu, { PrivateMenuItem } from '@ui/routes/privateMenu';

const SidebarNav: React.FC = () => {
  const menuItems = usePrivateMenu();

  return (
    <div className="menu">
      {menuItems.map((menu: PrivateMenuItem) => (
        <NavItem
          key={[menu.path, menu.title, (menu as { label?: string }).label]
            .filter(Boolean)
            .join('|')}
          menu={menu as unknown as Parameters<typeof NavItem>[0]['menu']}
        />
      ))}
    </div>
  );
};

export default SidebarNav;
