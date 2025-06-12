import { render, screen } from '@testing-library/react';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImgOverlay,
  CardGroup,
} from '@ui/components/Card';

describe('Card', () => {
  it('should render the Card component', () => {
    render(<Card>Test</Card>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-arrow')).toBeInTheDocument();
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
    render(<Card className="test-class">Test</Card>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toHaveClass('test-class');
  });

  it('should render the CardHeader component with className', () => {
    render(<CardHeader className="test-class">Test</CardHeader>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toHaveClass('test-class');
  });

  it('should render the CardBody component with className', () => {
    render(<CardBody className="test-class">Test</CardBody>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-body')).toHaveClass('test-class');
  });

  it('should render the CardFooter component with className', () => {
    render(<CardFooter className="test-class">Test</CardFooter>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toHaveClass('test-class');
  });

  it('should render the CardImgOverlay component with className', () => {
    render(<CardImgOverlay className="test-class">Test</CardImgOverlay>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-img-overlay')).toHaveClass('test-class');
  });

  it('should render the CardGroup component with className', () => {
    render(<CardGroup className="test-class">Test</CardGroup>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('card-group')).toHaveClass('test-class');
  });
});
