// Intentional native image: static hosts serve the JPEG directly, with no Next.js loader.
export function HeroImage() {
  return <img
    src="/images/hero-tool.jpg"
    alt="MRGNR/L external turning toolholder family, catalog photograph; representative configuration"
    width={434}
    height={290}
    loading="eager"
    fetchPriority="high"
    decoding="async"
    className="h-full w-full object-contain"
  />;
}
