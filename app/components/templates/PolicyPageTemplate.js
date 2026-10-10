"use client";

import { useMemo } from "react";
import LeftSideLine from "../LeftSideLine";
import RightSideLine from "../RightSideLine";
import Wayfinding from "../Wayfinding";
import { useSetPreFooter } from "../../context/PreFooterContext";
import "./policyPageTemplate.css";

// Same "Ready to build" CTA every static policy page shares — these pages
// have no CMS entry of their own, so this is a fixed default rather than
// API data. Override via the `preFooter` prop if a specific policy page
// ever needs different CTA copy.
const DEFAULT_PRE_FOOTER = {
  title: "Ready To Build Your Brand The Right Way?",
  description: [
    {
      children: [
        {
          text: "Start with clarity, then build a brand that doesn't need to be reworked every time you grow.",
        },
      ],
    },
  ],
  cta_text: "Book A Call",
  cta_link: "/contact",
};

// Shared template for static legal/policy pages (Privacy Policy, Terms &
// Conditions, and any future page of this shape). Content is static per
// page — pass it in as plain data and this handles the layout and
// numbering. Just the page-edge guide lines, no Wayfinding rail/anchors.
//
// Usage (copy this shape for a new policy page):
//   <PolicyPageTemplate
//     title="Privacy Policy"
//     lastUpdated="January 2026"
//     sections={[
//       {
//         id: "intellectual-property",
//         label: "Intellectual Property Rights",
//         body: [
//           { type: "p", text: "..." },
//           { type: "ul", items: ["...", "..."] },
//         ],
//       },
//       ...
//     ]}
//   />
export default function PolicyPageTemplate({ title, lastUpdated, sections = [], preFooter }) {
  useSetPreFooter(preFooter || DEFAULT_PRE_FOOTER);

  const wayfindingSections = useMemo(
    () => sections.map((section) => ({ id: section.id, label: section.label })),
    [sections]
  );

  return (
    <>
      <LeftSideLine light />
      <RightSideLine light />
      <Wayfinding sections={wayfindingSections} theme="light" />

      <section className="policy-page">
        <div className="policy-container">
          <div className="policy-container-head">
            <h1 className="policy-title">{title}</h1>
          {lastUpdated && <p className="policy-updated">LAST UPDATED: {lastUpdated.toUpperCase()}</p>}
          </div>

          <div className="policy-sec-wrapper">
            {sections.map((section, index) => (
              <div className="policy-section" id={section.id} key={section.id}>
                <h2 className="policy-heading">
                  {index + 1}. {section.label}
                </h2>
                <div className="policy-description">
                  {renderBody(section.body)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function renderBody(body) {
  if (!body) return null;
  const blocks = Array.isArray(body) ? body : [{ type: "p", text: body }];

  return blocks.map((block, i) => {
    if (block.type === "ul") {
      return (
        <ul className="policy-list" key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <p className="policy-paragraph" key={i}>
        {block.text}
      </p>
    );
  });
}
