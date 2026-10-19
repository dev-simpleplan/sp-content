"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import HomeBanner from "../components/HomeBanner";
import VideoAnimated from "../components/VideoAnimated";
import DualTickerSection from "../components/DualTickerSection";
import ApproachBranding from "../components/service/ApproachBranding";
import OurApproach from "../components/OurApproach";
import ProductCategoryFaq from "../components/ProductCategoryFaq";
import Instructor from "../components/Instructor";
import UseCase from "../components/UseCase";
import TestimonialSection from "../components/TestimonialSection";
import CourseOffer from "../components/CourseOffer";
import StickyCourseBar from "../components/StickyCourseBar";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import LoadingScreen from "../components/LoadingScreen";

export default function PaidCourse() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections.pre_footer);

  useEffect(() => {
    let isCurrentRequest = true;

    axios
      .get("/api/paid-course")
      .then(({ data }) => setSections(data?.data || {}))
      .catch((requestError) => {
        if (isCurrentRequest) {
          console.error("Paid Course fetch error:", requestError);
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

  // Sections are added here one by one as they're built.
  // Hide the section until the CMS has at least one testimonial.
  const testimonials = sections.testimonials_section?.testimonial_data?.length
    ? sections.testimonials_section
    : null;

  const wayfindingSections = [
    {
      id: "paid-course-hero",
      label: sections.paid_course_banner?.tagline || "Intro",
    },
    ...(sections.video_section
      ? [{ id: "paid-course-video", label: "Video" }]
      : []),
    ...(sections.built_by_founders
      ? [{ id: "paid-course-founders-brands", label: sections.built_by_founders.tagline || "Brands" }]
      : []),
    ...(sections.nobody_understand
      ? [{ id: "paid-course-problem", label: sections.nobody_understand.tagline || "Problem" }]
      : []),
    ...(sections.brand_has_been_missing
      ? [{ id: "paid-course-solution", label: sections.brand_has_been_missing.tagline || "Solution" }]
      : []),
    ...(sections.learn_and_build
      ? [{ id: "paid-course-learn-build", label: sections.learn_and_build.tag || "Benefits" }]
      : []),
    ...(sections.brand_builder
      ? [{ id: "paid-course-framework", label: sections.brand_builder.tagline || "Content" }]
      : []),
    ...(sections.your_instructor
      ? [{ id: "paid-course-instructor", label: sections.your_instructor.tagline || "Mentor" }]
      : []),
    ...(sections.shark_tank_funded_brand
      ? [{ id: "paid-course-use-case", label: sections.shark_tank_funded_brand.tagline || "Use Case" }]
      : []),
    ...(testimonials
      ? [{ id: "paid-course-testimonials", label: testimonials.Tagline || "Testimonials" }]
      : []),
    ...(sections.brand_positioning_course
      ? [{ id: "paid-course-offer", label: "Course" }]
      : []),
    ...(sections.faq_section
      ? [{ id: "paid-course-faq", label: sections.faq_section.tagline || "FAQ" }]
      : []),
  ];

  if (error) {
    return <div className="content-page-error">Unable to load the paid course page.</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <HomeBanner id="paid-course-hero" data={sections.paid_course_banner} />
      <VideoAnimated id="paid-course-video" data={sections.video_section} />
      <DualTickerSection id="paid-course-founders-brands" data={sections.built_by_founders} />
      <ApproachBranding id="paid-course-problem" data={sections.nobody_understand} />
      <ApproachBranding
        id="paid-course-solution"
        data={sections.brand_has_been_missing}
        richDescription
      />
      <OurApproach id="paid-course-learn-build" data={sections.learn_and_build} />
      <ProductCategoryFaq id="paid-course-framework" data={sections.brand_builder} arrowIcon />
      <Instructor id="paid-course-instructor" data={sections.your_instructor} />
      <UseCase id="paid-course-use-case" data={sections.shark_tank_funded_brand} />
      <TestimonialSection
        id="paid-course-testimonials"
        data={testimonials}
        productVariant
        testimonialTicker
      />
      <CourseOffer id="paid-course-offer" data={sections.brand_positioning_course} />
      <ProductCategoryFaq id="paid-course-faq" data={sections.faq_section} />
      <StickyCourseBar
        data={sections.sticky_course_bar}
        heroId="paid-course-hero"
        hideWhileVisibleIds={["paid-course-video", "paid-course-offer"]}
      />
    </>
  );
}
