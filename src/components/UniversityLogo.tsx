"use client";
import { useState } from "react";
import assets from "@/lib/university-assets.json";

export function UniversityLogo({
  id,
  name,
  logoPath,
  size = "medium",
}: {
  id?: number;
  name: string;
  logoPath?: string | null;
  size?: "small" | "medium" | "large";
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const path =
    logoPath ?? assets.find((university) => university.id === id)?.logoPath;
  const clean = path?.replace(/^\/?static\//, "").replace(/^\//, "");
  const src =
    clean?.startsWith("university/logos/") && !clean.includes("..")
      ? `/${clean}`
      : null;
  return (
    <span className={`university-logo logo-${size}`}>
      {src && failed !== src ? (
        <img
          src={src}
          alt={`${name} 로고`}
          width={64}
          height={64}
          loading="lazy"
          onError={() => setFailed(src)}
        />
      ) : (
        <span className="logo-fallback" aria-label={`${name} 로고 미등록`}>
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
