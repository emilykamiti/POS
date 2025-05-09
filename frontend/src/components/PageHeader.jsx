import React from "react";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-4">
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      <p className="text-lg text-gray-500">{subtitle}</p>
    </div>
  );
};

export default PageHeader;