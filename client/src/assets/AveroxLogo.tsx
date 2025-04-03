import React from "react";
import logoImage from "./averox-logo.png";

interface Props {
  className?: string;
  height?: number;
  showCRM?: boolean;
}

const AveroxLogo: React.FC<Props> = ({ className, height = 40, showCRM = true }) => {
  // Calculate CRM text size based on logo height (scale appropriately)
  const textSize = Math.max(10, Math.floor(height / 3.5));
  
  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      <img 
        src={logoImage} 
        alt="AVEROX" 
        height={height} 
        style={{ 
          height: `${height}px`,
          minHeight: `${height}px`,
          minWidth: `${height * 2.5}px`, // Maintain good aspect ratio
        }}
        className="object-contain"
      />
      {showCRM && (
        <div 
          className="mt-0.5 text-center font-semibold text-neutral-700"
          style={{ 
            fontSize: `${textSize}px`,
            lineHeight: `${textSize * 1.2}px`,
          }}
        >
          CRM
        </div>
      )}
    </div>
  );
};

export default AveroxLogo;