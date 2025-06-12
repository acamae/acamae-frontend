import { render, screen } from '@testing-library/react';

import PublicFooter from '@ui/components/PublicFooter';

describe('PublicFooter', () => {
  it('should render the PublicFooter component', () => {
    render(<PublicFooter />);
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });
});
