import { render, screen } from '@testing-library/react';

import PrivateFooter from '@ui/components/PrivateFooter';

import packageJson from '../../../../package.json';

describe('PrivateFooter', () => {
  it('should render the PrivateFooter component', () => {
    render(<PrivateFooter />);
    const footer = screen.getByTestId('private-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(`v${packageJson.version}`);
  });
});
