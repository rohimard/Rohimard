import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { PRODUCT_LINES } from "@/lib/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/como-funciona", "/productos", "/inspiracion", "/corporate", "/crear"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = PRODUCT_LINES.map((product) => ({
    url: `${siteConfig.url}/productos/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
