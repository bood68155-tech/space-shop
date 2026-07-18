"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  blur?: string;
}

const fadeVariants: Variants = {
  hidden: (props: Omit<FadeInProps, "children">) => ({
    opacity: 0,
    y: props.y ?? 30,
    x: props.x ?? 0,
    scale: props.scale ?? 1,
    filter: `blur(${props.blur ?? "8px"})`,
  }),
  visible: (props: Omit<FadeInProps, "children">) => ({
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: props.duration ?? 0.7,
      delay: props.delay ?? 0,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.7,
  y = 30,
  x = 0,
  scale = 1,
  blur = "8px",
}: FadeInProps) {
  return (
    <motion.div
      custom={{ delay, duration, y, x, scale, blur }}
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
