import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Concept } from "@/components/home/Concept";
import { WhyDifferent } from "@/components/home/WhyDifferent";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { LaunchCampaign } from "@/components/home/LaunchCampaign";
import { SocialSection } from "@/components/home/SocialSection";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressCountry: "PE",
    },
    sameAs: [siteConfig.social.instagram, siteConfig.social.tiktok, siteConfig.social.facebook],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Concept />
      <WhyDifferent />
      <FeaturedProducts />
      <LaunchCampaign />
      <SocialSection />
    </>
  );
}
