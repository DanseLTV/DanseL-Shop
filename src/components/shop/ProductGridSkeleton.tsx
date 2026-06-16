export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card flex min-w-0 flex-col overflow-hidden rounded-xl animate-pulse sm:rounded-2xl"
        >
          <div className="h-32 bg-white/5 sm:h-[9rem] md:h-40 lg:h-[11rem]" />
          <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-2.5 md:p-3">
            <div className="h-2 w-10 rounded bg-white/10 sm:w-12" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="flex gap-1">
              <div className="h-4 w-10 rounded-full bg-white/10" />
              <div className="h-4 w-12 rounded-full bg-white/5" />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-1.5 sm:pt-2">
              <div className="h-4 w-10 rounded bg-white/10 sm:h-5 sm:w-12" />
              <div className="flex gap-1">
                <div className="h-6 w-10 rounded-lg bg-white/10" />
                <div className="h-6 w-10 rounded-lg bg-white/10" />
                <div className="h-6 w-10 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
