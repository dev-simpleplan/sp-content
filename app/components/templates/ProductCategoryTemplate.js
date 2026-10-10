"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCategoryBanner from "../ProductCategoryBanner";
import BestsellingProducts from "../BestsellingProducts";
import SellingBundles from "../SellingBundles";
import TestimonialSection from "../TestimonialSection";
import ProductCategoryFaq from "../ProductCategoryFaq";
import LeftSideLine from "../LeftSideLine";
import RightSideLine from "../RightSideLine";
import { useSetPreFooter } from "../../context/PreFooterContext";
import LoadingScreen from "../LoadingScreen";
import { fetchJsonWithRetry } from "../../lib/fetchWithRetry";

export default function ProductCategoryTemplate({ slug }) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const freeGuide = useMemo(
    () =>
      category?.free_guide
        ? { ...category.free_guide, variant: "newsletter", submit_text: "Get Free Guide" }
        : null,
    [category]
  );
  useSetPreFooter(freeGuide);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    fetchJsonWithRetry(
      `/api/product-categories/${encodeURIComponent(slug)}`,
      {
        attempts: 5,
        cache: "no-store",
        signal: controller.signal,
      }
    )
      .then((payload) => payload.data)
      .then(setCategory)
      .catch((fetchError) => {
        if (isCurrentRequest && fetchError.name !== "AbortError") {
          console.error(`Product category fetch error for "${slug}":`, fetchError);
          setError(fetchError);
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [slug]);

  useEffect(() => {
    if (!loading) window.dispatchEvent(new Event("app:content-ready"));
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !category) {
    return <div className="product-page-error">Unable to load this product category.</div>;
  }

  const bestsellers = category.our_bestselller
    ? {
        ...category.our_bestselller,
        products_type: [{
          id: category.our_bestselller.id,
          name: category.our_bestselller.title,
          products: category.our_bestselller.products || [],
        }],
      }
    : null;
  const testimonials = category.testimonials?.length
    ? { testimonial_data: category.testimonials }
    : null;
  const foundationProducts = bestsellers
    ? {
        ...bestsellers,
        title: "Brand Foundation Playbook",
        subtitle: "Figure out what you stand for before you build anything." ||
          category.our_bestselller.foundation_subtitle ||
          category.our_bestselller.foundation_description ||
          category.our_bestselller.subtitle ||
          category.our_bestselller.sub_title,
      }
    : null;
  const growthProducts = bestsellers
    ? {
        ...bestsellers,
        title: "Marketing & Growth",
        subtitle: "Get attention without wasting budget." ||
          category.our_bestselller.growth_subtitle ||
          category.our_bestselller.growth_description ||
          category.our_bestselller.subtitle ||
          category.our_bestselller.sub_title,
      }
    : null;

  return (
    <>
      <LeftSideLine id="leftLine" />
      <RightSideLine id="rightLine" />
      <ProductCategoryBanner id="product-category-hero" data={category.product_category_banner} />
      <BestsellingProducts id="product-category-bestsellers" data={bestsellers} />
      <BestsellingProducts id="product-category-foundation" data={foundationProducts} />
      <SellingBundles id="product-category-bundles" data={category.selling_bundles} />
      <BestsellingProducts id="product-category-growth" data={growthProducts} />
      <TestimonialSection
        id="product-category-testimonials"
        data={testimonials}
        testimonialTicker
      />
      <ProductCategoryFaq id="product-category-faq" data={category.faq_section} />
    </>
  );
}
