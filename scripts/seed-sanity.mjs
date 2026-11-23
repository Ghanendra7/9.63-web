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

async function uploadImage(filePath, filename) {
  const stream = fs.createReadStream(filePath);
  const asset = await client.assets.upload("image", stream, { filename });
  return asset;
}

async function seed() {
  console.log(`Connected to Sanity: ${projectId} (${dataset})`);

  const files = {
    pd6: path.resolve("src/data/placeholders/pd6.png"),
    pd1: path.resolve("src/data/placeholders/pd1.png"),
    pd7: path.resolve("src/data/placeholders/pd7.png"),
    guglielmo3: path.resolve("src/data/placeholders/guglielmo3.png"),
    guglielmo4: path.resolve("src/data/placeholders/guglielmo4.png"),
    pd2: path.resolve("src/data/placeholders/pd2.png"),
    pd9: path.resolve("src/data/placeholders/pd9.png"),
    pd10: path.resolve("src/data/placeholders/pd10.png"),
  };

  const existingAssets = await client.fetch('*[_type == "sanity.imageAsset"]{_id, originalFilename}');
  const existingMap = new Map();
  for (const item of existingAssets) {
    if (item.originalFilename && !existingMap.has(item.originalFilename)) {
      existingMap.set(item.originalFilename, item._id);
    }
  }

  const assets = {};
  for (const [key, filepath] of Object.entries(files)) {
    const filename = `${key}.png`;
    if (existingMap.has(filename)) {
      assets[key] = { _id: existingMap.get(filename) };
      console.log(`Reusing existing asset: ${filename} -> ${assets[key]._id}`);
    } else if (fs.existsSync(filepath)) {
      console.log(`Uploading ${filename}...`);
      const uploaded = await uploadImage(filepath, filename);
      assets[key] = uploaded;
      console.log(`Uploaded ${filename} -> ${uploaded._id}`);
    }
  }

  const projects = [
    {
      _id: "project-1",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-1" },
      slideCount: "1/10",
      year: "2026",
      services: ["Visual Identity", "Art Direction"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd6?._id },
        alt: "Katherine Goguen editorial direction",
      },
      orderRank: 1,
    },
    {
      _id: "project-2",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-2" },
      comingSoon: true,
      slideCount: "1/10",
      year: "2026",
      services: ["Print", "Digital"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd1?._id },
        alt: "Katherine Goguen editorial preview",
      },
      orderRank: 2,
    },
    {
      _id: "project-3",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-3" },
      slideCount: "1/10",
      year: "2026",
      services: ["Brand Positioning"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd7?._id },
        alt: "Katherine Goguen branding",
      },
      orderRank: 3,
    },
    {
      _id: "project-4",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-4" },
      slideCount: "1/10",
      year: "2026",
      services: ["Art Direction"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd6?._id },
        alt: "Katherine Goguen visual direction",
      },
      orderRank: 4,
    },
    {
      _id: "project-5",
      _type: "project",
      title: "Guglielmo Profeti",
      client: "Website Direction",
      projectNumber: "34",
      slug: { _type: "slug", current: "guglielmo-profeti" },
      slideCount: "1/10",
      year: "2026",
      services: ["Digital Experience", "Creative Direction"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.guglielmo3?._id },
        alt: "Guglielmo Profeti Website Direction",
      },
      gallery: [
        {
          _type: "image",
          asset: { _type: "reference", _ref: assets.guglielmo4?._id },
          alt: "Guglielmo Profeti Slide 2",
        },
      ],
      orderRank: 5,
    },
    {
      _id: "project-6",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-5" },
      comingSoon: true,
      slideCount: "1/10",
      year: "2026",
      services: ["Brand Architecture"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd1?._id },
        alt: "Katherine Goguen portfolio",
      },
      gallery: [
        {
          _type: "image",
          asset: { _type: "reference", _ref: assets.pd2?._id },
          alt: "Katherine Goguen slide 2",
        },
      ],
      orderRank: 6,
    },
    {
      _id: "project-7",
      _type: "project",
      title: "In Another Form",
      client: "Edition 01",
      projectNumber: "01",
      slug: { _type: "slug", current: "in-another-form-01" },
      slideCount: "1/5",
      year: "2026",
      services: ["Editorial", "Print"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd9?._id },
        alt: "In Another Form Issue 01",
      },
      orderRank: 7,
    },
    {
      _id: "project-8",
      _type: "project",
      title: "Lisa Liu",
      client: "Next Drop",
      projectNumber: "02",
      slug: { _type: "slug", current: "lisa-liu" },
      comingSoon: true,
      slideCount: "1/4",
      year: "2026",
      services: ["Art Direction", "Exhibition"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd10?._id },
        alt: "Lisa Liu Coming Soon",
      },
      orderRank: 8,
    },
    {
      _id: "project-9",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-6" },
      slideCount: "1/10",
      year: "2026",
      services: ["Art Direction", "Editorial"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd7?._id },
        alt: "Katherine Goguen Editorial",
      },
      orderRank: 9,
    },
    {
      _id: "project-10",
      _type: "project",
      title: "Guglielmo Profeti",
      client: "Website Direction",
      projectNumber: "34",
      slug: { _type: "slug", current: "guglielmo-profeti-2" },
      slideCount: "1/10",
      year: "2026",
      services: ["Digital Experience", "Design System"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.guglielmo4?._id },
        alt: "Guglielmo Profeti Digital",
      },
      orderRank: 10,
    },
    {
      _id: "project-11",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-7" },
      comingSoon: true,
      slideCount: "1/10",
      year: "2026",
      services: ["Identity", "Digital"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd2?._id },
        alt: "Katherine Goguen Identity",
      },
      orderRank: 11,
    },
    {
      _id: "project-12",
      _type: "project",
      title: "Lisa Liu",
      client: "Next Drop",
      projectNumber: "02",
      slug: { _type: "slug", current: "lisa-liu-2" },
      slideCount: "1/4",
      year: "2026",
      services: ["Visual Identity", "Photography"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd10?._id },
        alt: "Lisa Liu Photography",
      },
      orderRank: 12,
    },
    {
      _id: "project-13",
      _type: "project",
      title: "In Another Form",
      client: "Edition 01",
      projectNumber: "01",
      slug: { _type: "slug", current: "in-another-form-02" },
      slideCount: "1/5",
      year: "2026",
      services: ["Editorial", "Print Design"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd9?._id },
        alt: "In Another Form Print",
      },
      orderRank: 13,
    },
    {
      _id: "project-14",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-8" },
      slideCount: "1/10",
      year: "2026",
      services: ["Visual Identity", "Art Direction"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd6?._id },
        alt: "Katherine Goguen Visual Identity",
      },
      orderRank: 14,
    },
    {
      _id: "project-15",
      _type: "project",
      title: "Guglielmo Profeti",
      client: "Website Direction",
      projectNumber: "34",
      slug: { _type: "slug", current: "guglielmo-profeti-3" },
      slideCount: "1/10",
      year: "2026",
      services: ["Digital Experience", "Creative Direction"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.guglielmo3?._id },
        alt: "Guglielmo Profeti Direction",
      },
      orderRank: 15,
    },
    {
      _id: "project-16",
      _type: "project",
      title: "Katherine Goguen",
      client: "V.Magazine",
      projectNumber: "34",
      slug: { _type: "slug", current: "katherine-goguen-9" },
      comingSoon: true,
      slideCount: "1/10",
      year: "2026",
      services: ["Print", "Editorial"],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assets.pd1?._id },
        alt: "Katherine Goguen Editorial",
      },
      orderRank: 16,
    },
  ];

  console.log("Writing project documents...");
  let rank = LexoRank.middle();
  for (let i = 0; i < projects.length; i++) {
    const num = i + 1;
    projects[i].projectNumber = String(num).padStart(2, "0");
    projects[i].slideCount = `${num}/${projects.length}`;
    projects[i].orderRank = rank.toString();
    rank = rank.genNext();
  }

  const tx = client.transaction();
  for (const proj of projects) {
    tx.createOrReplace(proj);
  }
  await tx.commit();
  console.log(`Successfully created/updated ${projects.length} projects in Sanity!`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
