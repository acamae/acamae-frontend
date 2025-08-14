import React, { useEffect } from 'react';
import {
  LinkProps,
  NavLink,
  useMatch,
  useResolvedPath,
  matchPath,
  useLocation,
} from 'react-router-dom';

import slideToggle from '@ui/composables/slideToggle';
import slideUp from '@ui/composables/slideUp';

type MenuItem = {
  title?: string;
  path?: string;
  is_header?: boolean;
  is_divider?: boolean;
  icon?: string;
  img?: string;
  badge?: React.ReactNode;
  label?: string;
  highlight?: boolean;
  children?: MenuItem[];
};

interface NavItemProps extends Omit<LinkProps, 'to'> {
  menu: MenuItem;
}

const NavItem: React.FC<NavItemProps> = ({ menu, ...props }) => {
  const path = menu.path ?? '';
  const resolved = useResolvedPath(path);
  const match = useMatch({ path: resolved.pathname });
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e: Event) => {
      e.preventDefault();
      const current = e.currentTarget as HTMLElement | null;
      if (!current) return;

      const target = current.nextElementSibling as HTMLElement | null;

      // Only close siblings at the same level
      const parentMenu = current.closest('.menu-submenu') ?? current.closest('.menu');
      const siblingMenus: Element[] = parentMenu ? Array.from(parentMenu.children) : [];

      siblingMenus.forEach((sibling: Element) => {
        const maybeOtherTarget = sibling.querySelector('.menu-submenu');
        if (maybeOtherTarget instanceof HTMLElement && maybeOtherTarget !== target) {
          slideUp(maybeOtherTarget, expandTime);

          const maybeOtherTargetMenuItem = maybeOtherTarget.closest('.menu-item');
          if (maybeOtherTargetMenuItem instanceof HTMLElement) {
            maybeOtherTargetMenuItem.classList.remove('expand');
            maybeOtherTargetMenuItem.classList.add('closed');
          }
        }
      });

      const targetItemElm = target?.closest('.menu-item');
      if (
        (targetItemElm?.classList.contains('expand') ?? false) ||
        ((targetItemElm?.classList.contains('active') ?? false) &&
          !!target &&
          !target.style.display)
      ) {
        targetItemElm?.classList.remove('expand');
        targetItemElm?.classList.add('closed');
        if (target) slideToggle(target, expandTime);
      } else {
        targetItemElm?.classList.add('expand');
        targetItemElm?.classList.remove('closed');
        if (target) slideToggle(target, expandTime);
      }
    };

    const handleSidebarMenuToggle = (menus: HTMLElement[]) => {
      menus.forEach((menuEl: HTMLElement) => {
        menuEl.removeEventListener('click', handleClick as unknown as EventListener);
        menuEl.addEventListener('click', handleClick as unknown as EventListener);
      });
    };

    // Get sidebar expand time
    const expandTime = 0;

    const menuBaseSelector = '.app-sidebar .menu > .menu-item.has-sub';
    const submenuBaseSelector = ' > .menu-submenu > .menu-item.has-sub';

    // Select menu items
    const menus = Array.from(
      document.querySelectorAll<HTMLElement>(`${menuBaseSelector} > .menu-link`)
    );
    const submenusLvl1 = Array.from(
      document.querySelectorAll<HTMLElement>(
        `${menuBaseSelector}${submenuBaseSelector} > .menu-link`
      )
    );
    const submenusLvl2 = Array.from(
      document.querySelectorAll<HTMLElement>(
        `${menuBaseSelector}${submenuBaseSelector}${submenuBaseSelector} > .menu-link`
      )
    );

    handleSidebarMenuToggle([...menus, ...submenusLvl1, ...submenusLvl2]);

    return () => {
      [...menus, ...submenusLvl1, ...submenusLvl2].forEach((menuEl: HTMLElement) => {
        menuEl.removeEventListener('click', handleClick as EventListener);
      });
    };
  }, []);

  if (menu.is_header) {
    return <div className="menu-header">{menu.title}</div>;
  }

  if (menu.is_divider) {
    return <div className="menu-divider"></div>;
  }

  const match2 = matchPath({ path: path, end: false }, location.pathname);

  const icon = menu.icon && (
    <div className="menu-icon">
      <i className={menu.icon}></i>
    </div>
  );
  const img = menu.img && (
    <div className="menu-icon-img">
      <img src={menu.img} alt="" />
    </div>
  );
  const caret = menu.children && !menu.badge && (
    <div className="menu-caret">
      <b className="caret"></b>
    </div>
  );
  const label = menu.label && <span className="menu-label ms-5px">{menu.label}</span>;
  const badge = menu.badge && <div className="menu-badge">{menu.badge}</div>;
  const highlight = menu.highlight && <i className="fa fa-paper-plane text-theme"></i>;
  const title = menu.title && (
    <div className="menu-text">
      {menu.title} {label} {highlight}
    </div>
  );

  return (
    <div
      className={`menu-item${match || match2 ? ' active' : ''}${menu.children ? ' has-sub' : ''}`}>
      <NavLink className="menu-link" to={path} {...props}>
        {img} {icon} {title}
        {caret} {badge}
      </NavLink>

      {menu.children && (
        <div className="menu-submenu">
          {menu.children.map((submenu: MenuItem) => (
            <NavItem
              key={[submenu.path, submenu.title, submenu.label].filter(Boolean).join('|')}
              menu={submenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NavItem;
