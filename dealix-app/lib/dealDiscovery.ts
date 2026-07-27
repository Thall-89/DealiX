import type { NormalizedListing } from "@/lib/marketplaces";
import type { DealOpportunity } from "@/types";

export function dealFromNormalizedListing(listing: NormalizedListing): DealOpportunity {
  return { id: `${listing.providerId}:${listing.externalId}`, providerId: listing.providerId, externalListingId: listing.externalId, title: listing.title, marketplace: listing.marketplace, listingType: "Part", category: listing.category ?? "Other Parts", sourceType: "Live", askingPrice: listing.price, shipping: listing.shipping, estimatedTax: listing.taxes, condition: listing.condition, sellerName: listing.seller?.name, sellerRating: listing.seller?.rating, listingUrl: listing.url, imageUrl: listing.images[0], location: listing.location, offersEnabled: listing.offersEnabled, returnPolicy: listing.returnPolicy, dateFound: listing.foundAt, lastChecked: listing.updatedAt ?? listing.foundAt, compatibility: "Unknown" };
}
