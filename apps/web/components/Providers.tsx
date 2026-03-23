"use client";

import { useEffect } from "react";

import { useAuthStore } from "../store/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  /** Hide Next.js 16+ floating dev chrome (“1 Issue”, N logo) even when inside shadow DOM. */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const selectors =
      "nextjs-portal, [data-nextjs-dev-tools-button], [data-issues], [data-nextjs-toast]";

    const hideInRoot = (root: Document | ShadowRoot) => {
      root.querySelectorAll(selectors).forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      });
      root.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) hideInRoot(el.shadowRoot);
      });
    };

    const hide = () => {
      hideInRoot(document);
    };

    hide();
    const mo = new MutationObserver(hide);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    const id = window.setInterval(hide, 1500);
    return () => {
      mo.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return children;
}
