import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import PrivateSidebar from '@ui/components/PrivateSidebar/PrivateSidebar';

jest.mock('react-perfect-scrollbar', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="ps">{children}</div>,
}));

jest.mock('@ui/components/SidebarNav/SidebarNav', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-nav">nav</div>,
}));

describe('PrivateSidebar', () => {
  it('renders and toggles mobile backdrop class on click', () => {
    const app = document.createElement('div');
    app.className = 'app';
    document.body.appendChild(app);

    render(<PrivateSidebar />);

    expect(screen.getByTestId('ps')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();

    const btn = screen.getByRole('button', { hidden: true });
    fireEvent.click(btn);
    expect(app.classList.contains('app-sidebar-mobile-toggled')).toBe(true);

    fireEvent.click(btn);
    expect(app.classList.contains('app-sidebar-mobile-toggled')).toBe(false);
  });
});
