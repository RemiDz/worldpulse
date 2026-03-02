"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="flex flex-col items-center gap-3 pb-10 pt-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="h-px w-16"
        style={{ background: "linear-gradient(90deg, transparent, var(--border-subtle), transparent)" }}
      />
      <p
        className="text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        Part of Harmonic Waves
      </p>
      <a
        href="https://harmonicwaves.app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
        style={{ color: "var(--accent-brand)" }}
      >
        Explore the ecosystem
        <ExternalLink size={10} />
      </a>
    </motion.footer>
  );
}
