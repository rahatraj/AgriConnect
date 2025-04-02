import React from "react";

function BidFilters({ status, setStatus }) {
  return (
    <div className="flex gap-3">
      <button 
        className={`btn ${status === "" ? "btn-primary" : "btn-outline"}`} 
        onClick={() => setStatus("")}
      >
        All
      </button>
      <button 
        className={`btn ${status === "Open" ? "btn-primary" : "btn-outline"}`} 
        onClick={() => setStatus("Open")}
      >
        Ongoing
      </button>
      <button 
        className={`btn ${status === "Close" ? "btn-primary" : "btn-outline"}`} 
        onClick={() => setStatus("Close")}
      >
        Closed
      </button>
    </div>
  );
}

export default BidFilters;
