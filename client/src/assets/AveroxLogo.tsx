import React from "react";
import logoImage from "./averox-logo.png";

interface Props {
  className?: string;
  height?: number;
  showCRM?: boolean;
}

const AveroxLogo: React.FC<Props> = ({ className, height = 40, showCRM = true }) => {
  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      <img 
        src={logoImage} 
        alt="AVEROX" 
        height={height} 
        style={{ height: `${height}px` }}
        className="object-contain"
      />
      {showCRM && (
        <div className="mt-1 text-center text-xs font-semibold text-neutral-700">
          CRM
        </div>
      )}
    </div>
  );
};

export default AveroxLogo;