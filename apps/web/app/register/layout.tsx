/**
 * Full-viewport register so the split-screen design isn’t clipped by the main app shell.
 */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0d0d0d]">{children}</div>
  );
}
