"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  isDecimal?: boolean;
  noCount?: boolean;
  duration?: number;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  isDecimal = false,
  noCount = false,
  duration = 1500,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView || noCount) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [inView, target, isDecimal, noCount, duration]);

  if (noCount) {
    return <span ref={ref}>{prefix}</span>;
  }

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {target >= 1000
        ? count.toLocaleString("pt-BR")
        : isDecimal
        ? count.toFixed(1)
        : count}
      {suffix}
    </span>
  );
}
