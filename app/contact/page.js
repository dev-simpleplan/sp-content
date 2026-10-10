"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getImageUrl } from "../components/getImageUrl";
import LeftSideLine from "../components/LeftSideLine";
import RightSideLine from "../components/RightSideLine";
import Wayfinding from "../components/Wayfinding";
import LoadingScreen from "../components/LoadingScreen";
import { useSetPreFooter } from "../context/PreFooterContext";
import { asPlainText } from "../components/contactContent";
import ContactForm from "../components/ContactForm";
import "./contactStyle.css";

export default function ContactPage() {
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSetPreFooter(sections?.pre_footer);

  useEffect(() => {
    let isCurrentRequest = true;

    axios
      .get("/api/product-contact-us")
      .then(({ data }) => {
        if (!data?.data) throw new Error("API response structure is incorrect.");
        if (isCurrentRequest) setSections(data.data);
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          console.error("Product Contact Us fetch error:", requestError);
          setError(requestError);
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  if (loading) return <LoadingScreen />;
  if (error || !sections) {
    return <div className="product-page-error">Unable to load the product Contact Us page.</div>;
  }

  const form = sections.contact_form_section;
  const simpleConnection = sections.simple_connection;
  const findUs = sections.find_us;
  const contactSections = [
    { id: "product-contact-form", label: form?.tagline || "Contact Form" },
    { id: "product-contact-next-steps", label: simpleConnection?.tagline || "Next Steps" },
    { id: "product-contact-find-us", label: findUs?.tagline || "Address" },
  ];

  return (
    <>
      <LeftSideLine />
      <RightSideLine />
      <Wayfinding sections={contactSections} theme="product-contact" />

      <section className="contact-hero" id="product-contact-form">
        <div className="contact-container">
          <div className="contact-hero-grid gap-left">
            <div className="contact-hero-left">
              <h1 className="contact-hero-title">{form?.title}</h1>
              <p className="contact-hero-subtext">{asPlainText(form?.description)}</p>
            </div>
            <div className="contact-hero-right">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="contact-connection-wrap">
        <div className="contact-next-steps" id="product-contact-next-steps">
          <div className="contact-container">
            <div className="contact-container-head gap-left">
              <h2 className="contact-section-title">{simpleConnection?.title}</h2>
              <p className="contact-section-subtext">{asPlainText(simpleConnection?.description)}</p>
              <div className="next-steps-grid">
              {(simpleConnection?.steps || []).map((step) => (
                <div className="next-step-card" key={step.id}>
                  <span className="next-step-icon" aria-hidden="true">
                    {step.Icon && <img src={getImageUrl(step.Icon)} alt="" width={24} height={24} />}
                  </span>
                  <p>{step.Text}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        <div className="contact-find-us" id="product-contact-find-us">
          <div className="contact-container">
            <div className="contact-container-head gap-left">
              <h2 className="contact-section-title">{findUs?.title}</h2>
              <div className="find-us-grid">
              <div className="find-us-map">
                {findUs?.map_image && (
                  <img src={getImageUrl(findUs.map_image)} alt="SimplePlan Media location map" />
                )}
              </div>
              <div className="find-us-info">
                <div className="find-us-block">
                  <p className="find-us-heading">India</p>
                  <p className="find-us-para">
                    {(findUs?.india_address || "").split("\n").map((line, index) => (
                      <span key={index}>{line}<br /></span>
                    ))}
                  </p>
                </div>
                <div className="find-us-block">
                  <p className="find-us-heading">UK</p>
                  <p>
                    {(findUs?.uk_address || "").split("\n").map((line, index) => (
                      <span key={index}>{line}<br /></span>
                    ))}
                  </p>
                </div>
                <div className="find-us-block">
                  <p className="find-us-heading">Or Get In Touch Via</p>
                  {findUs?.e_mail && <a href={`mailto:${findUs.e_mail}`}>{findUs.e_mail}</a>}
                  {findUs?.phone_number && (
                    <a href={`tel:${findUs.phone_number.replace(/[^+\d]/g, "")}`}>
                      {findUs.phone_number}
                    </a>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
