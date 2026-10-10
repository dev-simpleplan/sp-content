"use client";

import { useEffect, useState } from "react";
import PolicyPageTemplate from "../components/templates/PolicyPageTemplate";
import LoadingScreen from "../components/LoadingScreen";

function getBlockText(block) {
  return (block?.children || [])
    .map((child) => child?.text || "")
    .join("")
    .trim();
}

function toSections(description = []) {
  const sections = [];
  let currentSection = null;

  description.forEach((block) => {
    if (block?.type === "heading") {
      const heading = getBlockText(block);
      currentSection = {
        id: `privacy-${sections.length + 1}`,
        label: heading.replace(/^\d+\.\s*/, "").trim(),
        body: [],
      };
      sections.push(currentSection);
      return;
    }

    if (!currentSection) return;

    if (block?.type === "list") {
      const items = (block.children || [])
        .map((item) => getBlockText(item))
        .filter(Boolean);
      if (items.length) currentSection.body.push({ type: "ul", items });
      return;
    }

    const text = getBlockText(block);
    if (text) currentSection.body.push({ type: "p", text });
  });

  return sections;
}

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/product-privacy-policy")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload?.error || !payload?.data) {
          throw new Error(payload?.error || "Failed to load privacy policy.");
        }
        return payload.data;
      })
      .then(setContent)
      .catch((requestError) => {
        console.error("Product privacy policy fetch error:", requestError);
        setError(requestError);
      });
  }, []);

  if (!content && !error) return <LoadingScreen />;
  if (error) {
    return <div className="product-page-error">Unable to load the privacy policy.</div>;
  }

  const policyContent = content.privacy_policy_content;
  const lastUpdated = (policyContent.last_update || "").replace(
    /^last updated:\s*/i,
    ""
  );

  return (
    <PolicyPageTemplate
      title={policyContent.title || "Privacy Policy"}
      lastUpdated={lastUpdated}
      sections={toSections(policyContent.description)}
      preFooter={content.pre_footer}
    />
  );
}
