import React from "react";
import "./led-display.css";

interface Props {
  value: number | string;
  digits?: number;
}

export function LedDisplay({ value, digits = 3 }: Props) {
  const str = String(value).padStart(digits, "0");

  return (
    <div className="led">

      {/* valeur active */}
      <div className="led__value">{str}</div>

      {/* overlay SVG + scanlines */}
      <div className="led__overlay" />
    </div>
  );
}
