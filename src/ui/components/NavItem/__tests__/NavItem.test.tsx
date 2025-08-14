import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@ui/composables/slideToggle', () => jest.fn());
jest.mock('@ui/composables/slideUp', () => jest.fn());

import NavItem from '@ui/components/NavItem/NavItem';
import slideToggle from '@ui/composables/slideToggle';
import slideUp from '@ui/composables/slideUp';

const renderWithRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

const buildSidebarDom = () => {
  document.body.innerHTML = `
    <div class="app-sidebar">
      <div class="menu">
        <div class="menu-item has-sub">
          <a class="menu-link">parent</a>
          <div class="menu-submenu">
            <div class="menu-item"><a class="menu-link">child</a><div class="menu-submenu"></div></div>
          </div>
        </div>
        <div class="menu-item has-sub">
          <a class="menu-link">sibling</a>
          <div class="menu-submenu"></div>
        </div>
      </div>
    </div>
  `;
};

describe('NavItem branches (click handling, active/expand/siblings)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes siblings and toggles current submenu across branches', () => {
    buildSidebarDom();

    const menu = {
      title: 'Root',
      path: '/x',
      children: [{ title: 'C1', path: '/x/c1' }],
    } as Parameters<typeof NavItem>[0]['menu'];

    renderWithRouter(<NavItem menu={menu} />);

    const links = document.querySelectorAll('.app-sidebar .menu > .menu-item.has-sub > .menu-link');
    const current = links[0] as HTMLElement;
    const sibling = links[1] as HTMLElement;

    // Initial click: should close siblings (slideUp) and toggle current
    fireEvent.click(current);
    expect(slideUp).toHaveBeenCalled();
    expect(slideToggle).toHaveBeenCalled();

    const target = current.nextElementSibling as HTMLElement;
    const targetItem = target.closest('.menu-item') as HTMLElement;

    // Branch: when already expanded -> close and toggle
    const toggleCalls1 = (slideToggle as jest.Mock).mock.calls.length;
    targetItem.classList.add('expand');
    fireEvent.click(current);
    expect((slideToggle as jest.Mock).mock.calls.length).toBeGreaterThan(toggleCalls1);

    // Branch: when active and target has no display set -> close and toggle
    const toggleCalls2 = (slideToggle as jest.Mock).mock.calls.length;
    targetItem.classList.add('active');
    target.style.display = '';
    fireEvent.click(current);
    expect((slideToggle as jest.Mock).mock.calls.length).toBeGreaterThan(toggleCalls2);

    // Click sibling to ensure other submenu closes
    const upCalls = (slideUp as jest.Mock).mock.calls.length;
    fireEvent.click(sibling);
    expect((slideUp as jest.Mock).mock.calls.length).toBeGreaterThan(upCalls);
  });
});
