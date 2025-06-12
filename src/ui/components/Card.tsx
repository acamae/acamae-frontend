import React from 'react';

function Card(props: { className?: string; children: React.ReactNode }) {
  return (
    <div className={'card ' + (props.className ? props.className : '')} data-testid="card">
      {props.children}

      <div className="card-arrow" data-testid="card-arrow">
        <div className="card-arrow-top-left"></div>
        <div className="card-arrow-top-right"></div>
        <div className="card-arrow-bottom-left"></div>
        <div className="card-arrow-bottom-right"></div>
      </div>
    </div>
  );
}

function CardHeader(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={'card-header ' + (props.className ? props.className : '')}
      data-testid="card-header">
      {props.children}
    </div>
  );
}

function CardBody(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={'card-body ' + (props.className ? props.className : '')}
      data-testid="card-body">
      {props.children}
    </div>
  );
}

function CardImgOverlay(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={'card-img-overlay ' + (props.className ? props.className : '')}
      data-testid="card-img-overlay">
      {props.children}
    </div>
  );
}

function CardFooter(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={'card-footer ' + (props.className ? props.className : '')}
      data-testid="card-footer">
      {props.children}
    </div>
  );
}

function CardGroup(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={'card-group ' + (props.className ? props.className : '')}
      data-testid="card-group">
      {props.children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardImgOverlay, CardFooter, CardGroup };
