"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CompanyBanner from "../components/CompanyBanner";
import HowWeDoIt from "../components/company/HowWeDoIt";
import ApproachBranding from "../components/service/ApproachBranding";
import WhatWeDeliver from "../components/ServiceInner/WhatWeDeliver";
import ProductStats from "../components/ProductStats";
import TickerSection from "../components/TickerSection";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import {
  ProductBrands,
  ProductDeliverables,
  ProductFeature,
  ProductIntro,
} from "../components/product/ProductAboutSections";
import LoadingScreen from "../components/LoadingScreen";

export default function ProductAbout() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections.pre_footer);

  useEffect(() => {
    let isCurrentRequest = true;

    axios
      .get("/api/product-about-us")
      .then(({ data }) => setSections(data?.data || {}))
      .catch((requestError) => {
        if (isCurrentRequest) {
          console.error("Product About Us fetch error:", requestError);
          setError(requestError);
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    let pendingImages = [];
    let handleImageSettled;

    const notifyContentReady = () => {
      window.dispatchEvent(new Event("app:content-ready"));
    };

    const frame = requestAnimationFrame(() => {
      notifyContentReady();

      pendingImages = Array.from(document.images).filter(
        (image) => !image.complete
      );

      if (!pendingImages.length) return;

      let remaining = pendingImages.length;
      handleImageSettled = () => {
        remaining -= 1;
        if (remaining === 0) notifyContentReady();
      };

      pendingImages.forEach((image) => {
        image.addEventListener("load", handleImageSettled, { once: true });
        image.addEventListener("error", handleImageSettled, { once: true });
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      if (handleImageSettled) {
        pendingImages.forEach((image) => {
          image.removeEventListener("load", handleImageSettled);
          image.removeEventListener("error", handleImageSettled);
        });
      }
    };
  }, [loading]);

  const wayfindingSections = [
    { id: "product-about-hero", label: "About" },
    { id: "product-about-intro", label: sections.about_product?.tagline || "Story" },
    ...(sections.about_product?.stats?.length
      ? [{ id: "product-about-stats", label: "Stats" }]
      : []),
    { id: "product-about-standards", label: sections.how_created_products?.tagline || "Standards" },
    { id: "product-about-deliverables", label: sections.our_products_cover?.tagline || "Deliverables" },
    { id: "product-about-feature", label: sections.build_real_products?.tagline || "Featured" },
    { id: "product-about-brands", label: sections.trusted_brands?.tagline || "Benefits" },
  ];

  if (error) {
    return <div className="product-page-error">Unable to load the product About Us page.</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <CompanyBanner id="product-about-hero" data={sections.product_about_banner} loading={loading} />
      <ApproachBranding id="product-about-intro" data={sections.about_product} />
      <ProductStats
        id="product-about-stats"
        stats={sections.about_product?.stats}
      />
      <HowWeDoIt id="product-about-standards" data={sections.how_created_products} />
      <WhatWeDeliver id="product-about-deliverables" data={sections.our_products_cover} />
      <ProductFeature id="product-about-feature" data={sections.build_real_products} />
      <TickerSection id="product-home-trusted-brands" data={sections.trusted_brands} />
    </>
  );
}
