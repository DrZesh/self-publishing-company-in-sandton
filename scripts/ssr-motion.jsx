import React from 'react';
export { useScroll, useTransform, useMotionValue, useSpring } from '../node_modules/framer-motion/dist/es/index.mjs';
const cache = new Map();
export const motion = new Proxy({}, { get(_, tag) {
  if (!cache.has(tag)) cache.set(tag, React.forwardRef(function StaticMotion(props, ref) {
    const { initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, whileFocus, whileDrag, viewport, layout, layoutId, ...rest } = props;
    return React.createElement(tag, { ...rest, ref });
  }));
  return cache.get(tag);
}});
export function AnimatePresence({children}) { return children; }
