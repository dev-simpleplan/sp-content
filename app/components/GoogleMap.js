import React from "react";
import "../contact/contactStyle.css";

export default function GoogleMap() {

  return (
    <div className="map-container">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.4637624587654!2d77.2509924!3d28.555833499999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c86ec6911d%3A0xaa9ebff5813de8bb!2s3rd%20Floor%2C%20252-L%2C%20Raja%20Dhirsain%20Marg%2C%20Sant%20Nagar%2C%20East%20of%20Kailash%2C%20New%20Delhi%2C%20Delhi%20110065!5e0!3m2!1sen!2sin!4v1791544077906!5m2!1sen!2sin"
        width="600"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        title="SimplePlan office location"
      />
    </div>
  );
}