import React from 'react';

const BrandLogo = ({ size = "md", className = "" }) => {
  const dimension = size === "lg" ? "w-16 h-16" : size === "xl" ? "w-24 h-24" : "w-8 h-8";
  
  return (
    <div className={`${dimension} relative flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-primary-500"
      >
        <path 
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
          className="fill-primary-600/20 stroke-primary-600 stroke-[4]"
        />
        <path 
          d="M50 25 L75 37.5 L75 62.5 L50 75 L25 62.5 L25 37.5 Z" 
          className="fill-primary-500 stroke-primary-400 stroke-[2]"
        />
        <circle cx="50" cy="50" r="8" className="fill-white" />
      </svg>
    </div>
  );
};

export default BrandLogo;
