export default function DashboardLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="h-16 border-b border-[var(--border)]" />

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-10">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton mt-4 h-9 w-80 max-w-full" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />

        <div className="skeleton mt-10 h-[6.5rem] rounded-2xl" />

        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-9 w-56" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
