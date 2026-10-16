"use client";

import { useEffect, useState } from "react";
import LeftSideLine from "../LeftSideLine";
import RightSideLine from "../RightSideLine";
import VideoInnerBanner from "../VideoInnerBanner";
import ApproachBranding from "../service/ApproachBranding";
import PlaylistVideos from "../PlaylistVideos";
import HomeBestsellingProducts from "../HomeBestsellingProducts";
import Wayfinding from "../Wayfinding";
import LoadingScreen from "../LoadingScreen";
import { useSetPreFooter } from "../../context/PreFooterContext";

// Inner page for a single piece of content (video). The record is looked up
// by slug on the server (see app/content/[slug]/page.js); its sections are
// added to the render below one by one.
export default function ContentInnerTemplate({ content }) {
  const bannerData = content.video_inner_banner;
  const playlistData = content.more_videos;

  useSetPreFooter(content?.pre_footer);

  // The banner is full-viewport, so the rail stays a plain line there; the
  // section-by-section Wayfinding rail slides in once the banner is behind.
  const [showWayfinding, setShowWayfinding] = useState(false);

  useEffect(() => {
    const banner = document.getElementById("content-inner-banner");
    if (!banner) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowWayfinding(
          !entry.isIntersecting &&
            entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0)
        );
      },
      { rootMargin: "-30% 0px 0px 0px" }
    );

    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  // The record is fetched on the server, so the page arrives ready — but its
  // images don't. Like the other pages, show the loading screen until the
  // images on the page have loaded. It is a full-screen overlay, so the page
  // can mount (and start loading images) underneath it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const MAX_WAIT_MS = 5000;
    let cancelled = false;
    let settled = false;
    let pending = [];
    let timeout;

    const finish = () => {
      if (cancelled || settled) return;
      settled = true;
      setReady(true);
    };

    const frame = requestAnimationFrame(() => {
      pending = Array.from(document.images).filter((image) => !image.complete);
      if (!pending.length) {
        finish();
        return;
      }

      let remaining = pending.length;
      const onSettled = () => {
        remaining -= 1;
        if (remaining === 0) finish();
      };

      pending.forEach((image) => {
        image.addEventListener("load", onSettled, { once: true });
        image.addEventListener("error", onSettled, { once: true });
      });

      // never leave the visitor on the loader if an image hangs
      timeout = setTimeout(finish, MAX_WAIT_MS);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  // Start the reveal animations once the loading screen has gone.
  useEffect(() => {
    if (ready) window.dispatchEvent(new Event("app:content-ready"));
  }, [ready]);

  // Sections are added here one by one as they're built.
  const wayfindingSections = [
    ...(content.about_video
      ? [{ id: "content-inner-about", label: content.about_video.tagline || "About" }]
      : []),
    ...(content.more_videos
      ? [{ id: "content-inner-playlist", label: content.more_videos.tagline || "Playlist" }]
      : []),
    ...(content.frameworks_resources
      ? [{ id: "content-inner-resources", label: content.frameworks_resources.tagline || "Resources" }]
      : []),
  ];

  return (
    <>
      {!ready && <LoadingScreen />}
      {/* The Wayfinding rail draws its own side line, so only one of the two
          is ever mounted — two stacked lines would hide at different moments
          near the footer and show up as a second line. */}
      {showWayfinding || !content.video_inner_banner ? (
        <Wayfinding sections={wayfindingSections} className="wayfinding-enter" />
      ) : (
        <LeftSideLine id="leftLine" />
      )}
      <RightSideLine id="rightLine" />
      <VideoInnerBanner
        id="content-inner-banner"
        data={bannerData}
        title={content.title}
      />
      <ApproachBranding
        id="content-inner-about"
        data={content.about_video}
        richDescription
      />
      <PlaylistVideos id="content-inner-playlist" data={playlistData} />
      <HomeBestsellingProducts
        id="content-inner-resources"
        data={content.frameworks_resources}
      />
    </>
  );
}
