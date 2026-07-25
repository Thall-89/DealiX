import type { Build, ListingMarketplace } from "@/types";

function entered(value?: string) { return value && value !== "Not entered" ? value : undefined; }
function section(title: string, lines: string[]) { return lines.length ? `${title}\n${lines.join("\n")}\n` : ""; }

export function generateListing(build: Build, marketplace: ListingMarketplace) {
  const specs = [["CPU", entered(build.cpu)], ["GPU", entered(build.gpu)], ["Motherboard", entered(build.motherboard)], ["Memory", entered(build.ram)], ["Storage", entered(build.storage)], ["Power supply", entered(build.psu)], ["Case", entered(build.case)], ["Cooling", entered(build.cooling)], ["Operating system", entered(build.os)], ["Windows activation", entered(build.windowsActivation)]].filter((entry): entry is [string, string] => Boolean(entry[1])).map(([label, value]) => `- ${label}: ${value}`);
  const testing = build.benchmarking ? [["Testing status", entered(build.benchmarking.status)], ["Cinebench", entered(build.benchmarking.cinebench)], ["3DMark", entered(build.benchmarking.threeDMark)], ["CrystalDiskMark", entered(build.benchmarking.crystalDiskMark)], ["CPU load temperature", entered(build.benchmarking.cpuLoadTemp)], ["GPU load temperature", entered(build.benchmarking.gpuLoadTemp)]].filter((entry): entry is [string, string] => Boolean(entry[1])).map(([label, value]) => `- ${label}: ${value}`) : [];
  const completed = (build.workCompleted ?? []).map((item) => `- ${item}`);
  const accessories = entered(build.accessories) ? [`- ${build.accessories}`] : [];
  const pickupNote = marketplace === "eBay" ? "Shipping is available where selected in the listing." : marketplace === "Craigslist" ? "Local pickup details can be discussed directly." : "Pickup and shipping details can be discussed before purchase.";
  const title = `${build.name}${build.listingPrice ? ` - $${build.listingPrice.toFixed(2)}` : ""}`;
  const content = [title, "", section("Overview", [`This ${build.name} is described using the recorded build information.`, entered(build.notes) ?? "Additional build notes have not been entered."]), section("Full Specifications", specs), section("Condition", ["Condition details are reflected in the recorded build notes and testing information."]), section("Testing Performed", testing.length ? testing : ["Testing details have not been entered."]), section("Upgrades", completed.length ? completed : ["No upgrade details have been entered."]), section("What's Included", accessories.length ? accessories : ["Included accessories have not been entered."]), section("Why This PC Is Great", ["The recorded hardware and testing information are presented clearly for an informed buyer."]), section("Price", [build.listingPrice ? `$${build.listingPrice.toFixed(2)}` : "Price has not been entered."]), section("Pickup / Shipping Notes", [pickupNote])].filter(Boolean).join("\n").trim();
  return { title, content };
}
