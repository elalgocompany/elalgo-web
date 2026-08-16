import {
  Crown,
  Cpu,
  LineChart,
  Bot,
} from "lucide-react";

type BadgeType =
  | "premium"
  | "free"
  | "expert-advisor"
  | "indicator"
  | "assistant";

interface BadgeProps {
  type: BadgeType;
}

export default function Badge({ type }: BadgeProps) {
  const badgeStyles = {
    premium: {
      label: "Premium",
      className:
        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    },

    free: {
      label: "Free",
      className:
        "bg-green-500/20 text-green-400 border border-green-500/30",
    },

    "expert-advisor": {
      label: "Expert Advisor",
      className:
        "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-pointer ",
    },

    indicator: {
      label: "Indicator",
      className:
        "bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-pointer ",
    },

    assistant: {
      label: "Trade Assistant",
      className:
        "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 cursor-pointer ",
    },
  };

  const badge = badgeStyles[type];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}