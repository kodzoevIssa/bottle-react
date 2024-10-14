import React from "react";
import kiss from "./img/Kiss.png";

function Counter({ kissCount }) {
  return (
    <div className="counter">
      <h3>
        {kissCount} <img className="kiss" src={kiss}></img>{" "}
      </h3>
    </div>
  );
}

export default Counter;
