export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-card rounded-xl p-8 shadow-md border border-border">
        {children}
      </div>
    </div>
  );
}
