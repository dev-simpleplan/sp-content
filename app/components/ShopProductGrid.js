"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "./common/getImageUrl";

const INITIAL_VISIBLE = 6;
const LOAD_BATCH = 6;

function Arrow() {
  return (
    <span className="arrow-wrap" aria-hidden="true">
      <svg className="arrow arrow-1" viewBox="0 0 12 12" fill="none">
        <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
      </svg>
      <svg className="arrow arrow-2" viewBox="0 0 12 12" fill="none">
        <path d="M0.878 11.667 0 10.789 9.539 1.25H3.75V0h7.917v7.917h-1.25V2.128L.878 11.667Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function getPriceValue(price) {
  const value = Number.parseFloat(String(price || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export default function ShopProductGrid({ id, products = [], categories = [] }) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const loadMoreRef = useRef(null);

  const filteredProducts = useMemo(() => {
    const nextProducts =
      category === "all"
        ? products
        : products.filter((product) =>
            product.product_categories?.some((item) => item.slug === category)
          );

    return [...nextProducts].sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "price-low") return getPriceValue(a.price) - getPriceValue(b.price);
      if (sort === "price-high") return getPriceValue(b.price) - getPriceValue(a.price);
      return 0;
    });
  }, [category, products, sort]);

  const canLoadMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!canLoadMore || !loadMoreRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + LOAD_BATCH, filteredProducts.length)
          );
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [canLoadMore, filteredProducts.length]);

  return (
    <section className="shop-products" id={id}>
      <div className="container">
        <div className="shop-products__toolbar">
          <label>
            <span>Filter:</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setVisibleCount(INITIAL_VISIBLE);
              }}
            >
              <option value="all">All</option>
              {categories.map((item) => (
                <option value={item.slug} key={item.id || item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort by:</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setVisibleCount(INITIAL_VISIBLE);
              }}
            >
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>

        {filteredProducts.length ? (
          <div className="shop-products__grid">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <article className="shop-product-card" key={product.id}>
                <div className="shop-product-card__image">
                  {product.thumbnail && (
                    <img
                      src={getImageUrl(product.thumbnail, "large")}
                      alt={product.thumbnail.alternativeText || product.title}
                      draggable={false}
                    />
                  )}
                </div>
                <div className="shop-product-card__content">
                <div className="shop-product-card__rating">
                  <span>★★★★★</span> <small>(47)</small>
                </div>
                <h2>{product.title}</h2>
                <p className="shop-product-card__description">
                  {product.short_description}
                </p>
                <p className="shop-product-card__price">{product.price}</p>
                <a
                  href={product.redirection_link || "#"}
                  className="shop-product-card__cta"
                >
                  <span>View Product</span>
                  <Arrow />
                </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="shop-products__empty">No products found in this category.</p>
        )}

        {canLoadMore && (
          <div className="shop-products__load-more" ref={loadMoreRef}>
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) =>
                  Math.min(current + LOAD_BATCH, filteredProducts.length)
                )
              }
            >
              Load more products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
