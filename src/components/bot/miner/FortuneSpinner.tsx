import { useState, useEffect, useRef } from "react";

type FortuneSpinnerProps = {
  onActivateBooster: (finalResult: number) => void;
  isActive?: boolean;
  isOnCooldown: boolean;
  dictionary: {
    fortune: string;
    spin: string;
    activating: string;
    cooldown: string;
    free: string;
  };
  spinning: boolean;
};

export default function FortuneSpinner({
  onActivateBooster,
  isActive,
  isOnCooldown,
  dictionary,
  spinning,
}: FortuneSpinnerProps) {
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinnerRef = useRef<HTMLDivElement>(null);

  const spinDuration = 5000; // 5 seconds
  const numbers = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  useEffect(() => {
    if (spinning) {
      setResult(null);
      const totalRotation = 1800 + Math.floor(Math.random() * 360);
      setRotation(totalRotation);
    }
  }, [spinning]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (spinning) {
        const finalResult = (Math.random() * 10).toFixed(2); // Random multiplier between 1 and 10, fixed to 2 decimal places
        setResult(Number(finalResult));
        onActivateBooster(Number(finalResult)); // Activate booster once spinning stops
      }
    };

    const spinnerElement = spinnerRef.current;
    if (spinnerElement) {
      spinnerElement.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (spinnerElement) {
        spinnerElement.removeEventListener(
          "transitionend",
          handleTransitionEnd
        );
      }
    };
  }, [spinning, onActivateBooster]);

  useEffect(() => {
    if (spinnerRef.current) {
      spinnerRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [rotation]);

  return (
    <div>
      <div className='relative w-48 h-48 mb-4 sm:w-40 sm:h-40'>
        <div
          ref={spinnerRef}
          className='absolute w-full h-full rounded-full border-4 border-primary transition-transform duration-[5000ms] ease-in-out'
        >
          {numbers.map((number, index) => (
            <div
              key={number}
              className='absolute w-6 h-6 sm:w-5 sm:h-5 -mt-3 -ml-3 flex items-center justify-center text-sm sm:text-xs'
              style={{
                left: "50%",
                top: "50%",
                transform: `rotate(${
                  index * 32.7
                }deg) translateY(-90px) rotate(-${index * 32.7}deg)`,
              }}
            >
              {number}
            </div>
          ))}
        </div>

        {/* Display result in the middle */}
        {result !== null && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-4xl font-bold sm:text-3xl'>{result}</span>
          </div>
        )}

        {/* Pointer on top */}
        <div className='absolute top-0 left-1/2 -ml-3 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-primary' />
      </div>
    </div>
  );
}
