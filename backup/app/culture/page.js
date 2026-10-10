"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Wayfinding from "../components/Wayfinding";
import { useSetPreFooter } from "../context/PreFooterContext";
import CultureBanner from "../components/CultureBanner";
import VideoAnimated from "../components/VideoAnimated";
import OurApproach from "../components/OurApproach";
import HowWeDoIt from "../components/company/HowWeDoIt";
import OffsitesRetreats from "../components/culture/OffsitesRetreats";
import ReadyToBuild from "../components/ReadyToBuid";
import EmployeePov from "../components/culture/EmployeePov";
import CultureVideos from "../components/culture/CultureVideos";
import CatchUpWithUs from "../components/culture/CatchUpWithUs";

import Initiatives from "../components/company/Initiatives";
import RightSideLine from "../components/RightSideLine";



export default function Culture(){

  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections?.pre_footer);

  useEffect(() => {
    axios.get('/api/culture?populate=*')
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

    // Images loading after mount change section heights, which shifts
    // every pinned trigger below them — re-notify once any images that
    // were still loading at mount time finish, but only if still safe.
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
    { id: "culture_banner", label: sections.culture_banner?.tagline },
    { id: "principles", label: sections.principles?.tagline },
    { id: "we_keep_standards", label: sections.we_keep_standards?.tagline },
    { id: "offsites_retreats", label: sections.offsites_retreats?.tagline },
    { id: "join_team", label: sections.join_team?.Tagline },
    { id: "employees_pov", label: sections.employees_pov?.tagline },
    { id: "culture_videos", label: sections.culture_videos?.tagline },
    { id: "community", label: sections.community?.tagline },
  ];

  return (
    <>
      <Wayfinding sections={HOME_SECTIONS} />
      <RightSideLine id="rightLine"/>
      <CultureBanner id="culture_banner" data={sections.culture_banner} />
      <VideoAnimated data={sections.video_section} />
      <OurApproach id="principles" data={sections.principles} />
      <HowWeDoIt id="we_keep_standards" data={sections.we_keep_standards} />
      <OffsitesRetreats id="offsites_retreats" data={sections.offsites_retreats} />
      <ReadyToBuild id="join_team" data={sections.join_team}/>
      <EmployeePov id="employees_pov" data={sections.employees_pov} />
      <CultureVideos id="culture_videos" data={sections.culture_videos}/>
      <CatchUpWithUs id="community" data={sections.community}/>

      {/* API-dependent sections — show loader until data arrives */}
      {loading && (
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
      )}

      {/* {error && <div>Error: {error.message}</div>} */}

      {!loading && !error && (
        <>
          {/* Add API sections here via renderSection() */}
        </>
        )}
    </>
  );
}