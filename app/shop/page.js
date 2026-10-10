"use client";

import { useEffect, useMemo, useState } from "react";
import ShopBanner from "../components/ShopBanner";
import ShopProductGrid from "../components/ShopProductGrid";
import RightSideLine from "../components/RightSideLine";
import LeftSideLine from "../components/LeftSideLine";
import { useSetPreFooter } from "../context/PreFooterContext";
import LoadingScreen from "../components/LoadingScreen";
import { fetchJsonWithRetry } from "../lib/fetchWithRetry";

export default function ShopPage() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const freeGuide = useMemo(
    () =>
      shop?.free_guide
        ? { ...shop.free_guide, variant: "newsletter", submit_text: "Get Free Guide" }
        : null,
    [shop]
  );
  useSetPreFooter(freeGuide);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    Promise.all([
      fetchJsonWithRetry("/api/shop", { attempts: 5, signal: controller.signal }),
      fetchJsonWithRetry("/api/products", { attempts: 5, signal: controller.signal }),
      fetchJsonWithRetry("/api/product-categories", {
        attempts: 5,
        signal: controller.signal,
      }),
    ])
      .then(([shopPayload, productsPayload, categoriesPayload]) => {
        if (shopPayload.error || productsPayload.error || categoriesPayload.error) {
          throw new Error(
            shopPayload.error || productsPayload.error || categoriesPayload.error
          );
        }
        setShop(shopPayload.data);
        setProducts(productsPayload.data || []);
        setCategories(categoriesPayload.data || []);
      })
      .catch((fetchError) => {
        if (isCurrentRequest && fetchError.name !== "AbortError") {
          console.error("Shop page fetch error:", fetchError);
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
  }, []);

  useEffect(() => {
    if (!loading) window.dispatchEvent(new Event("app:content-ready"));
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !shop) {
    return <div className="product-page-error">Unable to load the shop page.</div>;
  }

  return (
    <>
      <LeftSideLine id="leftLine" />
      <RightSideLine id="rightLine" />
      <ShopBanner id="shop-hero" data={shop.shop_banner} />
      <ShopProductGrid id="shop-products" products={products} categories={categories} />
    </>
  );
}
