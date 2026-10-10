"use client";

// components/work-inner/WorkInnerEffects.js
// Small client-only component that carries the browser-dependent logic
// (window/document access) that can't run inside the server component.
// Renders nothing — it's pure side-effects.

import { useEffect } from "react";
import { useSetPreFooter } from "../../context/PreFooterContext";

export default function WorkInnerEffects({ preFooterData }) {
  useSetPreFooter(preFooterData);

  useEffect(() => {
    const isSafeToRefresh = () => window.scrollY < 200;

    const notifyReady = () => {
      if (isSafeToRefresh()) {
        window.dispatchEvent(new Event("app:content-ready"));
      }
    };

    notifyReady();

    const pendingImages = Array.from(document.images).filter(
      (img) => !img.complete
    );

    if (pendingImages.length === 0) return;

    let remaining = pendingImages.length;
    const handleImageSettled = () => {
      remaining -= 1;
      if (remaining === 0) notifyReady();
    };

    pendingImages.forEach((img) => {
      img.addEventListener("load", handleImageSettled, { once: true });
      img.addEventListener("error", handleImageSettled, { once: true });
    });

    return () => {
      pendingImages.forEach((img) => {
        img.removeEventListener("load", handleImageSettled);
        img.removeEventListener("error", handleImageSettled);
      });
    };
  }, []);

  return null;
}