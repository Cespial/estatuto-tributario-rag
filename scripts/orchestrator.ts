/**
 * Pipeline Master Orchestrator
 *
 * Runs the complete scraping → graph → chunking → embedding → enrichment pipeline.
 * Each phase can be run independently or as part of the full pipeline.
 *
 * Usage:
 *   npx tsx scripts/orchestrator.ts              # Run all phases
 *   npx tsx scripts/orchestrator.ts phase0        # Run only Phase 0
 *   npx tsx scripts/orchestrator.ts phase1        # Run only Phase 1
 *   npx tsx scripts/orchestrator.ts phase5        # Run only Phase 5
 *   npx tsx scripts/orchestrator.ts phase0,phase1  # Run specific phases
 */

import { execSync } from "child_process";

interface Phase {
  id: string;
  name: string;
  commands: string[];
  dependsOn: string[];
}

const PHASES: Phase[] = [
  {
    id: "phase0",
    name: "Phase 0: Extract Graph Seed + Compute Metrics",
    commands: [
      "npx tsx scripts/graph/extract-references.ts",
      "npx tsx scripts/graph/compute-metrics.ts",
    ],
    dependsOn: [],
  },
  {
    id: "phase1",
    name: "Phase 1: Scrape DIAN Doctrina",
    commands: [
      "npx tsx scripts/scraping/scrapers/dian-doctrina.ts",
      "npx tsx scripts/scraping/scrapers/cijuf-doctrina.ts",
    ],
    dependsOn: ["phase0"],
  },
  {
    id: "phase2",
    name: "Phase 2: Scrape Jurisprudencia",
    commands: [
      "npx tsx scripts/scraping/scrapers/corte-constitucional.ts",
      "npx tsx scripts/scraping/scrapers/consejo-estado.ts",
    ],
    dependsOn: ["phase0"],
  },
  {
    id: "phase3",
    name: "Phase 3: Scrape Decretos Reglamentarios",
    commands: ["npx tsx scripts/scraping/scrapers/suin-decretos.ts"],
    dependsOn: [],
  },
  {
    id: "phase4",
    name: "Phase 4: Scrape Leyes + Resoluciones",
    commands: [
      "npx tsx scripts/scraping/scrapers/senado-leyes.ts",
      "npx tsx scripts/scraping/scrapers/dian-resoluciones.ts",
    ],
    dependsOn: [],
  },
  {
    id: "phase5",
    name: "Phase 5: Chunk + Embed + Upsert to Pinecone",
    commands: [
      "npx tsx scripts/embedding/upsert-pinecone.ts doctrina",
      "npx tsx scripts/embedding/upsert-pinecone.ts jurisprudencia",
      "npx tsx scripts/embedding/upsert-pinecone.ts decretos",
      "npx tsx scripts/embedding/upsert-pinecone.ts resoluciones",
    ],
    dependsOn: ["phase1", "phase2", "phase3", "phase4"],
  },
  {
    id: "phase7",
    name: "Phase 7: Backfill Articles + Rebuild Analytics",
    commands: [
      "npx tsx scripts/enrichment/backfill-articles.ts",
      "node scripts/build-analytics-datasets.mjs",
    ],
    dependsOn: ["phase5"],
  },
  {
    id: "validate",
    name: "Validation: Verify Pinecone Namespaces",
    commands: ["npx tsx scripts/embedding/validate-upsert.ts"],
    dependsOn: ["phase5"],
  },
];

function runCommand(cmd: string): boolean {
  console.log(`\n  $ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
    return true;
  } catch (error) {
    console.error(`  ✗ Command failed: ${cmd}`);
    return false;
  }
}

function runPhase(phase: Phase): boolean {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`▶ ${phase.name}`);
  console.log(`${"=".repeat(60)}`);

  for (const cmd of phase.commands) {
    if (!runCommand(cmd)) {
      console.error(`\n✗ ${phase.name} FAILED`);
      return false;
    }
  }

  console.log(`\n✓ ${phase.name} COMPLETE`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const startTime = Date.now();

  let selectedPhaseIds: string[];

  if (args.length === 0) {
    // Run all phases
    selectedPhaseIds = PHASES.map((p) => p.id);
  } else {
    // Run specified phases
    selectedPhaseIds = args[0].split(",").map((s) => s.trim());
  }

  const selectedPhases = PHASES.filter((p) =>
    selectedPhaseIds.includes(p.id)
  );

  if (selectedPhases.length === 0) {
    console.error(
      `No valid phases found. Available: ${PHASES.map((p) => p.id).join(", ")}`
    );
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  SuperApp Tributaria — Pipeline Orchestrator             ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\nPhases to run: ${selectedPhases.map((p) => p.id).join(", ")}`);

  const completedPhases = new Set<string>();
  let failures = 0;

  for (const phase of selectedPhases) {
    // Check dependencies
    const unmetDeps = phase.dependsOn.filter(
      (dep) =>
        selectedPhaseIds.includes(dep) && !completedPhases.has(dep)
    );

    if (unmetDeps.length > 0) {
      console.warn(
        `\n⚠ Skipping ${phase.id}: unmet dependencies: ${unmetDeps.join(", ")}`
      );
      continue;
    }

    const success = runPhase(phase);
    if (success) {
      completedPhases.add(phase.id);
    } else {
      failures++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `Pipeline complete in ${elapsed}s — ${completedPhases.size} passed, ${failures} failed`
  );
  console.log(`${"=".repeat(60)}`);

  if (failures > 0) process.exit(1);
}

main();
