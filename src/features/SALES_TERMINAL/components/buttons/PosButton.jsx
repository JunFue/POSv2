import React from "react";

const PosButton = ({ onClick, children, ...props }) => {
  return (
    <button
      className="text-[1.5vw] text-body-text bg-background traditional-button whitespace-nowrap text-ellipsis overflow-hidden"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default PosButton;
