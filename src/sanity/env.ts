export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const sanityApiVersion = "2025-03-01";

export const hasSanityConfig =
  Boolean(sanityProjectId) && Boolean(sanityDataset);
