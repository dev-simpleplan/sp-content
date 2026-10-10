"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSetPreFooter } from "../context/PreFooterContext";

import Wayfinding from "../components/Wayfinding";
import RightSideLine from "../components/RightSideLine";
import ServiceBanner from "../components/ServiceBanner";
import LikeWhatYouSee from '../components/LikeWhatYouSee';
import ApproachBranding from '../components/service/ApproachBranding';
import OurApproach from '../components/OurApproach';
import ServiceWeAreProud from "../components/ServiceWeAreProud";
import HowThisShowUp from '../components/service/HowThisShowsUp';

// TODO: field keys below (branding_outer_banner, branding_approach, etc.)
// still need to be updated to match the real marketing-service-outer
// response shape once it's confirmed — see app/api/marketing-service-outer
// for the route this now calls.
export default function MarketingServicePage(){

const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useSetPreFooter(sections?.pre_footer);

  useEffect(() => {
    axios.get('/api/marketing-service-outer?populate[branding_outer_banner][populate]=*&populate[stats][populate]=*&populate[branding_approach][populate]=*&populate[scope_work][populate]=*&populate[transformation][populate][case_study_cards][populate]=*&populate[work_shows_up][populate]=*&populate[pre_footer][populate]=*')
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

  const HOME_SECTIONS = [
    { id: "service-banner", label: sections?.branding_outer_banner?.tagline },
    { id: "approach-branding", label: sections?.branding_approach?.tagline },
    { id: "our-approach", label: sections?.scope_work?.tagline },
    { id: "we-are-proud", label: sections?.transformation?.tagline },
    { id: "how-this-show-up", label: sections?.work_shows_up?.tagline },
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
      <Wayfinding sections={HOME_SECTIONS} />
      <RightSideLine id="rightLine"/>
      <ServiceBanner data={sections?.branding_outer_banner} id="service-banner"/>
      <LikeWhatYouSee id="like-what-you-see" data={sections?.stats} stats={sections?.stats}/>
      <ApproachBranding data={sections?.branding_approach} id="approach-branding"/>
      <OurApproach  id="our-approach" data={sections?.scope_work}/>
      <ServiceWeAreProud id="we-are-proud" data={sections?.transformation}/>
      <HowThisShowUp id="how-this-show-up" data={sections?.work_shows_up}/>
    </>
  );
}
