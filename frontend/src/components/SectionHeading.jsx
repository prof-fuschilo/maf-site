import { motion } from "framer-motion";

export function SectionHeading({ kicker, title, em, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14 max-w-3xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-emerald-500" />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400">{kicker}</span>
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">
        {title} <em className="italic text-emerald-400">{em}</em>
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-slate-400">{sub}</p>}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
