// "use client";

// import { useEffect } from "react";
// import Lenis from "lenis";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// const LenisProvider = ({ children }) => {
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);

//     const lenis = new Lenis({
//       duration: 1.2,
//       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//       smooth: true,
//     });

//     lenis.on("scroll", ScrollTrigger.update);

//     const onTick = (time) => lenis.raf(time * 1000);
//     gsap.ticker.add(onTick);
//     gsap.ticker.lagSmoothing(0);

//     return () => {
//       lenis.destroy();
//       gsap.ticker.remove(onTick);
//     };
//   }, []);

//   return <>{children}</>;
// };

// export default LenisProvider;
