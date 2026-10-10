'use client';
import axios from "axios";
import { useState, useEffect } from "react";
import { getImageUrl } from "./common/getImageUrl";
import Link from "next/link";
import Image from "next/image";
// import footerbg from "../../assets/footerbackground.png";
// import footerLogo from "../../assets/footer-logo.png";
// import facebook from "../../assets/emb-facebook.svg";
// import twitter from "../../assets/emb-twitter.svg";
// import instagram from "../../assets/emb-instagram.svg";
// import linkedin from "../../assets/emb-linkedin.svg";
// import youtube from "../../assets/emb-youtube.svg";
// import copyright from "../../assets/copyright-icon.svg";
// import heart from "../../assets/emb-heart.svg";
import styles from './footer.module.css';


export default function Footer() {

  const [footerData, setFooterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastItem = footerData[footerData.length - 1];

  useEffect(() => {
    async function fetchFooter() {
      try {
        const response = await axios.get("https://cmsweb.emb.global/api/footer-menu?populate=FooterMenuItems.sections.links,FooterMenuItems.logo,FooterMenuItems.sociallinks.image,FooterMenuItems.Footerinfo.image");
        const footerItems = response.data.data.FooterMenuItems || [];
        setFooterData(footerItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching footer data:", error);
        setLoading(false);
      }
    }

    fetchFooter();
  }, []);

//   if (loading) return <div>Loading Footer...</div>;

    return (
      <footer className={styles.footer}>
        <div className={styles.bgImage}>
          {/* <Image
            src={footerbg}
            className={styles.image}
            alt='Background Image'
          /> */}
        </div>
        <div className={styles.footerInWrap}>
          <div className="containerfluid">
            <div className={styles.footerIn}>
              <div className={styles.footerInTop}>
                <div className={styles.fitLeft}>
                  <Link href="/" className={styles.flLink}>
                    {/* <Image src={footerLogo} className={styles.image} alt="Footer Logo" /> */}
                  </Link>
                </div>
                <div className={styles.fitRight}>
                  <div className={styles.fitrMenuWrap}>
                    {/* {console.log(footerData)} */}
                    {footerData.slice(0, 4).map((menuItem, index) => (
                      <div key={index} className={styles.fitrMenuItem}>
                        <ul>
                          {menuItem.sections?.map((section) =>
                            section.links?.map((link) => (
                              <li key={link.id}>
                                <Link href={link?.url || "/"}>{link?.name}</Link>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className={styles.fitrBottomWrap}>
                    <div className={styles.fitbAddress}>
                    {lastItem && (
                      <>
                        <p>{lastItem.address || "Default Address"}</p>
                        <Link href={`mailto:${lastItem.email || "contact@emb.global"}`}>
                          {lastItem.email || "contact@emb.global"}
                        </Link>
                      </>
                    )}
                    </div>
                    {lastItem?.sociallinks && (
                    <div className={styles.fitbSocial}>
                      <p>Follow Us:</p>
                      <ul>
                      {lastItem?.sociallinks.map((social, index) => (
                        <li key={index}>
                          <Link href={social?.link}>
                          <Image 
                            src={getImageUrl(social?.image)} 
                            alt={`Gallery image ${index}`} 
                            width="200"
                            height="200"
                            priority={true} 
                          />
                          </Link>
                        </li>
                      ))}
                      </ul>
                    </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.footerInBottom}>
                {lastItem?.copyright && (
                  <div className={styles.fibLeft}>
                    {lastItem?.copyright.map((item, index) => (
                      <p key={index}><Image src={copyright} className={styles.image} alt='copyright icon'/>
                        {item.children.map((child, i) => (child.type === "text" ? child.text : null))}
                      </p>
                    ))}
                    </div>
                  )}
                
                {/* <div className={styles.fibRight}>
                  <p>Made with</p>
                  <Image src={heart} className={styles.image} alt='heart icon'/>
                  <p>by <Link href="https://www.simpleplanmedia.com/" target="_blank">SimplePlan</Link></p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        
      </footer>
    );
  }