import React from "react";

const FlexBetween = ({ children, className, ...props }) => {
  return (
    <div
      className={`flex justify-between items-center ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default FlexBetween;