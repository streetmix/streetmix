import React from "react";

interface SwatchGroupProps {
  children: React.ReactNode;
}

function SwatchGroup({ children }: SwatchGroupProps) {
  return <div className="stmx-swatch-group">{children}</div>;
}

export default SwatchGroup;
