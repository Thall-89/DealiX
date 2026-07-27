export const gpuFamilies = {
  NVIDIA: { "RTX 30-series": ["RTX 3050", "RTX 3060", "RTX 3060 Ti", "RTX 3070", "RTX 3070 Ti", "RTX 3080", "RTX 3080 Ti", "RTX 3090", "RTX 3090 Ti"], "RTX 40-series": ["RTX 4060", "RTX 4060 Ti", "RTX 4070", "RTX 4070 Super", "RTX 4070 Ti", "RTX 4070 Ti Super", "RTX 4080", "RTX 4080 Super", "RTX 4090"] },
  AMD: { "RX 500-series": ["RX 580"], "RX 5000-series": ["RX 5500 XT", "RX 5600 XT", "RX 5700", "RX 5700 XT"], "RX 6000-series": ["RX 6600", "RX 6600 XT", "RX 6650 XT", "RX 6700 XT", "RX 6750 XT", "RX 6800", "RX 6800 XT", "RX 6900 XT", "RX 6950 XT"], "RX 7000-series": ["RX 7600", "RX 7600 XT", "RX 7700 XT", "RX 7800 XT", "RX 7900 GRE", "RX 7900 XT", "RX 7900 XTX"] },
  Intel: { "Intel Arc": ["Arc A380", "Arc A580", "Arc A750", "Arc A770", "Arc B570", "Arc B580"] },
} as const;

export function gpuGenerationFor(text: string) {
  const normalized = text.toLowerCase();
  if (/rtx 30(50|60|70|80|90)/.test(normalized)) return "RTX 30-series";
  if (/rtx 40(60|70|80|90)/.test(normalized)) return "RTX 40-series";
  if (/rx 5\d{2}/.test(normalized)) return "RX 500-series";
  return "Other";
}

export interface DetectedGpu { manufacturer?: "NVIDIA" | "AMD" | "Intel"; series?: string; model?: string; confidence: "High" | "Medium" | "Low" | "Insufficient Data"; evidence: string[]; ambiguityWarning?: string; }

const normalized = (value: string) => value.toLowerCase().replace(/geforce|radeon|nvidia|amd|graphics card|gpu/g, "").replace(/[^a-z0-9]/g, "");
export function detectGpuFromTitle(title: string): DetectedGpu {
  const compact = normalized(title); const matches: Array<{ manufacturer: "NVIDIA" | "AMD" | "Intel"; series: string; model: string }> = [];
  (Object.entries(gpuFamilies) as Array<["NVIDIA" | "AMD" | "Intel", Record<string, readonly string[]>]>).forEach(([manufacturer, families]) => Object.entries(families).forEach(([series, models]) => models.forEach((model) => { if (compact.includes(normalized(model))) matches.push({ manufacturer, series, model }); })));
  if (matches.length === 1) return { ...matches[0], confidence: "High", evidence: [`Title normalized to ${matches[0].model}`] };
  if (matches.length > 1) return { confidence: "Low", evidence: matches.map((match) => match.model), ambiguityWarning: `More than one GPU model may match this title: ${matches.map((match) => match.model).join(", ")}.` };
  return { confidence: "Insufficient Data", evidence: [], ambiguityWarning: "A supported desktop GPU model could not be confidently identified." };
}
