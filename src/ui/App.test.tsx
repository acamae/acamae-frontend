import { render, screen } from '@testing-library/react';

import App from '@ui/App';

// Mockear AppRoutes con displayName para evitar error de linter
jest.mock('@ui/routes', () => {
  const MockAppRoutes = () => <div data-testid="mock-app-routes">Mock AppRoutes</div>;
  MockAppRoutes.displayName = 'MockAppRoutes';
  return MockAppRoutes;
});

describe('App Component', () => {
  it('should render AppRoutes inside the Redux Provider', () => {
    render(<App />);
    expect(screen.getByTestId('mock-app-routes')).toBeInTheDocument();
  });
});
