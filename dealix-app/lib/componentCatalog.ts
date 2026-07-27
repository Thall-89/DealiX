export type CatalogCategory = "GPU" | "CPU" | "Motherboard" | "RAM" | "Storage" | "PSU" | "CPU Cooler" | "Case" | "Operating System" | "Accessories";

export type ComponentSpecs = {
  socket?: string;
  chipset?: string;
  ramGeneration?: "DDR4" | "DDR5";
  formFactor?: "ATX" | "Micro ATX" | "Mini ITX";
  supportedFormFactors?: Array<"ATX" | "Micro ATX" | "Mini ITX">;
  pcieVersion?: string;
  tdpWatts?: number;
  wattage?: number;
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  coolerHeightMm?: number;
  maxCoolerHeightMm?: number;
  capacityGb?: number;
};

export type CatalogComponent = { id: string; name: string; category: CatalogCategory; specs: ComponentSpecs; description: string };
const entry = (id: string, name: string, category: CatalogCategory, specs: ComponentSpecs, description: string): CatalogComponent => ({ id, name, category, specs, description });

export const componentCatalog: CatalogComponent[] = [
  entry("cpu-ryzen-5600", "AMD Ryzen 5 5600", "CPU", { socket: "AM4", ramGeneration: "DDR4", tdpWatts: 65 }, "6-core AM4 processor"),
  entry("cpu-ryzen-5700x3d", "AMD Ryzen 7 5700X3D", "CPU", { socket: "AM4", ramGeneration: "DDR4", tdpWatts: 105 }, "8-core AM4 gaming processor"),
  entry("cpu-ryzen-7600", "AMD Ryzen 5 7600", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 65 }, "6-core AM5 processor"),
  entry("cpu-ryzen-7700", "AMD Ryzen 7 7700", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 65 }, "8-core AM5 processor"),
  entry("cpu-ryzen-7700x", "AMD Ryzen 7 7700X", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 105 }, "8-core AM5 processor"),
  entry("cpu-ryzen-9600x", "AMD Ryzen 5 9600X", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 65 }, "6-core AM5 processor"),
  entry("cpu-ryzen-9700x", "AMD Ryzen 7 9700X", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 65 }, "8-core AM5 processor"),
  entry("cpu-ryzen-7800x3d", "AMD Ryzen 7 7800X3D", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 120 }, "8-core AM5 gaming processor"),
  entry("cpu-ryzen-9800x3d", "AMD Ryzen 7 9800X3D", "CPU", { socket: "AM5", ramGeneration: "DDR5", tdpWatts: 120 }, "8-core AM5 gaming processor"),
  entry("cpu-i5-12400f", "Intel Core i5-12400F", "CPU", { socket: "LGA1700", ramGeneration: "DDR4", tdpWatts: 65 }, "6-core Intel processor"),
  entry("cpu-i5-13600k", "Intel Core i5-13600K", "CPU", { socket: "LGA1700", ramGeneration: "DDR5", tdpWatts: 125 }, "14-core Intel processor"),
  entry("gpu-rtx-3060", "NVIDIA GeForce RTX 3060", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 170, gpuLengthMm: 242 }, "12GB graphics card"),
  entry("gpu-rtx-3070", "NVIDIA GeForce RTX 3070", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 220, gpuLengthMm: 242 }, "8GB graphics card"),
  entry("gpu-rtx-3080", "NVIDIA GeForce RTX 3080", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 320, gpuLengthMm: 285 }, "10GB graphics card"),
  entry("gpu-rtx-4060", "NVIDIA GeForce RTX 4060", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 115, gpuLengthMm: 200 }, "8GB graphics card"),
  entry("gpu-rtx-4070", "NVIDIA GeForce RTX 4070", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 200, gpuLengthMm: 244 }, "12GB graphics card"),
  entry("gpu-rtx-4070-super", "NVIDIA GeForce RTX 4070 Super", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 220, gpuLengthMm: 244 }, "12GB graphics card"),
  entry("gpu-rx-7800xt", "AMD Radeon RX 7800 XT", "GPU", { pcieVersion: "PCIe 4.0", tdpWatts: 263, gpuLengthMm: 267 }, "16GB graphics card"),
  entry("board-b650-atx", "AMD B650 ATX Motherboard", "Motherboard", { socket: "AM5", chipset: "B650", ramGeneration: "DDR5", formFactor: "ATX", pcieVersion: "PCIe 4.0" }, "AM5 DDR5 ATX board"),
  entry("board-b650m", "AMD B650M Micro ATX Motherboard", "Motherboard", { socket: "AM5", chipset: "B650", ramGeneration: "DDR5", formFactor: "Micro ATX", pcieVersion: "PCIe 4.0" }, "AM5 DDR5 Micro ATX board"),
  entry("board-b550-atx", "AMD B550 ATX Motherboard", "Motherboard", { socket: "AM4", chipset: "B550", ramGeneration: "DDR4", formFactor: "ATX", pcieVersion: "PCIe 4.0" }, "AM4 DDR4 ATX board"),
  entry("board-b760-atx", "Intel B760 ATX Motherboard", "Motherboard", { socket: "LGA1700", chipset: "B760", ramGeneration: "DDR5", formFactor: "ATX", pcieVersion: "PCIe 4.0" }, "Intel DDR5 ATX board"),
  entry("ram-ddr4-32", "32GB DDR4-3200 Memory Kit", "RAM", { ramGeneration: "DDR4", capacityGb: 32 }, "2 x 16GB desktop memory"),
  entry("ram-ddr5-32", "32GB DDR5-6000 Memory Kit", "RAM", { ramGeneration: "DDR5", capacityGb: 32 }, "2 x 16GB desktop memory"),
  entry("ram-ddr5-64", "64GB DDR5-6000 Memory Kit", "RAM", { ramGeneration: "DDR5", capacityGb: 64 }, "2 x 32GB desktop memory"),
  entry("storage-nvme-1tb", "1TB PCIe 4.0 NVMe SSD", "Storage", { pcieVersion: "PCIe 4.0", capacityGb: 1000 }, "M.2 NVMe storage"),
  entry("storage-nvme-2tb", "2TB PCIe 4.0 NVMe SSD", "Storage", { pcieVersion: "PCIe 4.0", capacityGb: 2000 }, "M.2 NVMe storage"),
  entry("storage-sata-1tb", "1TB SATA SSD", "Storage", { capacityGb: 1000 }, "2.5-inch SATA storage"),
  entry("psu-650", "650W 80+ Gold ATX Power Supply", "PSU", { wattage: 650 }, "Fully modular ATX power supply"),
  entry("psu-750", "750W 80+ Gold ATX Power Supply", "PSU", { wattage: 750 }, "Fully modular ATX power supply"),
  entry("psu-850", "850W 80+ Gold ATX Power Supply", "PSU", { wattage: 850 }, "Fully modular ATX power supply"),
  entry("cooler-120", "120mm Tower Air Cooler", "CPU Cooler", { supportedFormFactors: ["ATX", "Micro ATX", "Mini ITX"], coolerHeightMm: 155 }, "Tower air cooler with AM4, AM5 and LGA1700 support to verify"),
  entry("case-atx-airflow", "ATX Airflow Mid Tower Case", "Case", { supportedFormFactors: ["ATX", "Micro ATX", "Mini ITX"], maxGpuLengthMm: 360, maxCoolerHeightMm: 170 }, "Airflow-focused mid tower"),
  entry("case-matx-airflow", "Micro ATX Airflow Case", "Case", { supportedFormFactors: ["Micro ATX", "Mini ITX"], maxGpuLengthMm: 320, maxCoolerHeightMm: 160 }, "Compact airflow case"),
  entry("os-windows-11", "Windows 11 Home", "Operating System", {}, "Operating system license status must be confirmed"),
  entry("accessories-wifi", "Wi-Fi Antenna Set", "Accessories", {}, "Motherboard accessory"),
  entry("accessories-cables", "Display and Power Cable Set", "Accessories", {}, "Included-accessories checklist item"),
];

export function compatibleCatalog(category: CatalogCategory, selected: ComponentSpecs[]) {
  const selection = selected.reduce<ComponentSpecs>((all, specs) => ({ ...all, ...specs }), {});
  return componentCatalog.filter((component) => component.category === category && isCompatible(component.specs, selection));
}

export function catalogSpecsForName(category: CatalogCategory, name: string) {
  const normalized = name.toLowerCase();
  const match = componentCatalog.find((component) => component.category === category && (normalized.includes(component.name.toLowerCase().replace(/amd |nvidia |intel /g, "")) || component.name.toLowerCase().includes(normalized)));
  return match?.specs;
}

function isCompatible(candidate: ComponentSpecs, selected: ComponentSpecs) {
  if (candidate.socket && selected.socket && candidate.socket !== selected.socket) return false;
  if (candidate.ramGeneration && selected.ramGeneration && candidate.ramGeneration !== selected.ramGeneration) return false;
  if (candidate.formFactor && selected.supportedFormFactors && !selected.supportedFormFactors.includes(candidate.formFactor)) return false;
  if (candidate.supportedFormFactors && selected.formFactor && !candidate.supportedFormFactors.includes(selected.formFactor)) return false;
  if (candidate.gpuLengthMm && selected.maxGpuLengthMm && candidate.gpuLengthMm > selected.maxGpuLengthMm) return false;
  if (candidate.coolerHeightMm && selected.maxCoolerHeightMm && candidate.coolerHeightMm > selected.maxCoolerHeightMm) return false;
  return true;
}
