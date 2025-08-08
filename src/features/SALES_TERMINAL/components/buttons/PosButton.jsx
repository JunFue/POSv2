import React from 'react';

const PosButton = ({ onClick, children, ...props }) => {
  return (
    <button
      className="text-[1.5vw] text-body-text bg-background hover:bg-primary-700 rounded-md px-4 shadow-button 
                 active:shadow-button-inset
                 border-2 active:border-background border-background hover:border-2 transition-all duration-300 ease-in hover:border-teal-300"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default PosButton;