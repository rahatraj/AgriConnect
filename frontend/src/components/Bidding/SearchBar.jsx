import React from "react";

function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search bids..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="input input-bordered w-full md:w-80"
    />
  );
}

export default SearchBar;
