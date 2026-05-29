// src/components/BadgeRenderer.tsx
"use client";
import type { RankDefinition, SubTier } from "../types";
import { RANK_DEFINITIONS, SUB_TIER_LABELS } from "../lib/rankEngine";

interface BadgeRendererProps {
  level: number;
  subTier?: SubTier;
  size?: "sm" | "md" | "lg";
}

export function BadgeRenderer({ level, subTier, size = "md" }: BadgeRendererProps) {
  const rank = RANK_DEFINITIONS[level - 1];
  const isSupreme = level >= 10 && subTier;
  const label = isSupreme ? SUB_TIER_LABELS[subTier!] : null;

  const sizeMap = { sm: 48, md: 72, lg: 108 };
  const px = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <BadgeSVG rank={rank} subTier={subTier} px={px} />
      <span
        className="font-display text-center"
        style={{
          color: label?.color ?? rank.color,
          fontSize: size === "sm" ? "0.7rem" : size === "md" ? "0.85rem" : "1rem",
          textShadow: `0 0 12px ${rank.glowColor}44`,
        }}
      >
        {label?.title ?? rank.title}
      </span>
    </div>
  );
}

function BadgeSVG({
  rank,
  subTier,
  px,
}: {
  rank: RankDefinition;
  subTier?: SubTier;
  px: number;
}) {
  const variant = rank.badgeVariant;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      aria-label={`Badge: ${rank.title}`}
      style={{
        filter: `drop-shadow(0 0 ${px / 8}px ${rank.glowColor}66)`,
        animation: rank.level >= 8 ? "badgeGlow 2s ease-in-out infinite" : undefined,
      }}
    >
      {variant === "basic" && <BasicBadge color={rank.color} level={rank.level} />}
      {variant === "mid" && <MidBadge color={rank.color} level={rank.level} />}
      {variant === "advanced" && <AdvancedBadge color={rank.color} level={rank.level} />}
      {variant === "elite" && <EliteBadge color={rank.color} level={rank.level} />}
      {variant === "supreme" && (
        <SupremeBadge
          color={rank.color}
          glowColor={rank.glowColor}
          subTier={subTier}
        />
      )}
    </svg>
  );
}

const BasicBadge = ({ color, level }: { color: string; level: number }) => (
  <>
    <circle cx="50" cy="50" r="42" fill={color + "22"} stroke={color} strokeWidth="2" />
    <circle cx="50" cy="50" r="30" fill={color + "33"} />
    <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>
      {level}
    </text>
  </>
);

const MidBadge = ({ color, level }: { color: string; level: number }) => (
  <>
    <polygon
      points="50,8 93,30 93,70 50,92 7,70 7,30"
      fill={color + "22"}
      stroke={color}
      strokeWidth="2"
    />
    <polygon
      points="50,18 83,36 83,64 50,82 17,64 17,36"
      fill={color + "11"}
    />
    <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>
      {level}
    </text>
  </>
);

const AdvancedBadge = ({ color, level }: { color: string; level: number }) => (
  <>
    <polygon
      points="50,4 61,35 95,35 67,57 78,90 50,68 22,90 33,57 5,35 39,35"
      fill={color + "22"}
      stroke={color}
      strokeWidth="2"
    />
    <text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
      {level}
    </text>
  </>
);

const EliteBadge = ({ color, level }: { color: string; level: number }) => (
  <>
    <polygon
      points="50,2 63,38 99,38 70,60 81,96 50,74 19,96 30,60 1,38 37,38"
      fill={color + "33"}
      stroke={color}
      strokeWidth="2.5"
    />
    {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => (
      <circle
        key={i}
        cx={50 + 46 * Math.cos(((deg - 90) * Math.PI) / 180)}
        cy={50 + 46 * Math.sin(((deg - 90) * Math.PI) / 180)}
        r="2.5"
        fill={color}
        opacity={i % 2 === 0 ? 1 : 0.5}
      />
    ))}
    <text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
      {level}
    </text>
  </>
);

const SupremeBadge = ({
  color,
  glowColor,
  subTier,
}: {
  color: string;
  glowColor: string;
  subTier?: SubTier;
}) => {
  const orbCount = subTier === "kamatayan" ? 12 : subTier === "kadakilaan" ? 8 : 6;
  return (
    <>
      <defs>
        <radialGradient id="supreme-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#supreme-core)" stroke={glowColor} strokeWidth="1.5" />
      {Array.from({ length: orbCount }).map((_, i) => {
        const angle = (i / orbCount) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={i}
            cx={50 + 44 * Math.cos(angle)}
            cy={50 + 44 * Math.sin(angle)}
            r="3.5"
            fill={glowColor}
            opacity={0.7 + (i % 3) * 0.1}
          />
        );
      })}
      <text x="50" y="44" textAnchor="middle" fontSize="10" fontWeight="bold" fill={glowColor}>
        DIWA
      </text>
      <text x="50" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill={glowColor}>
        SUPREMO
      </text>
    </>
  );
};
