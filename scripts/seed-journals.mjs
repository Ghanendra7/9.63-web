import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { LexoRank } from "../studio/node_modules/lexorank/lib/index.js";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      env[match[1]] = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
    }
  }
  return env;
}

const env = loadEnv();
const projectId = env.PUBLIC_SANITY_PROJECT_ID || "0jfix9cd";
const dataset = env.PUBLIC_SANITY_DATASET || "production";
const token = env.SANITY_API_TOKEN;

if (!token) {
  console.error("Missing SANITY_API_TOKEN in .env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-01",
  token,
  useCdn: false,
});

async function seedJournals() {
  console.log(`Connected to Sanity: ${projectId} (${dataset})`);

  const existingAssets = await client.fetch(
    '*[_type == "sanity.imageAsset"] | order(_createdAt desc) {_id, originalFilename}'
  );

  if (!existingAssets || existingAssets.length === 0) {
    console.error("No image assets found in Sanity. Run seed-sanity.mjs first.");
    process.exit(1);
  }

  const pickImages = (startIdx, count) => {
    const imgs = [];
    for (let i = 0; i < count; i++) {
      const asset = existingAssets[(startIdx + i) % existingAssets.length];
      imgs.push({
        _key: `img-${startIdx}-${i}`,
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: `Journal visual ${i + 1}`,
      });
    }
    return imgs;
  };

  const entries = [
    {
      _id: "journal-33",
      _type: "journal",
      title: "OFF Brand: Why you still need a website",
      excerpt:
        "Notes on building dedicated digital spaces outside social platforms, where typography, pacing, and visual systems can hold attention without algorithmic noise.",
      categories: ["In Another Form", "Editorial"],
      images: pickImages(0, 5),
    },
    {
      _id: "journal-32",
      _type: "journal",
      title: "Notes on Editorial Restraint",
      excerpt:
        "Exploring how negative space, quiet typographic hierarchy, and tactile paper stocks shape the rhythm of contemporary independent print publications.",
      categories: ["Editorial"],
      images: pickImages(3, 5),
    },
    {
      _id: "journal-31",
      _type: "journal",
      title: "Studio Conversation: Form & Material",
      excerpt:
        "A short reflection from our recent press feature discussing interdisciplinary collaboration across spatial design, photography, and digital craft.",
      categories: ["Press & Feature"],
      images: pickImages(6, 5),
    },
    {
      _id: "journal-30",
      _type: "journal",
      title: "Identity Systems in Motion",
      excerpt:
        "Case study fragments examining how modular grids and flexible brand marks adapt across packaging, exhibition signage, and web interfaces.",
      categories: ["Brand Identity", "Case Study"],
      images: pickImages(9, 4),
    },
    {
      _id: "journal-29",
      _type: "journal",
      title: "Print Proofing Archive 04",
      excerpt:
        "Behind the scenes of color calibration, uncoated stock selection, and binding tests for our upcoming seasonal monograph series.",
      categories: ["Editorial or Print"],
      images: pickImages(2, 4),
    },
    {
      _id: "journal-28",
      _type: "journal",
      title: "Positioning Beyond Categories",
      excerpt:
        "Observations on helping emerging cultural and design-led studios articulate clear strategic narratives rooted in craft rather than trends.",
      categories: ["Brand Positioning"],
      images: pickImages(5, 4),
    },
    {
      _id: "journal-27",
      _type: "journal",
      title: "Minimal Interfaces & Slow Reading",
      excerpt:
        "Designing web experiences that prioritize clarity, subtle motion transitions, and uninterrupted visual storytelling across desktop and mobile.",
      categories: ["Digital Design"],
      images: pickImages(8, 4),
    },
    {
      _id: "journal-26",
      _type: "journal",
      title: "Selected Works: Autumn Direction",
      excerpt:
        "A brief spotlight on recent art direction studies pairing architectural interiors with candid portraiture and natural daylight.",
      categories: ["Case Study"],
      images: pickImages(11, 4),
    },
    {
      _id: "journal-25",
      _type: "journal",
      title: "Spotlight: Spatial Objects",
      excerpt:
        "Documenting collaborative object studies and exhibition previews developed alongside independent makers and ceramicists in New York.",
      categories: ["Project Spotlights"],
      images: pickImages(1, 4),
    },
  ];

  let rank = LexoRank.middle();
  for (const entry of entries) {
    entry.orderRank = rank.toString();
    rank = rank.genNext();
  }

  const tx = client.transaction();
  for (const entry of entries) {
    tx.createOrReplace(entry);
  }
  await tx.commit();
  console.log(`Successfully seeded ${entries.length} journal entries in Sanity!`);
}

seedJournals().catch((err) => {
  console.error("Journal seeding failed:", err);
  process.exit(1);
});
