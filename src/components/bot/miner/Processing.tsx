"use client";
import React, { useState, useEffect } from "react";

type ProcessingStateProps = {
  length?: number;
  speed?: number;
  duration?: number;
};

const PROCESSING_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

export default function ProcessingState({
  length = 32,
  speed = 5,
  duration = 4 * 60 * 60 * 100,
}: ProcessingStateProps) {
  const [displayText, setDisplayText] = useState("");
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const generateInitialText = () => Array(length).fill("0").join("");

    setDisplayText(generateInitialText());

    const interval = setInterval(() => {
      setDisplayText((prevText) => {
        const textArray = prevText.split("");
        const randomIndex = Math.floor(Math.random() * length);
        const randomChar =
          PROCESSING_CHARS[Math.floor(Math.random() * PROCESSING_CHARS.length)];
        textArray[randomIndex] = randomChar;
        return textArray.join("");
      });
    }, speed);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProcessing(false);
      setDisplayText("".padStart(length, "#")); // End state with '#'
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [length, speed, duration]);

  return (
    <div className='flex items-center justify-center gap-2 font-mono text-sm'>
      <p
        className='overflow-hidden whitespace-nowrap'
        style={{ maxWidth: `${length * 0.6}em` }}
        aria-live='polite'
      >
        {displayText}
      </p>
    </div>
  );
}
