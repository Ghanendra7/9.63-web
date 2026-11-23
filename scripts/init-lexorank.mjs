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

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-01",
  token,
  useCdn: false,
});

async function run() {
  const rawProjects = await client.fetch('*[_type == "project"]');
  const projects = rawProjects.sort((a, b) => {
    const numA = parseInt(a._id.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b._id.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });
  console.log(`Found ${projects.length} projects`);

  let currentRank = LexoRank.middle();
  const total = projects.length;

  for (let i = 0; i < total; i++) {
    const project = projects[i];
    const rankStr = currentRank.toString();
    const num = i + 1;
    const numPill = String(num).padStart(2, "0");
    const countDisplay = `${num}/${total}`;

    console.log(`Updating ${project._id} -> orderRank: ${rankStr}, projectNumber: ${numPill}, slideCount: ${countDisplay}`);

    await client
      .patch(project._id)
      .set({
        orderRank: rankStr,
        projectNumber: numPill,
        slideCount: countDisplay,
      })
      .commit();

    currentRank = currentRank.genNext();
  }

  console.log("All projects updated with lexorank and sequential numbers.");
}

run().catch(console.error);
