import React, { useState } from "react";

function Widget({ data }) {
  return <div className="Widget">{data.balance}</div>;
}

export default Widget;
