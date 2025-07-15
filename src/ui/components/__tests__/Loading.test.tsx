import { render, screen } from '@testing-library/react';

import Loading from '@ui/components/Loading';

describe('Loading', () => {
  it('should render the loading component', () => {
    render(<Loading />);

    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('should render the spinner icon', () => {
    render(<Loading />);

    const spinnerIcon = screen.getByTestId('loading-component').querySelector('i');
    expect(spinnerIcon).toBeInTheDocument();
    expect(spinnerIcon).toHaveClass('fa-solid', 'fa-spinner', 'fa-spin', 'loading-spinner');
  });

  it('should have correct structure', () => {
    render(<Loading />);

    const container = screen.getByTestId('loading-component');
    expect(container).toHaveClass('loading-container');

    const content = container.querySelector('.loading-content');
    expect(content).toBeInTheDocument();

    const spinner = content?.querySelector('i');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });
});
