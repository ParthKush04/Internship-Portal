export default function PageSkeleton({ rows = 4 }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse">
      <div className="h-8 w-56 rounded bg-slate-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
            <div className="mt-6 h-10 w-full rounded bg-slate-200" />
            <div className="mt-3 h-10 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}