export interface AccentPresetItem {
  id: string;
  name: string;
  group: 'SIGNATURE' | 'NEON' | 'BLUE' | 'GREEN' | 'WARM' | 'PINK' | 'PURPLE' | 'LUXURY' | 'NEUTRAL';
  dark: string;
  light: string;
}

export const ACCENT_GROUPS = [
  {
    "id": "SIGNATURE",
    "label": "Signature & Core"
  },
  {
    "id": "NEON",
    "label": "Neon & Cyberpunk"
  },
  {
    "id": "BLUE",
    "label": "Blues & Azures"
  },
  {
    "id": "GREEN",
    "label": "Greens & Teals"
  },
  {
    "id": "WARM",
    "label": "Warms & Ambers"
  },
  {
    "id": "PINK",
    "label": "Pinks & Roses"
  },
  {
    "id": "PURPLE",
    "label": "Purples & Violets"
  },
  {
    "id": "LUXURY",
    "label": "Gold & Luxury"
  },
  {
    "id": "NEUTRAL",
    "label": "Neutrals & Monos"
  }
];

export const ACCENT_PRESETS: AccentPresetItem[] = [
  {
    "id": "VIOLET",
    "name": "Follow Theme (Violet)",
    "group": "SIGNATURE",
    "dark": "#8B7CFF",
    "light": "#4F46E5"
  },
  {
    "id": "AZURE",
    "name": "Azure Core",
    "group": "SIGNATURE",
    "dark": "#38BDF8",
    "light": "#0284C7"
  },
  {
    "id": "TEAL",
    "name": "Teal Pulse",
    "group": "SIGNATURE",
    "dark": "#2DD4BF",
    "light": "#0D9488"
  },
  {
    "id": "ROSE",
    "name": "Rose Petal",
    "group": "SIGNATURE",
    "dark": "#FB7185",
    "light": "#E11D48"
  },
  {
    "id": "AMBER",
    "name": "Warm Amber",
    "group": "SIGNATURE",
    "dark": "#FBBF24",
    "light": "#D97706"
  },
  {
    "id": "GRAPHITE",
    "name": "Graphite Mono",
    "group": "SIGNATURE",
    "dark": "#E2E8F0",
    "light": "#1E293B"
  },
  {
    "id": "EMERALD",
    "name": "Emerald Spark",
    "group": "SIGNATURE",
    "dark": "#34D399",
    "light": "#059669"
  },
  {
    "id": "INDIGO",
    "name": "Deep Indigo",
    "group": "SIGNATURE",
    "dark": "#818CF8",
    "light": "#4338CA"
  },
  {
    "id": "RUBY",
    "name": "Laser Ruby",
    "group": "SIGNATURE",
    "dark": "#F43F5E",
    "light": "#BE123C"
  },
  {
    "id": "CYAN_CORE",
    "name": "Electric Cyan",
    "group": "SIGNATURE",
    "dark": "#22D3EE",
    "light": "#0891B2"
  },
  {
    "id": "neon_cyan",
    "name": "Cyber Neon Cyan",
    "group": "NEON",
    "dark": "#00F5D4",
    "light": "#0D9488"
  },
  {
    "id": "neon_yellow",
    "name": "Night City Yellow",
    "group": "NEON",
    "dark": "#FFE600",
    "light": "#CA8A04"
  },
  {
    "id": "neon_magenta",
    "name": "Tokyo Magenta",
    "group": "NEON",
    "dark": "#FF007F",
    "light": "#BE185D"
  },
  {
    "id": "matrix_green",
    "name": "Digital Matrix Green",
    "group": "NEON",
    "dark": "#00FF66",
    "light": "#15803D"
  },
  {
    "id": "plasma_violet",
    "name": "Plasma Violet",
    "group": "NEON",
    "dark": "#B5179E",
    "light": "#7209B7"
  },
  {
    "id": "electric_lime",
    "name": "Volt Lime Neon",
    "group": "NEON",
    "dark": "#A7F432",
    "light": "#4D7C0F"
  },
  {
    "id": "synth_orange",
    "name": "Synthwave Orange",
    "group": "NEON",
    "dark": "#FF5E00",
    "light": "#EA580C"
  },
  {
    "id": "laser_pink",
    "name": "Laser Beam Pink",
    "group": "NEON",
    "dark": "#FF3864",
    "light": "#E11D48"
  },
  {
    "id": "quantum_blue",
    "name": "Quantum Blue Glow",
    "group": "NEON",
    "dark": "#00BBF9",
    "light": "#0284C7"
  },
  {
    "id": "acid_green",
    "name": "Acid Green Shock",
    "group": "NEON",
    "dark": "#70E000",
    "light": "#38B000"
  },
  {
    "id": "cyber_purple",
    "name": "Cyberpunk Purple",
    "group": "NEON",
    "dark": "#9D4EDD",
    "light": "#5A189A"
  },
  {
    "id": "hyper_red",
    "name": "Hyper Velocity Red",
    "group": "NEON",
    "dark": "#FF0054",
    "light": "#D90429"
  },
  {
    "id": "sky_500",
    "name": "Sky Cerulean",
    "group": "BLUE",
    "dark": "#38BDF8",
    "light": "#0284C7"
  },
  {
    "id": "blue_600",
    "name": "Cobalt Standard",
    "group": "BLUE",
    "dark": "#60A5FA",
    "light": "#2563EB"
  },
  {
    "id": "ocean_deep",
    "name": "Deep Sea Blue",
    "group": "BLUE",
    "dark": "#7DD3FC",
    "light": "#0369A1"
  },
  {
    "id": "sapphire",
    "name": "Sapphire Glow",
    "group": "BLUE",
    "dark": "#93C5FD",
    "light": "#1D4ED8"
  },
  {
    "id": "cyan_neon",
    "name": "Cyan Laser",
    "group": "BLUE",
    "dark": "#22D3EE",
    "light": "#0891B2"
  },
  {
    "id": "electric_blue",
    "name": "Electric Zap",
    "group": "BLUE",
    "dark": "#38BDF8",
    "light": "#0284C7"
  },
  {
    "id": "ice_blue",
    "name": "Glacier Ice",
    "group": "BLUE",
    "dark": "#BAE6FD",
    "light": "#0284C7"
  },
  {
    "id": "navy_bright",
    "name": "Royal Navy",
    "group": "BLUE",
    "dark": "#60A5FA",
    "light": "#1E40AF"
  },
  {
    "id": "slate_blue",
    "name": "Steel Horizon",
    "group": "BLUE",
    "dark": "#94A3B8",
    "light": "#334155"
  },
  {
    "id": "ultramarine",
    "name": "Ultramarine",
    "group": "BLUE",
    "dark": "#818CF8",
    "light": "#3730A3"
  },
  {
    "id": "marine",
    "name": "Marine Breeze",
    "group": "BLUE",
    "dark": "#67E8F9",
    "light": "#0E7490"
  },
  {
    "id": "powder_blue",
    "name": "Powder Blue",
    "group": "BLUE",
    "dark": "#A5F3FC",
    "light": "#0891B2"
  },
  {
    "id": "nordic_blue",
    "name": "Nordic Fjord Blue",
    "group": "BLUE",
    "dark": "#70A1FF",
    "light": "#1E90FF"
  },
  {
    "id": "berlin_blue",
    "name": "Prussian Blue",
    "group": "BLUE",
    "dark": "#4A90E2",
    "light": "#0B3C5D"
  },
  {
    "id": "emerald_core",
    "name": "Emerald Spark",
    "group": "GREEN",
    "dark": "#34D399",
    "light": "#059669"
  },
  {
    "id": "green_bright",
    "name": "Spring Meadow",
    "group": "GREEN",
    "dark": "#4ADE80",
    "light": "#16A34A"
  },
  {
    "id": "lime_laser",
    "name": "Lime Volt",
    "group": "GREEN",
    "dark": "#A3E635",
    "light": "#65A30D"
  },
  {
    "id": "mint_fresh",
    "name": "Fresh Mint",
    "group": "GREEN",
    "dark": "#6EE7B7",
    "light": "#0D9488"
  },
  {
    "id": "sage_leaf",
    "name": "Sage Leaf",
    "group": "GREEN",
    "dark": "#86EFAC",
    "light": "#15803D"
  },
  {
    "id": "forest_pine",
    "name": "Pine Needle",
    "group": "GREEN",
    "dark": "#6EE7B7",
    "light": "#047857"
  },
  {
    "id": "olive_warm",
    "name": "Warm Olive",
    "group": "GREEN",
    "dark": "#BEF264",
    "light": "#4D7C0F"
  },
  {
    "id": "seafoam_green",
    "name": "Seafoam Glimmer",
    "group": "GREEN",
    "dark": "#5EEAD4",
    "light": "#0F766E"
  },
  {
    "id": "jade_stone",
    "name": "Imperial Jade",
    "group": "GREEN",
    "dark": "#34D399",
    "light": "#065F46"
  },
  {
    "id": "moss_glow",
    "name": "Luminous Moss",
    "group": "GREEN",
    "dark": "#A7F3D0",
    "light": "#047857"
  },
  {
    "id": "chartreuse",
    "name": "Vibrant Chartreuse",
    "group": "GREEN",
    "dark": "#D9F99D",
    "light": "#4D7C0F"
  },
  {
    "id": "jungle_vine",
    "name": "Jungle Canopy",
    "group": "GREEN",
    "dark": "#4ADE80",
    "light": "#14532D"
  },
  {
    "id": "boreal_teal",
    "name": "Boreal Teal",
    "group": "GREEN",
    "dark": "#2DD4BF",
    "light": "#0F766E"
  },
  {
    "id": "malachite",
    "name": "Malachite Shimmer",
    "group": "GREEN",
    "dark": "#00F5D4",
    "light": "#059669"
  },
  {
    "id": "amber_sun",
    "name": "Sunbeam Gold",
    "group": "WARM",
    "dark": "#FBBF24",
    "light": "#D97706"
  },
  {
    "id": "orange_blaze",
    "name": "Flame Orange",
    "group": "WARM",
    "dark": "#FB923C",
    "light": "#EA580C"
  },
  {
    "id": "yellow_solar",
    "name": "Solar Flare",
    "group": "WARM",
    "dark": "#FDE047",
    "light": "#CA8A04"
  },
  {
    "id": "crimson_fire",
    "name": "Crimson Ember",
    "group": "WARM",
    "dark": "#F87171",
    "light": "#DC2626"
  },
  {
    "id": "terracotta",
    "name": "Terracotta Soil",
    "group": "WARM",
    "dark": "#FB923C",
    "light": "#9A3412"
  },
  {
    "id": "honey_drip",
    "name": "Wild Honey",
    "group": "WARM",
    "dark": "#FCD34D",
    "light": "#B45309"
  },
  {
    "id": "peach_glow",
    "name": "Warm Peach",
    "group": "WARM",
    "dark": "#FDBA74",
    "light": "#C2410C"
  },
  {
    "id": "rust_iron",
    "name": "Red Rust",
    "group": "WARM",
    "dark": "#FCA5A5",
    "light": "#991B1B"
  },
  {
    "id": "cinnamon_spice",
    "name": "Ceylon Cinnamon",
    "group": "WARM",
    "dark": "#FDBA74",
    "light": "#9A3412"
  },
  {
    "id": "marigold_sun",
    "name": "Marigold Day",
    "group": "WARM",
    "dark": "#FBBF24",
    "light": "#B45309"
  },
  {
    "id": "bronze_patina",
    "name": "Burnished Bronze",
    "group": "WARM",
    "dark": "#FDE68A",
    "light": "#854D0E"
  },
  {
    "id": "paprika",
    "name": "Smoked Paprika",
    "group": "WARM",
    "dark": "#F87171",
    "light": "#B91C1C"
  },
  {
    "id": "lava_orange",
    "name": "Molten Lava",
    "group": "WARM",
    "dark": "#FF7700",
    "light": "#E85D04"
  },
  {
    "id": "coral_reef",
    "name": "Coral Horizon",
    "group": "WARM",
    "dark": "#FF6B6B",
    "light": "#EE5253"
  },
  {
    "id": "rose_500",
    "name": "Dusty Rose",
    "group": "PINK",
    "dark": "#FB7185",
    "light": "#E11D48"
  },
  {
    "id": "pink_bright",
    "name": "Vibrant Magenta",
    "group": "PINK",
    "dark": "#F472B6",
    "light": "#DB2777"
  },
  {
    "id": "fuchsia_hot",
    "name": "Electric Fuchsia",
    "group": "PINK",
    "dark": "#E879F9",
    "light": "#C026D3"
  },
  {
    "id": "blush_soft",
    "name": "Petal Blush",
    "group": "PINK",
    "dark": "#FDA4AF",
    "light": "#BE123C"
  },
  {
    "id": "berry_wild",
    "name": "Wild Raspberry",
    "group": "PINK",
    "dark": "#F43F5E",
    "light": "#9F1239"
  },
  {
    "id": "flamingo",
    "name": "Flamingo Pink",
    "group": "PINK",
    "dark": "#FB7185",
    "light": "#BE185D"
  },
  {
    "id": "cherry_blossom",
    "name": "Sakura Blossom",
    "group": "PINK",
    "dark": "#FBCFE8",
    "light": "#DB2777"
  },
  {
    "id": "ruby_red",
    "name": "Garnet Ruby",
    "group": "PINK",
    "dark": "#FDA4AF",
    "light": "#E11D48"
  },
  {
    "id": "watermelon",
    "name": "Watermelon Crisp",
    "group": "PINK",
    "dark": "#FB7185",
    "light": "#BE123C"
  },
  {
    "id": "bubblegum",
    "name": "Bubblegum Sweet",
    "group": "PINK",
    "dark": "#F472B6",
    "light": "#9D174D"
  },
  {
    "id": "cyclamen",
    "name": "Alpine Cyclamen",
    "group": "PINK",
    "dark": "#E879F9",
    "light": "#A21CAF"
  },
  {
    "id": "camellia",
    "name": "Red Camellia",
    "group": "PINK",
    "dark": "#FDA4AF",
    "light": "#881337"
  },
  {
    "id": "violet_600",
    "name": "Royal Amethyst",
    "group": "PURPLE",
    "dark": "#A78BFA",
    "light": "#7C3AED"
  },
  {
    "id": "purple_bright",
    "name": "Cosmic Purple",
    "group": "PURPLE",
    "dark": "#C084FC",
    "light": "#9333EA"
  },
  {
    "id": "indigo_electric",
    "name": "Electric Indigo",
    "group": "PURPLE",
    "dark": "#818CF8",
    "light": "#4338CA"
  },
  {
    "id": "lavender_mist",
    "name": "Lavender Mist",
    "group": "PURPLE",
    "dark": "#DDD6FE",
    "light": "#6D28D9"
  },
  {
    "id": "plum_deep",
    "name": "Deep Damson Plum",
    "group": "PURPLE",
    "dark": "#C084FC",
    "light": "#581C87"
  },
  {
    "id": "orchid_bloom",
    "name": "Wild Orchid",
    "group": "PURPLE",
    "dark": "#E879F9",
    "light": "#7E22CE"
  },
  {
    "id": "grape_vine",
    "name": "Vintage Grape",
    "group": "PURPLE",
    "dark": "#A855F7",
    "light": "#6B21A8"
  },
  {
    "id": "iris_blue",
    "name": "Blue Iris",
    "group": "PURPLE",
    "dark": "#818CF8",
    "light": "#4F46E5"
  },
  {
    "id": "heather",
    "name": "Scottish Heather",
    "group": "PURPLE",
    "dark": "#C4B5FD",
    "light": "#6D28D9"
  },
  {
    "id": "byzantine",
    "name": "Imperial Byzantine",
    "group": "PURPLE",
    "dark": "#D8B4FE",
    "light": "#7E22CE"
  },
  {
    "id": "lilac_breeze",
    "name": "Lilac Breeze",
    "group": "PURPLE",
    "dark": "#E9D5FF",
    "light": "#9333EA"
  },
  {
    "id": "nightshade",
    "name": "Midnight Nightshade",
    "group": "PURPLE",
    "dark": "#A78BFA",
    "light": "#3B0764"
  },
  {
    "id": "gold_24k",
    "name": "24K Imperial Gold",
    "group": "LUXURY",
    "dark": "#E5B869",
    "light": "#B45309"
  },
  {
    "id": "champagne_sparkle",
    "name": "Vintage Champagne",
    "group": "LUXURY",
    "dark": "#F3D2B8",
    "light": "#A16207"
  },
  {
    "id": "rose_gold",
    "name": "Jeweler Rose Gold",
    "group": "LUXURY",
    "dark": "#F2A69A",
    "light": "#BE185D"
  },
  {
    "id": "platinum_sheen",
    "name": "Polished Platinum",
    "group": "LUXURY",
    "dark": "#E2E8F0",
    "light": "#475569"
  },
  {
    "id": "bronze_antique",
    "name": "Antique Bronze",
    "group": "LUXURY",
    "dark": "#DDA15E",
    "light": "#854D0E"
  },
  {
    "id": "brass_artisan",
    "name": "Artisan Brass",
    "group": "LUXURY",
    "dark": "#E9C46A",
    "light": "#9A6B1F"
  },
  {
    "id": "copper_gleam",
    "name": "Burnished Copper",
    "group": "LUXURY",
    "dark": "#F4A261",
    "light": "#BC6C25"
  },
  {
    "id": "slate_mid",
    "name": "Slate Balance",
    "group": "NEUTRAL",
    "dark": "#94A3B8",
    "light": "#475569"
  },
  {
    "id": "zinc_pure",
    "name": "Zinc Mineral",
    "group": "NEUTRAL",
    "dark": "#A1A1AA",
    "light": "#52525B"
  },
  {
    "id": "neutral_stone",
    "name": "River Stone",
    "group": "NEUTRAL",
    "dark": "#A3A3A3",
    "light": "#525252"
  },
  {
    "id": "stone_warm",
    "name": "Warm Granite",
    "group": "NEUTRAL",
    "dark": "#A8A29E",
    "light": "#57534E"
  },
  {
    "id": "ash_grey",
    "name": "Volcanic Ash",
    "group": "NEUTRAL",
    "dark": "#CBD5E1",
    "light": "#334155"
  },
  {
    "id": "silver_chrome",
    "name": "Silver Chrome",
    "group": "NEUTRAL",
    "dark": "#E2E8F0",
    "light": "#1E293B"
  },
  {
    "id": "smoke_screen",
    "name": "Dense Smoke",
    "group": "NEUTRAL",
    "dark": "#94A3B8",
    "light": "#1E293B"
  },
  {
    "id": "sand_dune",
    "name": "Fine Sand",
    "group": "NEUTRAL",
    "dark": "#D6D3D1",
    "light": "#78716C"
  },
  {
    "id": "pebble_wash",
    "name": "Polished Pebble",
    "group": "NEUTRAL",
    "dark": "#E7E5E4",
    "light": "#44403C"
  },
  {
    "id": "clay_earth",
    "name": "Raw Clay",
    "group": "NEUTRAL",
    "dark": "#D4D4D8",
    "light": "#3F3F46"
  },
  {
    "id": "obsidian_core",
    "name": "Obsidian Jet",
    "group": "NEUTRAL",
    "dark": "#F8FAFC",
    "light": "#0F172A"
  },
  {
    "id": "monochrome_pure",
    "name": "Pure Contrast",
    "group": "NEUTRAL",
    "dark": "#FFFFFF",
    "light": "#000000"
  }
];

export function getAccentById(id: string): AccentPresetItem {
  return ACCENT_PRESETS.find((a) => a.id === id) || ACCENT_PRESETS[0];
}
