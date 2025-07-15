import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="loading-container" data-testid="loading-component">
      <div className="loading-content">
        <i className="fa-solid fa-spinner fa-spin loading-spinner"></i>
      </div>
    </div>
  );
};

export default Loading;
