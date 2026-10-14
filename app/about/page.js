"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import HomeBanner from "../components/HomeBanner";
import ProductStats from "../components/ProductStats";
import ApproachBranding from "../components/service/ApproachBranding";
import Founders from "../components/company/Founders";
import WeAreProud from "../components/WeAreProud";
import ReadyToBuild from "../components/ReadyToBuid";
import OurApproach from "../components/OurApproach";
import Initiatives from "../components/company/Initiatives";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import LoadingScreen from "../components/LoadingScreen";

export default function ContentAbout() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections.pre_footer);

  useEffect(() => {
    let isCurrentRequest = true;

    axios
      .get("/api/content-about-us")
      .then(({ data }) => setSections(data?.data || {}))
      .catch((requestError) => {
        if (isCurrentRequest) {
          console.error("Content About Us fetch error:", requestError);
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

  // document_series wraps a single item in `tools`; Initiatives reads the
  // video as `videourl`, the CMS calls it `video_link` here.
  const docSeriesTool = sections.document_series?.tools?.[0];
  const documentSeries = docSeriesTool
    ? { ...docSeriesTool, videourl: docSeriesTool.video_link }
    : null;

  const wayfindingSections = [
    {
      id: "content-about-hero",
      label: sections.content_about_banner?.tagline || "About",
    },
    ...(sections.stats?.length
      ? [{ id: "content-about-stats", label: "Stats" }]
      : []),
    ...(sections.agency_secrets
      ? [{ id: "content-about-agency-secrets", label: sections.agency_secrets.tagline || "Why We Started" }]
      : []),
    ...(sections.people_behind_content
      ? [{ id: "content-about-people", label: sections.people_behind_content.tagline || "The People" }]
      : []),
    ...(sections.transformation
      ? [{ id: "content-about-transformation", label: sections.transformation.tagline || "Transformation" }]
      : []),
    ...(sections.building_your_brand
      ? [{ id: "content-about-building-brand", label: sections.building_your_brand.tagline || "Get Started" }]
      : []),
    ...(sections.learn_and_build
      ? [{ id: "content-about-learn-build", label: sections.learn_and_build.tag || "Benefits" }]
      : []),
    ...(documentSeries
      ? [{ id: "content-about-document-series", label: sections.document_series.tagline || "Docu-Series" }]
      : []),
  ];

  if (error) {
    return <div className="content-page-error">Unable to load the About Us page.</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <HomeBanner id="content-about-hero" data={sections.content_about_banner} />
      <ProductStats id="content-about-stats" stats={sections.stats} />
      <ApproachBranding id="content-about-agency-secrets" data={sections.agency_secrets} />
      <Founders id="content-about-people" data={sections.people_behind_content} />
      <WeAreProud id="content-about-transformation" data={sections.transformation} />
      <ReadyToBuild id="content-about-building-brand" data={sections.building_your_brand} />
      <OurApproach id="content-about-learn-build" data={sections.learn_and_build} />
      <Initiatives id="content-about-document-series" data={documentSeries} />
    </>
  );
}
