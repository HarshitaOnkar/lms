/**
 * Full-viewport login so the split-screen design isn’t clipped by the main app shell.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0d0d0d]">{children}</div>
  );
}
