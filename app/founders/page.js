"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import HomeBanner from "../components/HomeBanner";
import ProductStats from "../components/ProductStats";
import HomeBestsellingProducts from "../components/HomeBestsellingProducts";
import BringingClarity from "../components/BringingClarity";
import PaidCourse from "../components/PaidCourse";
import TestimonialSection from "../components/TestimonialSection";
import AllVideos from "../components/AllVideos";
import ProductCategoryFaq from "../components/ProductCategoryFaq";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import LoadingScreen from "../components/LoadingScreen";

export default function Founders() {
  const [sections, setSections] = useState({});
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections.pre_footer);

  useEffect(() => {
    let isCurrentRequest = true;

    axios
      .get("/api/founder")
      .then(({ data }) => setSections(data?.data || {}))
      .catch((requestError) => {
        if (isCurrentRequest) {
          console.error("Founders fetch error:", requestError);
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
    let isCurrentRequest = true;

    axios
      .get("/api/videos")
      .then(({ data }) => {
        if (isCurrentRequest) setVideos(data?.data || []);
      })
      .catch((requestError) =>
        console.error("All videos fetch error:", requestError)
      );

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

  // Sections are added here one by one as they're built.
  // Hide the section until the CMS has at least one testimonial.
  const testimonials = sections.testimonials_section?.testimonial_data?.length
    ? sections.testimonials_section
    : null;

  const wayfindingSections = [
    {
      id: "founders-hero",
      label: sections.founder_banner?.tagline || "Hero",
    },
    ...(sections.trending_this_week
      ? [{ id: "founders-trending", label: sections.trending_this_week.tagline || "Trending" }]
      : []),
    ...(sections.brand_scales
      ? [{ id: "founders-brand-scales", label: sections.brand_scales.tag || "Why Work With Us" }]
      : []),
    ...(sections.where_to_start
      ? [{ id: "founders-where-to-start", label: sections.where_to_start.tagline || "Start" }]
      : []),
    ...(sections.paid_course
      ? [{ id: "founders-paid-course", label: sections.paid_course.tagline || "Paid Course" }]
      : []),
    ...(testimonials
      ? [{ id: "founders-testimonials", label: testimonials.Tagline || "Testimonials" }]
      : []),
    ...(videos.length
      ? [{ id: "founders-all-videos", label: "All Videos" }]
      : []),
    ...(sections.faq_section
      ? [{ id: "founders-faq", label: sections.faq_section.tagline || "FAQ" }]
      : []),
  ];

  if (error) {
    return <div className="content-page-error">Unable to load the founders page.</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <HomeBanner id="founders-hero" data={sections.founder_banner} />
      <ProductStats id="founders-stats" stats={sections.stats} />
      <HomeBestsellingProducts id="founders-trending" data={sections.trending_this_week} />
      <BringingClarity id="founders-brand-scales" data={sections.brand_scales} />
      <HomeBestsellingProducts id="founders-where-to-start" data={sections.where_to_start} />
      <PaidCourse id="founders-paid-course" data={sections.paid_course} />
      <TestimonialSection
        id="founders-testimonials"
        data={testimonials}
        productVariant
        testimonialTicker
      />
      <AllVideos id="founders-all-videos" videos={videos} />
      <ProductCategoryFaq id="founders-faq" data={sections.faq_section} />
    </>
  );
}
