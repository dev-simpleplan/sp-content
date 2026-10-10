"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../components/sp-for-good/sp-for-good.css";

import { useSetPreFooter } from "../context/PreFooterContext";
import Wayfinding from "../components/Wayfinding";
import RightSideLine from "../components/RightSideLine";
import SpBanner from "../components/sp-for-good/SpBanner";
import ApproachBranding from '../components/service/ApproachBranding';
import Initiatives from "../components/company/Initiatives";
import WeDoStand from '../components/WeDoStand';
import BucketListSection from "../components/sp-for-good/BucketList";
import Partnership from "../components/sp-for-good/Partnership";

// TODO: point this at the marketing-specific API endpoint once it exists —
// using the branding endpoint as a placeholder for now.
export default function SPForGood(){

const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections?.pre_footer);

  useEffect(() => {
    axios.get('/api/sp-for-good?populate[sp_for_good_banner][populate]=*&populate[branding_approach][populate]=*&populate[initiative_section][populate]=*&populate[other_projects][populate][projects][populate]=*&populate[bucket_list][populate]=*&populate[partnership_form][populate]=*&populate[pre_footer][populate]=*')
      .then(response => {
        if (response.data && response.data.data) {
          setSections(response.data.data);
        } else {
          console.error("API response structure is incorrect", response.data);
          setSections({});
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return;

    // Only safe to refresh GSAP's pinned-section measurements while the
    // user hasn't scrolled meaningfully yet — ScrollTrigger.refresh()
    // briefly un-pins/re-pins everything, which visibly flashes/jumps if
    // it fires while a pinned section is already active mid-scroll.
    const isSafeToRefresh = () => window.scrollY < 200;

    const notifyReady = () => {
      if (isSafeToRefresh()) {
        window.dispatchEvent(new Event("app:content-ready"));
      }
    };

    notifyReady();

    const pendingImages = Array.from(document.images).filter((img) => !img.complete);

    if (pendingImages.length === 0) return;

    let remaining = pendingImages.length;
    const handleImageSettled = () => {
      remaining -= 1;
      if (remaining === 0) notifyReady();
    };

    pendingImages.forEach((img) => {
      img.addEventListener("load", handleImageSettled, { once: true });
      img.addEventListener("error", handleImageSettled, { once: true });
    });

    return () => {
      pendingImages.forEach((img) => {
        img.removeEventListener("load", handleImageSettled);
        img.removeEventListener("error", handleImageSettled);
      });
    };
  }, [loading]);

  const renderSection = (key, Component) => {
    if (!sections || !sections[key]) return null;
    return <Component data={sections[key]} />;
  };

  const SP_for_Good_SECTIONS = [
    {id: "sp-for-good-banner", label: sections?.sp_for_good_banner?.tagline },
    {id: "approach-branding", label: sections?.branding_approach?.tagline },
    {id: "initiatives", label: sections?.initiative_section?.tagline },
    {id: "we-do-stand", label: sections?.other_projects?.tagline },
    {id: "bucket-list", label: sections?.bucket_list?.tagline },
    {id: "partnership", label: sections?.partnership_form?.tagline }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="loadingIn">
          <div className="loadingText">
            <span data-text="L">L</span>
            <span data-text="O">O</span>
            <span data-text="A">A</span>
            <span data-text="D">D</span>
            <span data-text="I">I</span>
            <span data-text="N">N</span>
            <span data-text="G">G</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
        <Wayfinding sections={SP_for_Good_SECTIONS} />
        <RightSideLine />
        <SpBanner data={sections?.sp_for_good_banner} id="sp-for-good-banner" />
        <ApproachBranding data={sections?.branding_approach} id="approach-branding" />
        <Initiatives data={sections?.initiative_section} id="initiatives" />
        <WeDoStand data={sections?.other_projects} id="we-do-stand" />
        <BucketListSection data={sections?.bucket_list} id="bucket-list" />
        <Partnership data={sections?.partnership_form} id="partnership" />
    </>
  );
}
