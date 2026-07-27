import { describe, expect, it } from "vitest";
import { dealFromNormalizedListing } from "../lib/dealDiscovery";
import type { NormalizedListing } from "../lib/marketplaces/types";

describe("normalized listing ingestion", () => {
  it("retains provider identity and does not turn discovery into a saved decision", () => {
    const listing: NormalizedListing = { providerId: "ebay", externalId: "v1|123|0", marketplace: "eBay", title: "RTX 4060", price: 250, shipping: 15, seller: { name: "trusted-seller", rating: 4.9 }, condition: "Used", images: ["https://example.com/listing.jpg"], category: "GPU", foundAt: "2026-07-26T00:00:00.000Z", location: "Boston", returnPolicy: "Returns accepted" };
    const deal = dealFromNormalizedListing(listing);
    expect(deal).toMatchObject({ id: "ebay:v1|123|0", providerId: "ebay", externalListingId: "v1|123|0", sourceType: "Live", askingPrice: 250, shipping: 15, sellerName: "trusted-seller", compatibility: "Unknown" });
    expect(deal.saved).toBeUndefined();
    expect(deal.dismissed).toBeUndefined();
  });
});
