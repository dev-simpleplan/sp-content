"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomeBanner from "./components/HomeBanner";
import VideoAnimated from "./components/VideoAnimated";
import ProductStats from "./components/ProductStats";
import HomeBestsellingProducts from "./components/HomeBestsellingProducts";
import BringingClarity from "./components/BringingClarity";
import PaidCourse from "./components/PaidCourse";
import TestimonialSection from "./components/TestimonialSection";
import OurApproach from "./components/OurApproach";
import Initiatives from "./components/company/Initiatives";
import RightSideLine from "./components/RightSideLine";
import Wayfinding from "./components/Wayfinding";
import { useSetPreFooter } from "./context/PreFooterContext";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const [banner, setBanner] = useState(null);
  const [video, setVideo] = useState(null);
  const [stats, setStats] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [growFaster, setGrowFaster] = useState(null);
  const [mostPopular, setMostPopular] = useState(null);
  const [paidCourse, setPaidCourse] = useState(null);
  const [testimonials, setTestimonials] = useState(null);
  const [peopleTrustUs, setPeopleTrustUs] = useState(null);
  const [digitalProducts, setDigitalProducts] = useState(null);
  const [learnAbout, setLearnAbout] = useState(null);
  const [preFooter, setPreFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(preFooter);

  useEffect(() => {
    axios
      .get("/api/products-homepage")
      .then(({ data }) => {
        setBanner(data?.data?.content_home_banner || null);
        setVideo(data?.data?.video_section || null);
        setStats(data?.data?.stats || []);
        setLearningPath(data?.data?.learning_path || null);
        setGrowFaster(data?.data?.grow_faster || null);
        setMostPopular(data?.data?.most_popular || null);
        setPaidCourse(data?.data?.paid_course || null);
        setTestimonials(data?.data?.testimonials_section || null);
        setPeopleTrustUs(data?.data?.people_trust_us || null);
        setDigitalProducts(data?.data?.our_digital_products || null);
        setLearnAbout(data?.data?.learn_about || null);
        setPreFooter(data?.data?.pre_footer || null);
      })
      .catch((requestError) => {
        console.error("Content home fetch error:", requestError);
        setError(requestError);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("app:content-ready"));
    });

    return () => cancelAnimationFrame(frame);
  }, [loading]);

  const wayfindingSections = useMemo(
    () => [
      { id: "content-home-hero", label: banner?.tagline || "Intro" },
      ...(stats.length ? [{ id: "content-home-stats", label: "Stats" }] : []),
      ...(learningPath
        ? [{ id: "content-home-learning-path", label: learningPath.tagline || "Learning Path" }]
        : []),
      ...(growFaster
        ? [{ id: "content-home-grow-faster", label: growFaster.tag || "Who is it for" }]
        : []),
      ...(mostPopular
        ? [{ id: "content-home-most-popular", label: mostPopular.tagline || "Popular" }]
        : []),
      ...(testimonials
        ? [{ id: "content-home-testimonials", label: testimonials.Tagline || testimonials.tagline || "Testimonials" }]
        : []),
      ...(paidCourse
        ? [{ id: "content-home-paid-course", label: paidCourse.tagline || "Paid Course" }]
        : []),
      ...(peopleTrustUs
        ? [{ id: "content-home-people-trust-us", label: peopleTrustUs.tag || "Benefits" }]
        : []),
      ...(digitalProducts
        ? [{ id: "content-home-digital-products", label: digitalProducts.tagline || "Tools" }]
        : []),
      ...(learnAbout
        ? [{ id: "content-home-learn-about", label: learnAbout.tagline || "About" }]
        : []),
    ],
    [
      banner,
      stats,
      learningPath,
      growFaster,
      mostPopular,
      paidCourse,
      testimonials,
      peopleTrustUs,
      digitalProducts,
      learnAbout,
    ]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !banner) {
    return <div className="content-home-error">Unable to load the home page content.</div>;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <HomeBanner id="content-home-hero" data={banner} />
      <VideoAnimated id="content-home-video" data={video} />
      <ProductStats id="content-home-stats" stats={stats} />
      <HomeBestsellingProducts id="content-home-learning-path" data={learningPath} />
      <BringingClarity id="content-home-grow-faster" data={growFaster} />
      <HomeBestsellingProducts id="content-home-most-popular" data={mostPopular} />
      <TestimonialSection
        id="content-home-testimonials"
        data={testimonials}
        productVariant
        testimonialTicker
      />
      <PaidCourse id="content-home-paid-course" data={paidCourse} />
      <OurApproach id="content-home-people-trust-us" data={peopleTrustUs} />
      <Initiatives id="content-home-digital-products" data={digitalProducts} />
      <Initiatives id="content-home-learn-about" data={learnAbout} alignContentStart />
    </>
  );
}
