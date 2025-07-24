import { render, screen } from '@testing-library/react';

import PublicFooter from '@ui/components/PublicFooter';

import packageJson from '../../../../package.json';

describe('PublicFooter', () => {
  it('should render the PublicFooter component', () => {
    render(<PublicFooter />);
    const footer = screen.getByTestId('public-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(`v${packageJson.version}`);
  });
});
