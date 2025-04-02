import React from "react";

interface Props {
  className?: string;
}

const AveroxLogo: React.FC<Props> = ({ className }) => {
  return (
    <div className={`font-bold text-2xl text-[#0056B3] ${className || ""}`}>
      AVEROX
    </div>
  );
};

export default AveroxLogo;