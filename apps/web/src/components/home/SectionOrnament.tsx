/** Decorative rule for section titles — light zellige-inspired corners */
export function SectionOrnament() {
  return (
    <span
      className="mx-auto mt-4 flex h-3 w-32 items-center justify-center gap-2"
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50 dark:to-gold/70" />
      <span className="size-1.5 rotate-45 border border-gold/60 bg-gold/20 dark:border-gold/70 dark:bg-gold/35" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50 dark:to-gold/70" />
    </span>
  );
}
