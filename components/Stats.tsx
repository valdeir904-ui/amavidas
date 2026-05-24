"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeIn } from "@/lib/animations";

const stats = [
  { value: 5000, suffix: "+", label: "Famílias protegidas", prefix: "" },
  { value: 4.9, suffix: "⭐", label: "Avaliação no Google", prefix: "", isDecimal: true },
  { value: 0, suffix: "", label: "Reclamações no ReclameAqui", prefix: "Zero", noCount: true },
  { value: 24, suffix: "h", label: "Atendimento emergências", prefix: "" },
];

function Counter({ target, suffix, prefix, isDecimal, noCount }: {
  target: number; suffix: string; prefix?: string; isDecimal?: boolean; noCount?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || noCount) return;
    const duration = 1600;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target, isDecimal, noCount]);

  if (noCount) {
    return <span ref={ref}>{prefix}</span>;
  }

  return (
    <span ref={ref}>
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

export default function Stats() {
  return (
    <section className="brand-gradient py-12">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeIn} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                <Counter
                  target={s.value}
                  suffix={s.suffix}
                  prefix={s.prefix}
                  isDecimal={(s as { isDecimal?: boolean }).isDecimal}
                  noCount={(s as { noCount?: boolean }).noCount}
                />
              </p>
              <p className="text-white/70 text-xs md:text-sm leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
