import { render, screen } from '@testing-library/react';

import PrivateFooter from '@ui/components/PrivateFooter';

describe('PrivateFooter', () => {
  it('should render the PrivateFooter component', () => {
    render(<PrivateFooter />);
    expect(screen.getByTestId('private-footer')).toBeInTheDocument();
  });
});
