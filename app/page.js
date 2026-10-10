"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProductHomeBanner from "./components/ProductHomeBanner";
import ProductStats from "./components/ProductStats";
import HomeBestsellingProducts from "./components/HomeBestsellingProducts";
import TestimonialSection from "./components/TestimonialSection";
import PopularCategories from "./components/PopularCategories";
import OurApproach from "./components/OurApproach";
import TickerSection from "./components/TickerSection";
import BrandStrategyProduct from "./components/BrandStrategyProduct";
import SellingBundles from "./components/SellingBundles";
import Initiatives from "./components/company/Initiatives";
import RightSideLine from "./components/RightSideLine";
import Wayfinding from "./components/Wayfinding";
import { useSetPreFooter } from "./context/PreFooterContext";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const [banner, setBanner] = useState(null);
  const [stats, setStats] = useState([]);
  const [bestsellingProducts, setBestsellingProducts] = useState(null);
  const [testimonials, setTestimonials] = useState(null);
  const [popularCategories, setPopularCategories] = useState(null);
  const [expertTools, setExpertTools] = useState(null);
  const [trustedBrands, setTrustedBrands] = useState(null);
  const [brandStrategyProduct, setBrandStrategyProduct] = useState(null);
  const [sellingBundles, setSellingBundles] = useState(null);
  const [aboutSection, setAboutSection] = useState(null);
  const [freeGuide, setFreeGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const freeGuidePreFooter = useMemo(
    () =>
      freeGuide
        ? { ...freeGuide, variant: "newsletter", submit_text: "Get Free Guide" }
        : null,
    [freeGuide]
  );
  useSetPreFooter(freeGuidePreFooter);

  useEffect(() => {
    axios
      .get("/api/products-homepage")
      .then(({ data }) => {
        setBanner(data?.data?.product_home_banner || null);
        setStats(data?.data?.stats || []);
        setBestsellingProducts(data?.data?.bestselling_products || null);
        const testimonialsSection =
          data?.data?.testimonials_section?.testimonials_section ||
          data?.data?.testimonials_section ||
          null;
        setTestimonials(testimonialsSection);
        setPopularCategories(data?.data?.popular_categories || null);
        setExpertTools(data?.data?.expert_tools || null);
        setTrustedBrands(data?.data?.trusted_brands || null);
        setBrandStrategyProduct(data?.data?.brand_strategy_product || null);
        setSellingBundles(data?.data?.selling_bundles || null);
        setAboutSection(data?.data?.about_section || null);
        setFreeGuide(data?.data?.free_guide || null);
      })
      .catch((requestError) => {
        console.error("Product home banner fetch error:", requestError);
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
      { id: "product-home-hero", label: banner?.tagline || "Intro" },
      ...(stats.length ? [{ id: "product-home-stats", label: "Stats" }] : []),
      ...(bestsellingProducts
        ? [{ id: "product-home-bestsellers", label: bestsellingProducts.tagline || "Bestsellers" }]
        : []),
      ...(testimonials
        ? [{ id: "product-home-testimonials", label: testimonials.Tagline || testimonials.tagline || "Testimonials" }]
        : []),
      ...(popularCategories
        ? [{ id: "product-home-categories", label: popularCategories.tagline || "Categories" }]
        : []),
      ...(expertTools
        ? [{ id: "product-home-expert-tools", label: expertTools.tag || "Benefits" }]
        : []),
      ...(trustedBrands
        ? [{ id: "product-home-trusted-brands", label: trustedBrands.tagline || "Trusted Brands" }]
        : []),
      ...(brandStrategyProduct
        ? [{ id: "product-home-featured", label: brandStrategyProduct.tagline || "Featured" }]
        : []),
      ...(sellingBundles
        ? [{ id: "product-home-bundles", label: sellingBundles.tagline || "Bundles" }]
        : []),
      ...(aboutSection
        ? [{ id: "product-home-about", label: aboutSection.tagline || "About Us" }]
        : []),
    ],
    [
      banner,
      stats,
      bestsellingProducts,
      testimonials,
      popularCategories,
      expertTools,
      trustedBrands,
      brandStrategyProduct,
      sellingBundles,
      aboutSection,
    ]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !banner) {
    return <div className="product-home-error">Unable to load the product home banner.</div>;
  }

  return (
    <>
      <Wayfinding sections={wayfindingSections} />
      <RightSideLine id="rightLine" />
      <ProductHomeBanner id="product-home-hero" data={banner} />
      <ProductStats id="product-home-stats" stats={stats} />
      <HomeBestsellingProducts id="product-home-bestsellers" data={bestsellingProducts} />
      <TestimonialSection
        id="product-home-testimonials"
        data={testimonials}
        productVariant
        testimonialTicker
      />
      <PopularCategories id="product-home-categories" data={popularCategories} />
      <OurApproach id="product-home-expert-tools" data={expertTools} />
      <TickerSection id="product-home-trusted-brands" data={trustedBrands} />
      <BrandStrategyProduct id="product-home-featured" data={brandStrategyProduct} />
      <SellingBundles id="product-home-bundles" data={sellingBundles} />
      <Initiatives id="product-home-about" data={aboutSection} />
    </>
  );
}
