import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}

      <div className="card-arrow">
        <div className="card-arrow-top-left"></div>
        <div className="card-arrow-top-right"></div>
        <div className="card-arrow-bottom-left"></div>
        <div className="card-arrow-bottom-right"></div>
      </div>
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

interface CardImgOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const CardImgOverlay: React.FC<CardImgOverlayProps> = ({ children, className = '' }) => {
  return <div className={`card-img-overlay ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

interface CardGroupProps {
  children: React.ReactNode;
  className?: string;
}

const CardGroup: React.FC<CardGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-group ${className}`} data-testid="card-group">
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardImgOverlay, CardFooter, CardGroup };
