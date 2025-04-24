import React from "react";
import logoImage from "./averox-logo.png";

interface Props {
  className?: string;
  height?: number;
  showBusinessAI?: boolean;
}

const AveroxLogo: React.FC<Props> = ({ className, height = 40, showBusinessAI = true }) => {
  // Calculate Business AI text size based on logo height (scale appropriately)
  const textSize = Math.max(13, Math.floor(height / 2.8));
  
  return (
    <div className={`flex flex-col items-center ${className || ""}`}>
      <img 
        src={logoImage} 
        alt="AVEROX" 
        height={height} 
        style={{ 
          height: `${height}px`,
          minHeight: `${height}px`,
          minWidth: `${height * 3}px`, // Wider to accommodate "Business AI" text
        }}
        className="object-contain"
      />
      {showBusinessAI && (
        <div 
          className="mt-0.5 text-center font-bold text-neutral-700"
          style={{ 
            fontSize: `${textSize}px`,
            lineHeight: `${textSize * 1.2}px`,
            letterSpacing: "0.01em",
          }}
        >
          Business AI
        </div>
      )}
    </div>
  );
};

export default AveroxLogo;