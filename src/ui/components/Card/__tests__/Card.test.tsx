import { render, screen } from '@testing-library/react';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImgOverlay,
  CardGroup,
} from '@ui/components/Card/Card';

describe('Card', () => {
  it('should render the Card component', () => {
    const { container } = render(<Card>Test</Card>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    const card = container.querySelector('.card');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.card-arrow')).not.toBeNull();
  });

  it('should render the CardHeader component', () => {
    render(<CardHeader>Test</CardHeader>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render the CardBody component', () => {
    render(<CardBody>Test</CardBody>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render the CardFooter component', () => {
    render(<CardFooter>Test</CardFooter>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render the CardImgOverlay component', () => {
    render(<CardImgOverlay>Test</CardImgOverlay>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render the CardGroup component', () => {
    render(<CardGroup>Test</CardGroup>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should render the Card component with className', () => {
    const { container } = render(<Card className="test-class">Test</Card>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    const card = container.querySelector('.card');
    expect(card).not.toBeNull();
    expect(card).toHaveClass('test-class');
  });

  it('should render the CardHeader component with className', () => {
    render(<CardHeader className="test-class">Test</CardHeader>);
    const el = screen.getByText('Test');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('card-header');
    expect(el).toHaveClass('test-class');
  });

  it('should render the CardBody component with className', () => {
    render(<CardBody className="test-class">Test</CardBody>);
    const el = screen.getByText('Test');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('card-body');
    expect(el).toHaveClass('test-class');
  });

  it('should render the CardFooter component with className', () => {
    render(<CardFooter className="test-class">Test</CardFooter>);
    const el = screen.getByText('Test');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('card-footer');
    expect(el).toHaveClass('test-class');
  });

  it('should render the CardImgOverlay component with className', () => {
    render(<CardImgOverlay className="test-class">Test</CardImgOverlay>);
    const el = screen.getByText('Test');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('card-img-overlay');
    expect(el).toHaveClass('test-class');
  });

  it('should render the CardGroup component with className', () => {
    render(<CardGroup className="test-class">Test</CardGroup>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-group')).toHaveClass('test-class');
  });

  // Extra coverage merged from Card.more/branches/inner tests
  it('renders nested structure correctly', () => {
    const { container } = render(
      <Card className="outer">
        <CardHeader className="hdr">Header</CardHeader>
        <CardBody className="bdy">Body</CardBody>
        <CardImgOverlay className="ovr">Overlay</CardImgOverlay>
        <CardFooter className="ftr">Footer</CardFooter>
      </Card>
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('outer');
    expect(screen.getByText('Header')).toHaveClass('hdr');
    expect(screen.getByText('Body')).toHaveClass('bdy');
    expect(screen.getByText('Overlay')).toHaveClass('ovr');
    expect(screen.getByText('Footer')).toHaveClass('ftr');
  });

  it('CardGroup wraps children', () => {
    const { container } = render(
      <CardGroup className="grp">
        <Card>One</Card>
        <Card>Two</Card>
      </CardGroup>
    );
    const group = screen.getByText('One').closest('.card-group') as HTMLElement;
    expect(group).toHaveClass('grp');
    expect(container.querySelectorAll('.card').length).toBe(2);
  });
});
