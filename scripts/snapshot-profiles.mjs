import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { snapshotProfiles } from "./snapshot-profile-config.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, "..");
const automationRoot = path.resolve(root, "..", "Automation Core");
const enginePath = path.join(automationRoot, "scripts", "snapshot-engine.js");
const outputDir = "C:/Users/pshic_/OneDrive/Desktop/📸 Verse Detector GPT Snapshot";
const args = process.argv.slice(2);
const showSizes = args.includes("--sizes");
const profileName = args.find((arg) => !arg.startsWith("--"));

function profileArtifacts(name, profile) {
  if (!profile.artifacts) return [{ name, ...profile }];
  return profile.artifacts.map((artifact) => ({ flags: profile.flags || [], ...artifact }));
}

function printProfiles() {
  console.log("Available Verse Detector snapshot templates:\n");
  for (const [name, profile] of Object.entries(snapshotProfiles)) {
    const count = profileArtifacts(name, profile).length;
    console.log(`  ${name.padEnd(12)} ${profile.description} (${count} focused files)`);
  }
  console.log("\nRun: npm run snapshot:template -- <name>");
  console.log("Size preview: npm run snapshot:sizes");
}

async function loadEngine() {
  if (!fs.existsSync(enginePath)) {
    throw new Error(`Automation Core snapshot engine not found: ${enginePath}`);
  }
  return await import(pathToFileURL(enginePath).href);
}

async function runArtifact(runSnapshot, artifact, extraFlags = []) {
  return await runSnapshot({
    root,
    rawArgs: [`--profile=${artifact.name}`, ...extraFlags, ...(artifact.flags || []), ...artifact.paths],
    outputDir,
    filePrefix: "verse-detector",
    projectLabel: "VERSE DETECTOR",
    source: "verse-detector-snapshot",
  });
}

async function measureProfile(runSnapshot, name, profile) {
  const artifacts = [];
  for (const artifact of profileArtifacts(name, profile)) {
    const originalLog = console.log;
    let json = "";
    console.log = (value) => { json += String(value); };
    try {
      await runArtifact(runSnapshot, artifact, ["--measure-only", "--json"]);
    } finally {
      console.log = originalLog;
    }
    artifacts.push(JSON.parse(json));
  }
  return artifacts;
}

if (!profileName && !showSizes) {
  printProfiles();
} else {
  const { runSnapshot } = await loadEngine();
  const selected = profileName ? snapshotProfiles[profileName] : null;
  if (profileName && !selected) {
    console.error(`Unknown snapshot template: ${profileName}`);
    printProfiles();
    process.exitCode = 1;
  } else if (showSizes) {
    console.log("Verse Detector snapshot size preview (nothing written or attached):\n");
    for (const [name, profile] of Object.entries(snapshotProfiles)) {
      const artifacts = await measureProfile(runSnapshot, name, profile);
      console.log(`${name} (${artifacts.length} focused files)`);
      for (const artifact of artifacts) {
        console.log(`  ${artifact.profile.padEnd(26)} ${String(artifact.files).padStart(3)} files  ${artifact.chars.toLocaleString().padStart(9)} chars  ~${artifact.estimatedTokens.toLocaleString()} tokens`);
      }
    }
  } else {
    const passthrough = args.filter((arg) => arg.startsWith("--"));
    const artifacts = profileArtifacts(profileName, selected);
    console.log(`Creating ${profileName} snapshot bundle (${artifacts.length} focused files)...\n`);
    for (const artifact of artifacts) {
      const status = await runArtifact(runSnapshot, artifact, passthrough);
      if (status !== 0) {
        process.exitCode = status;
        break;
      }
    }
  }
}
