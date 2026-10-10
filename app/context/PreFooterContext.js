"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const PreFooterContext = createContext(null);

// Wraps {children} + <Footer/> in layout.js. Lets each page hand its own
// `pre_footer` API data (fetched as part of that page's own payload) up to
// the single global Footer component, without prop-drilling through
// layout.js (which never sees per-page data) or splitting Footer into two
// physically separate components (which would break the shared watermark
// background — see chat history).
export function PreFooterProvider({ children }) {
  const [preFooter, setPreFooter] = useState(null);
  const value = { preFooter, setPreFooter };
  return (
    <PreFooterContext.Provider value={value}>
      {children}
    </PreFooterContext.Provider>
  );
}

export function usePreFooterContext() {
  const ctx = useContext(PreFooterContext);
  if (!ctx) {
    throw new Error("usePreFooterContext must be used within a PreFooterProvider");
  }
  return ctx;
}

// Call this from each page once its own `pre_footer` data has loaded:
//   useSetPreFooter(sections?.pre_footer);
// Clears back to null on unmount so navigating to a page that has no
// pre_footer content doesn't keep showing the previous page's data.
export function useSetPreFooter(data) {
  const { setPreFooter } = usePreFooterContext();

  useEffect(() => {
    if (data) setPreFooter(data);
  }, [data, setPreFooter]);

  useEffect(() => {
    return () => setPreFooter(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
