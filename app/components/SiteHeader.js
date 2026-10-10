'use client';
import Link from "next/link";
import Image from "next/image";
// import logo from "../../assets/emb-logo-updated.svg";
// import arrow from "../../assets/dropdown-arrow.svg";
import styles from './header.module.css';
import { useState, useEffect } from 'react';
import axios from "axios";
import { getImageUrl } from "./common/getImageUrl";


export default function Header() {
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ctaButton, setCtaButton] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 8000); // Adjust breakpoint as needed
        };

        // Check on mount and on resize
        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        window.addEventListener("scroll", handleScroll);
        
        return () => {
            window.removeEventListener("resize", checkIfMobile);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // useEffect(() => {
    //     async function fetchMenu() {
    //         try {
    //             const response = await axios.get(
    //                 "https://cmsweb.emb.global/api/main-menu?populate[0]=MainMenuItems&populate[1]=MainMenuItems.sections&populate[2]=MainMenuItems.sections.links.icon&populate[3]=MainMenuItems.sections.links.bannerImage"
    //             );
    //             const menuItems = response.data.data.MainMenuItems || [];
    
    //             if (menuItems.length > 0) {
    //                 const lastItem = menuItems[menuItems.length - 1];
    
    //                 if (lastItem.__component === "menu.menu-button") {
    //                     setCtaButton(lastItem);
    //                     setMenuData(menuItems.slice(0, -1));
    //                 } else {
    //                     setMenuData(menuItems);
    //                 }
    
    //                 // Set the first available bannerImage as default
    //                 const firstBannerImage = menuItems
    //                     .flatMap(item => item.sections || [])
    //                     .flatMap(section => section.links || [])
    //                     .find(link => link.bannerImage)?.bannerImage;
    
    //                 if (firstBannerImage?.url) {
    //                     setActiveImage(getImageUrl(firstBannerImage));
    //                 }
    //             }
    
    //             setLoading(false);
    //         } catch (error) {
    //             console.error("Error fetching menu data:", error);
    //             setLoading(false);
    //         }
    //     }
    
    //     fetchMenu();
    // }, []);
    

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleLinkClick = () => {
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    // if (loading) return <div>Loading...</div>;

    // return (
    //     <header className={`${styles.header} ${isScrolled ? styles.active : ""}`} data-prevent-lenis>
    //         <div className="containerfluid">
    //             <div className={styles.headerin}>
    //                 {/* Logo */}
    //                 <div className={styles.logo}>
    //                     <Link href="/" className={styles.logoLink} onClick={handleLinkClick}>
    //                         {/* <Image src={logo} alt="EMB Global logo" width={150} height={50} /> */}
    //                     </Link>
    //                 </div>

    //                 {/* Navigation */}
    //                 <div className={`${styles.navbar} ${isMenuOpen ? styles.active : ""}`}>
    //                     <ul>
    //                         {menuData.map((menuItem, index) => (
    //                             <li key={index} className={menuItem?.sections?.length > 0 ? styles.hasChild : ""}>
    //                                 <Link 
    //                                     href={menuItem?.url || "/"} 
    //                                     className={styles.navLink}
    //                                     onClick={handleLinkClick}
    //                                 >
    //                                     {menuItem.title}
    //                                     {menuItem.sections?.length > 0 && (
    //                                         <span>
    //                                             <Image src={arrow} alt="dropdown arrow" width={10} height={10} />
    //                                         </span>
    //                                     )}
    //                                 </Link>

    //                                 {/* Dropdown Menu */}
    //                                 {menuItem.sections && menuItem.sections.length > 0 && (
    //                                 <div className={styles.dropDowns}>
    //                                   <div className={styles.ddIn}>
    //                                     <div className={styles.ddiLeft}>
    //                                       <ul>
    //                                         {menuItem.sections.map((section) => (
    //                                           <li key={section.id}>
    //                                             <ul className={styles.subMenu}>
    //                                               {section.links.map((link) => (
    //                                                 <li
    //                                                   key={link.id}
    //                                                   onMouseEnter={() => {
    //                                                     if (link?.bannerImage?.url) {
    //                                                       setActiveImage(getImageUrl(link.bannerImage));
    //                                                     }
    //                                                   }}
    //                                                 >
    //                                                   <Link 
    //                                                     href={link.url || "/"} 
    //                                                     className={styles.navLink}
    //                                                     onClick={handleLinkClick}
    //                                                   >
    //                                                     <div className={styles.nlinkIn}>
    //                                                       {link?.icon && (
    //                                                         <div className={styles.nlimage}>
    //                                                           <Image src={getImageUrl(link.icon)} alt={link.name} width={50} height={50} />
    //                                                         </div>
    //                                                       )}
    //                                                       <div className={styles.nlContent}>
    //                                                         <p className={styles.navLabel}>{link?.name}</p>
    //                                                         <p className={styles.navDesc}>{link?.description}</p>
    //                                                       </div>
    //                                                     </div>
    //                                                   </Link>
    //                                                 </li>
    //                                               ))}
    //                                             </ul>
    //                                           </li>
    //                                         ))}
    //                                       </ul>
    //                                     </div>

    //                                     {/* Right Side Banner Image */}
    //                                     <div className={styles.ddiRight}>
    //                                       {activeImage ? (
    //                                         <Image src={activeImage} alt="Active Image" width={600} height={400} style={{ width: "100%", height: "auto" }} />
    //                                       ) : (
    //                                         <p>No Image</p>
    //                                       )}
    //                                     </div>
    //                                   </div>
    //                                 </div>
    //                               )}
    //                             </li>
    //                           ))}
    //                         </ul>
    //                         {ctaButton && (
    //                         <div className={styles.navbutton}>
    //                             <Link 
    //                                 href={ctaButton.url || "/"} 
    //                                 className="customButton"
    //                                 onClick={handleLinkClick}
    //                             >
    //                                 <span>{ctaButton.title}</span>
    //                             </Link>
    //                         </div>
    //                     )}
    //                   </div>

    //                 <div className={styles.navbuttonWrap}>
    //                     {/* Call-to-Action Button */}
    //                     {ctaButton && (
    //                         <div className={styles.navbutton}>
    //                             <Link 
    //                                 href={ctaButton.url || "/"} 
    //                                 className="customButton"
    //                                 onClick={handleLinkClick}
    //                             >
    //                                 <span>{ctaButton.title}</span>
    //                             </Link>
    //                         </div>
    //                     )}

    //                     {/* Header Hamburger */}
    //                     <div className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`} onClick={toggleMenu}>
    //                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fff" className={styles.hamIcon}>
    //                             <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
    //                         </svg>
    //                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fff" className={styles.crossIcon}>
    //                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
    //                         </svg>                      
    //                     </div>
    //                 </div>
                    
    //             </div>
    //         </div>
    //     </header>
    // );
}