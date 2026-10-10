export const getImageUrl = (image, format) => {
  try {
    if (!image || typeof image.url !== "string" || image.url.trim() === "") {
      return "/fallback-image.jpg";
    }

    const url = (format && image.formats?.[format]?.url) || image.url;

    if (url.startsWith("/")) {
      // Proxy through our own https origin so the browser never has to
      // fetch mixed content from the http-only Strapi backend.
      return `/api/image-proxy?path=${encodeURIComponent(url)}`;
    }

    const parsed = new URL(url);

    if (parsed.protocol === "https:") {
      return parsed.href;
    }

    return `/api/image-proxy?path=${encodeURIComponent(parsed.pathname + parsed.search)}`;
  } catch (error) {
    console.error("Error generating image URL:", error);
    return "/fallback-image.jpg";
  }
};
