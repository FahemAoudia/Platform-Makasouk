export default function BrowseCategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 dark:bg-zinc-950">
      <div className="animate-pulse" aria-busy aria-label="Chargement">
        <div className="h-3 w-28 rounded bg-[#4A3F36]/15 dark:bg-cream/10" />
        <div className="mt-5 h-12 max-w-sm rounded bg-[#4A3F36]/10 dark:bg-cream/10" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#C6A75E]/20 bg-[#FCF8F2]/40 dark:border-white/10 dark:bg-zinc-900/50"
            >
              <div className="aspect-[3/4] bg-[#4A3F36]/10 dark:bg-cream/10" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-16 rounded bg-[#4A3F36]/12 dark:bg-cream/10" />
                <div className="h-7 w-3/4 max-w-[200px] rounded bg-[#4A3F36]/10 dark:bg-cream/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
