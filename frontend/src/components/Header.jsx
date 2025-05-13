import React from "react";

const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-1.25">
      <h2 className="text-3xl font-bold text-gray-700">{title}</h2>
      <h5 className="text-lg text-gray-500">{subtitle}</h5>
    </div>
  );
};

export default Header;