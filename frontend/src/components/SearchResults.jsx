import React from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Search Results</h2>
      <p>Searching for: {query}</p>
    </div>
  );
};

export default SearchResults;