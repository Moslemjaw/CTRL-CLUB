export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="heading text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-2 break-words text-white/60">{description}</p>}
      </div>
      {children && <div className="flex max-w-full flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
