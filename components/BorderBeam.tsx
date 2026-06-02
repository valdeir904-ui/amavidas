"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BorderBeamProps {
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  reverse?: boolean;
}

export const BorderBeam = ({
  duration = 5,
  borderWidth = 2,
  colorFrom = "#00C6FF",
  colorTo = "#0072FF",
  reverse = false,
}: BorderBeamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const rx = 24; // Raio dos cantos (border-radius: 24px)
  const ry = 24;
  const w = dimensions.width;
  const h = dimensions.height;

  // Gerar o path exato do retângulo arredondado (Rounded Rect)
  const path = `M ${rx} 0 
                L ${w - rx} 0 
                A ${rx} ${ry} 0 0 1 ${w} ${ry} 
                L ${w} ${h - ry} 
                A ${rx} ${ry} 0 0 1 ${w - rx} ${h} 
                L ${rx} ${h} 
                A ${rx} ${ry} 0 0 1 0 ${h - ry} 
                L 0 ${ry} 
                A ${rx} ${ry} 0 0 1 ${rx} 0 Z`;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[1] rounded-[24px]"
      style={{ margin: `-${borderWidth / 2}px` }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* O feixe de luz que corre pelo caminho exato do card */}
          <motion.path
            d={path}
            stroke={`url(#border-beam-grad-${colorFrom.replace("#", "")})`}
            strokeWidth={borderWidth}
            strokeLinecap="round"
            strokeDasharray="140 300"
            animate={{
              strokeDashoffset: reverse ? [0, 440 + w * 2 + h * 2] : [440 + w * 2 + h * 2, 0],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: duration,
            }}
          />

          <defs>
            <linearGradient
              id={`border-beam-grad-${colorFrom.replace("#", "")}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={colorFrom} stopOpacity={1} />
              <stop offset="60%" stopColor={colorTo} stopOpacity={0.8} />
              <stop offset="100%" stopColor="transparent" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};
