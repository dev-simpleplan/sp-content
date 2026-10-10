"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import gutlyImage from "./images/we-are-p4.png";
import orbeImage from "./images/ttb-img.png";
import lumiredImage from "./images/bl1.png";
import juicySallyImage from "./images/bl3.png";
import crawfordImage from "./images/bl2.png";
import gravetteImage from "./images/we-are-p2.png";
import arrowIcon from "./images/arrow-down.png";

const workItems = [
  { id: "gutly", title: "Gutly", category: "Fashion & Beauty", description: "Lorem ipsum dolor sit amet consectetur.", image: gutlyImage },
  { id: "orbe", title: "Orbe", category: "Fashion & Beauty", description: "Lorem ipsum dolor sit amet consectetur.", image: orbeImage },
  { id: "lumired", title: "LumiRed", category: "Fashion & Beauty", description: "Lorem ipsum dolor sit amet consectetur.", image: lumiredImage },
  { id: "juicy-sally", title: "Juicy Sally", category: "Health & Wellness", description: "Lorem ipsum dolor sit amet consectetur.", image: juicySallyImage },
  { id: "crawford", title: "Crawford", category: "Health & Wellness", description: "Lorem ipsum dolor sit amet consectetur.", image: crawfordImage },
  { id: "gravette", title: "Gravette", category: "SaaS / Technology", description: "Lorem ipsum dolor sit amet consectetur.", image: gravetteImage },
  { id: "althera", title: "Althera", category: "Health & Wellness", description: "Lorem ipsum dolor sit amet consectetur.", image: gutlyImage },
  { id: "orielle", title: "Orielle", category: "Luxury & Jewellery", description: "Lorem ipsum dolor sit amet consectetur.", image: orbeImage },
  { id: "osin", title: "OSIN", category: "SaaS / Technology", description: "Lorem ipsum dolor sit amet consectetur.", image: lumiredImage },
  { id: "aukera", title: "Aukera", category: "Luxury & Jewellery", description: "Lorem ipsum dolor sit amet consectetur.", image: juicySallyImage },
  { id: "sagenext", title: "SageNext", category: "SaaS / Technology", description: "Lorem ipsum dolor sit amet consectetur.", image: crawfordImage },
  { id: "nuraz", title: "Nuraz", category: "Luxury & Jewellery", description: "Lorem ipsum dolor sit amet consectetur.", image: gravetteImage },
];

const CATEGORIES = [
  "All",
  "Fashion & Beauty",
  "Health & Wellness",
  "SaaS / Technology",
  "Luxury & Jewellery",
];

const BATCH_SIZE = 6;
const LOCK_DURATION = 1000; // ms - how long the scroll feels "stuck"

export default function AllWork() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLocked, setIsLocked] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside it
    useEffect(() => {
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setIsDropdownOpen(false);
    };

  const sentinelRef = useRef(null);
  const lockActiveRef = useRef(false); // prevents re-triggering while already locked/loading
  const preventScrollRef = useRef(null); // stores the handler so we can remove the exact same reference

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return workItems;
    return workItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  // Blocks wheel / touch / keyboard scrolling without jumping the page
  const lockScroll = () => {
    const preventDefault = (e) => e.preventDefault();
    preventScrollRef.current = preventDefault;

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", handleKeyScroll, { passive: false });
  };

  const unlockScroll = () => {
    if (preventScrollRef.current) {
      window.removeEventListener("wheel", preventScrollRef.current);
      window.removeEventListener("touchmove", preventScrollRef.current);
    }
    window.removeEventListener("keydown", handleKeyScroll);
    preventScrollRef.current = null;
  };

  const handleKeyScroll = (e) => {
    const scrollKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "];
    if (scrollKeys.includes(e.key)) e.preventDefault();
  };

  // Trigger: reaching the sentinel (last card) locks scroll, waits, then reveals next batch
  useEffect(() => {
    if (!hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !lockActiveRef.current) {
          lockActiveRef.current = true;
          setIsLocked(true);
          lockScroll();

          setTimeout(() => {
            setVisibleCount((prev) => prev + BATCH_SIZE);
            unlockScroll();
            setIsLocked(false);
            lockActiveRef.current = false;
          }, LOCK_DURATION);
        }
      },
      { threshold: 0.4 } // triggers once the last card is meaningfully in view
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      unlockScroll();
    };
  }, [hasMore]);

  return (
    <section className="all-work">
      <div className="container">
        <div className="all-work-in">
          <div className="all-work__header">
            <h2 className="all-work__heading">All Projects</h2>

            <div className="all-work__filter" ref={dropdownRef}>
                <span className="all-work__filter-label">Filter:</span>

                <div className="custom-select">
                    <button
                        type="button"
                        className={"custom-select__trigger" + (isDropdownOpen ? " is-open" : "")}
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        {activeCategory}
                        <div className="custom-select__arrow">
                            <img src={arrowIcon.src}/>
                        </div>
                    </button>

                    <ul
                        className={"custom-select__list" + (isDropdownOpen ? " is-open" : "")}
                    >
                    {CATEGORIES.map((category) => (
                        <li key={category}>
                        <button
                            type="button"
                            className={
                            "custom-select__option" +
                            (category === activeCategory ? " is-active" : "")
                            }
                            onClick={() => handleCategorySelect(category)}
                        >
                            {category}
                        </button>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <p className="all-work__empty">No projects found in this category.</p>
          ) : (
            <>
              <div className={"all-work__grid" + (isLocked ? " is-loading" : "")}>
                {visibleItems.map((item, index) => {
                  const isFull = index % 5 === 0;
                  const cardClassName =
                    "all-work__card " +
                    (isFull ? "all-work__card--full" : "all-work__card--half");

                  return (
                    <a
                      href={"/work/" + item.id}
                      key={item.id}
                      className={cardClassName}
                    >
                      <div className="all-work__image-wrap">
                        <img
                          src={item.image.src}
                          alt={item.title}
                          className="all-work__image"
                        />
                        <span className="all-work__tag">{item.category}</span>
                      </div>

                      <div className="all-work-cardInfo">
                        <h3 className="all-work__title">{item.title}</h3>
                        <p className="all-work__desc">{item.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {hasMore && <div ref={sentinelRef} className="all-work__sentinel" />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}