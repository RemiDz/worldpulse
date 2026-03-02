"use client";

import { ExternalLink } from "lucide-react";
import type { AppLink as AppLinkType } from "@/types";

interface AppLinkProps {
  app: AppLinkType;
}

export default function AppLinkButton({ app }: AppLinkProps) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card flex items-center justify-between p-3.5 transition-all hover:scale-[1.01]"
      style={{ borderRadius: 12 }}
    >
      <div>
        <p
          className="text-[13px] font-semibold"
          style={{ color: "var(--accent-brand)" }}
        >
          {app.name}
        </p>
        <p
          className="mt-0.5 text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {app.description}
        </p>
      </div>
      <ExternalLink
        size={14}
        style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
      />
    </a>
  );
}
