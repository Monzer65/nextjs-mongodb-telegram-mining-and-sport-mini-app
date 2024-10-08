"use client";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import groovyRunAnimation from "@/app/_assets/juggle.json";
import { useRef, useState, useEffect } from "react";

const LottieComponent = () => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [speed, setSpeed] = useState(1);
  const [prevTapTime, setPrevTapTime] = useState<number | null>(null);
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout | null>(null);
  const [speedDownInterval, setSpeedDownInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Function to gradually reduce speed
  const startSpeedDown = () => {
    if (speedDownInterval) return; // Prevent multiple intervals

    const interval = setInterval(() => {
      setSpeed((currentSpeed) => {
        const newSpeed = currentSpeed - 0.1; // Decrease speed smoothly by 0.1
        if (newSpeed <= 1) {
          clearInterval(interval); // Stop reducing speed once it reaches 1x
          setSpeed(1);
          if (lottieRef.current) {
            lottieRef.current.setSpeed(1); // Ensure Lottie speed is set to 1
          }
          return 1;
        }

        if (lottieRef.current) {
          lottieRef.current.setSpeed(newSpeed); // Update Lottie speed
        }

        return newSpeed;
      });
    }, 100); // Smooth speed down every 100ms

    setSpeedDownInterval(interval);
  };

  const handleTap = () => {
    const currentTime = Date.now();

    if (prevTapTime !== null) {
      const timeDifference = currentTime - prevTapTime; // Time between taps in milliseconds
      let tapSpeed = 1000 / timeDifference; // Taps per second

      // Set minimum and maximum speed limits
      const MIN_SPEED = 0.5;
      const MAX_SPEED = 3;

      // Clamp the tapSpeed within the limits
      tapSpeed = Math.max(MIN_SPEED, Math.min(tapSpeed, MAX_SPEED));

      setSpeed(tapSpeed);

      if (lottieRef.current) {
        lottieRef.current.setSpeed(tapSpeed);
      }
    }

    setPrevTapTime(currentTime);

    // Clear any existing reset timers and speed down intervals
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }
    if (speedDownInterval) {
      clearInterval(speedDownInterval);
      setSpeedDownInterval(null); // Clear the interval once tapping resumes
    }

    // Set a timeout to start smooth speed down after 1 second of inactivity
    const timeout = setTimeout(() => {
      startSpeedDown();
      setPrevTapTime(null); // Reset the previous tap time
    }, 1000); // 1 second of inactivity

    setResetTimeout(timeout);
  };

  // Cleanup the timeout and interval when the component unmounts
  useEffect(() => {
    return () => {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
      if (speedDownInterval) {
        clearInterval(speedDownInterval);
      }
    };
  }, [resetTimeout, speedDownInterval]);

  return (
    <div onClick={handleTap} className='cursor-pointer select-none'>
      <Lottie lottieRef={lottieRef} animationData={groovyRunAnimation} />
      {/* <p className=''>Current Speed: {speed.toFixed(2)}x</p> */}
    </div>
  );
};

export default LottieComponent;
