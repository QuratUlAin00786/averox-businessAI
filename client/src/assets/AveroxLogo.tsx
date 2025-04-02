import React from "react";
import logoImage from "./averox-logo.png";

interface Props {
  className?: string;
  height?: number;
}

const AveroxLogo: React.FC<Props> = ({ className, height = 40 }) => {
  return (
    <div className={className || ""}>
      <img 
        src={logoImage} 
        alt="AVEROX" 
        height={height} 
        style={{ height: `${height}px` }}
        className="object-contain"
      />
    </div>
  );
};

export default AveroxLogo;