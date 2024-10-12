"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Sector = {
  color: string;
  label: string;
};

const sectors: Sector[] = [
  { color: "#f44336", label: "100" },
  { color: "#e91e63", label: "200" },
  { color: "#9c27b0", label: "300" },
  { color: "#673ab7", label: "400" },
  { color: "#3f51b5", label: "500" },
  { color: "#2196f3", label: "600" },
  { color: "#03a9f4", label: "700" },
  { color: "#00bcd4", label: "800" },
];

export function WheelOfFortune({
  onSpin,
}: {
  onSpin: (result: string) => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<SVGGElement>(null);
  const spinTimeRef = useRef<number>(0);
  const spinAngleStartRef = useRef<number>(0);
  const spinAngleRef = useRef<number>(0);
  const spinTimeout = useRef<number | null>(null);

  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;
  const anglePerSector = (Math.PI * 2) / sectors.length;

  useEffect(() => {
    return () => {
      if (spinTimeout.current !== null) {
        clearTimeout(spinTimeout.current);
      }
    };
  }, []);

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const stopRotateWheel = () => {
    if (spinTimeout.current !== null) {
      clearTimeout(spinTimeout.current);
    }
    const degrees =
      spinAngleRef.current - Math.floor(spinAngleRef.current / 360) * 360;
    const arcd = 360 / sectors.length;
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    onSpin(sectors[index].label);
    setSpinning(false);
  };

  const rotateWheel = () => {
    spinTimeRef.current += 30;
    if (spinTimeRef.current >= 4000) {
      stopRotateWheel();
      return;
    }
    const spinAngle =
      spinAngleStartRef.current -
      easeOut(spinTimeRef.current, 0, spinAngleStartRef.current, 4000);
    spinAngleRef.current = spinAngle;
    if (wheelRef.current) {
      wheelRef.current.setAttribute("transform", `rotate(${spinAngle})`);
    }
    spinTimeout.current = window.setTimeout(rotateWheel, 30);
  };

  const spin = () => {
    setSpinning(true);
    spinAngleStartRef.current = Math.random() * 10 + 10;
    spinTimeRef.current = 0;
    spinAngleRef.current = 0;
    rotateWheel();
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <svg width={size} height={size} className='mx-auto'>
        <g ref={wheelRef} transform={`translate(${center},${center})`}>
          {sectors.map((sector, i) => {
            const angle = i * anglePerSector;
            return (
              <g key={i}>
                <path
                  d={`M${radius * Math.cos(angle)},${
                    radius * Math.sin(angle)
                  } A${radius},${radius} 0 0,1 ${
                    radius * Math.cos(angle + anglePerSector)
                  },${radius * Math.sin(angle + anglePerSector)} L0,0 Z`}
                  fill={sector.color}
                />
                <text
                  x={(radius - 20) * Math.cos(angle + anglePerSector / 2)}
                  y={(radius - 20) * Math.sin(angle + anglePerSector / 2)}
                  fill='white'
                  fontSize='10'
                  textAnchor='middle'
                  dominantBaseline='middle'
                  transform={`rotate(${(i * 360) / sectors.length + 90})`}
                >
                  {sector.label}
                </text>
              </g>
            );
          })}
        </g>
        <circle cx={center} cy={center} r={5} fill='white' />
        <path
          d={`M${center},${center - 20} L${center - 5},${center - 5} L${
            center + 5
          },${center - 5} Z`}
          fill='black'
        />
      </svg>
      <Button onClick={spin} disabled={spinning} className='w-full'>
        {spinning ? "Spinning..." : "Spin"}
      </Button>
    </div>
  );
}
