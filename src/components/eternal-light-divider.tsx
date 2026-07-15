/**
 * Eternal Light divider — a thin gold flame/light line used sparingly
 * (max 3 times per page) referencing "let perpetual light shine upon her."
 *
 * Pure CSS — no JS, no animation, no images. Honors prefers-reduced-motion.
 */
export function EternalLightDivider({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`eternal-light ${className}`}
      role="separator"
      aria-label={label ?? "Eternal light divider"}
      aria-hidden={label ? undefined : true}
    >
      <span className="eternal-light__flame" aria-hidden="true" />
    </div>
  );
}
