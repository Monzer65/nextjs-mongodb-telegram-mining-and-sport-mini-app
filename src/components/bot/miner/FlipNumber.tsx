import React, { useState, useEffect } from "react";
import "./flip.css"; // Import the Tailwind CSS stylesheet

function FlipCounter({ value }: { value: number }) {
  const [digits, setDigits] = useState(value.toString().split("."));
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    setDigits(value.toString().split("."));
    setIsFlipping(true);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFlipping(false);
    }, 500); // Adjust the timeout as needed for the flip animation duration

    return () => clearTimeout(timeout);
  }, [isFlipping]);

  const renderDigit = (digit, index) => {
    const key = `digit-${index}`;
    const style = {
      transform: isFlipping ? "rotateX(180deg)" : "rotateX(0deg)",
      transition: "transform 0.5s ease-in-out",
    };

    return (
      <div key={key} className='flip-digit' style={style}>
        <span>{digit}</span>
        <span>{digit}</span>
      </div>
    );
  };

  return (
    <div className='flip-counter'>
      {digits.map((digit, index) => renderDigit(digit, index))}
      <span className='decimal-point'>.</span>
      {digits[1].split("").map((digit, index) => renderDigit(digit, index + 4))}
    </div>
  );
}

export default FlipCounter;
