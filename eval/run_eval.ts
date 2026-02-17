import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { enhanceQuery } from "../src/lib/rag/query-enhancer";
import { retrieve } from "../src/lib/rag/retriever";
import { heuristicRerank } from "../src/lib/rag/reranker";
import { assembleContext, buildContextString } from "../src/lib/rag/context-assembler";
import { computeRetrievalMetrics, RetrievalMetrics } from "./metrics/retrieval";
import {
  citationAccuracy,
  sourcePresence,
  answerContainsExpected,
} from "./metrics/answer-quality";
import { EXPERIMENT_GRID, ExperimentConfig } from "./experiments/config-grid";
import { RAG_CONFIG } from "../src/config/constants";

interface EvalQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  expected_articles: string[];
  expected_chunk_types: string[];
  expected_answer_contains: string[];
}

interface EvalResult {
  questionId: string;
  question: string;
  category: string;
  retrievalMetrics: RetrievalMetrics;
  citationAcc: number;
  sourcePresenceScore: number;
  containsExpected: number;
  numChunksRetrieved: number;
  numArticlesInContext: number;
  timestamp: string;
}

interface ExperimentResult {
  experiment: string;
  config: ExperimentConfig;
  results: EvalResult[];
  aggregated: {
    avgPrecisionAt5: number;
    avgRecallAt5: number;
    avgMRR: number;
    avgNDCGAt5: number;
    avgCitationAcc: number;
    avgSourcePresence: number;
    avgContainsExpected: number;
  };
  timestamp: string;
}

async function runSingleQuestion(
  question: EvalQuestion,
  experimentConfig: ExperimentConfig
): Promise<EvalResult> {
  const mergedConfig = { ...RAG_CONFIG, ...experimentConfig.ragConfig };

  // 1. Enhance query
  const enhanced = await enhanceQuery(question.question, {
    useHyDE: mergedConfig.useHyDE,
    useQueryExpansion: mergedConfig.useQueryExpansion,
  });

  // 2. Retrieve
  const { chunks } = await retrieve(enhanced, {
    topK: mergedConfig.topK,
    similarityThreshold: mergedConfig.similarityThreshold,
  });

  // 3. Retrieval metrics
  const retrievalMetrics = computeRetrievalMetrics(
    chunks,
    question.expected_articles
  );

  // 4. Rerank
  const reranked = heuristicRerank(chunks, enhanced, mergedConfig.maxRerankedResults);

  // 5. Assemble context
  const context = await assembleContext(reranked, {
    useSiblingRetrieval: mergedConfig.useSiblingRetrieval,
    maxTokens: mergedConfig.maxContextTokens,
  });

  // 6. Simple metrics (no LLM call for speed)
  const contextString = buildContextString(context);
  const citationAcc = citationAccuracy(
    contextString,
    question.expected_articles
  );
  const sourcePresenceScore = sourcePresence(
    context.sources,
    question.expected_articles
  );
  const containsExpected = answerContainsExpected(
    contextString,
    question.expected_answer_contains
  );

  return {
    questionId: question.id,
    question: question.question,
    category: question.category,
    retrievalMetrics,
    citationAcc,
    sourcePresenceScore,
    containsExpected,
    numChunksRetrieved: chunks.length,
    numArticlesInContext: context.articles.length,
    timestamp: new Date().toISOString(),
  };
}

async function runExperiment(
  experimentConfig: ExperimentConfig,
  questions: EvalQuestion[]
): Promise<ExperimentResult> {
  console.log(`\n--- Experiment: ${experimentConfig.name} ---`);
  console.log(`  ${experimentConfig.description}`);

  const results: EvalResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    process.stdout.write(`  [${i + 1}/${questions.length}] ${q.id}...`);
    try {
      const result = await runSingleQuestion(q, experimentConfig);
      results.push(result);
      console.log(
        ` MRR=${result.retrievalMetrics.mrr.toFixed(2)} Recall@5=${result.retrievalMetrics["recall@5"].toFixed(2)}`
      );
    } catch (err) {
      console.log(` ERROR: ${err}`);
    }
  }

  // Aggregate
  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const aggregated = {
    avgPrecisionAt5: avg(results.map((r) => r.retrievalMetrics["precision@5"])),
    avgRecallAt5: avg(results.map((r) => r.retrievalMetrics["recall@5"])),
    avgMRR: avg(results.map((r) => r.retrievalMetrics.mrr)),
    avgNDCGAt5: avg(results.map((r) => r.retrievalMetrics["ndcg@5"])),
    avgCitationAcc: avg(results.map((r) => r.citationAcc)),
    avgSourcePresence: avg(results.map((r) => r.sourcePresenceScore)),
    avgContainsExpected: avg(results.map((r) => r.containsExpected)),
  };

  console.log(`\n  AGGREGATED:`);
  console.log(`    Precision@5: ${aggregated.avgPrecisionAt5.toFixed(3)}`);
  console.log(`    Recall@5:    ${aggregated.avgRecallAt5.toFixed(3)}`);
  console.log(`    MRR:         ${aggregated.avgMRR.toFixed(3)}`);
  console.log(`    NDCG@5:      ${aggregated.avgNDCGAt5.toFixed(3)}`);
  console.log(`    Source Pres:  ${aggregated.avgSourcePresence.toFixed(3)}`);
  console.log(`    Contains Exp: ${aggregated.avgContainsExpected.toFixed(3)}`);

  return {
    experiment: experimentConfig.name,
    config: experimentConfig,
    results,
    aggregated,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const experimentFlag = args.indexOf("--experiment");
  const experimentName =
    experimentFlag >= 0 ? args[experimentFlag + 1] : "baseline";

  // Load dataset
  const datasetPath = path.join(__dirname, "dataset.json");
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  const questions: EvalQuestion[] = dataset.questions;

  console.log(`Loaded ${questions.length} evaluation questions`);

  // Find experiment(s)
  let experiments: ExperimentConfig[];
  if (experimentName === "all") {
    experiments = EXPERIMENT_GRID;
  } else {
    const found = EXPERIMENT_GRID.find((e) => e.name === experimentName);
    if (!found) {
      console.error(
        `Unknown experiment: ${experimentName}. Available: ${EXPERIMENT_GRID.map((e) => e.name).join(", ")}`
      );
      process.exit(1);
    }
    experiments = [found];
  }

  // Run experiments
  const allResults: ExperimentResult[] = [];
  for (const exp of experiments) {
    const result = await runExperiment(exp, questions);
    allResults.push(result);

    // Save incrementally
    const resultsDir = path.join(__dirname, "results");
    fs.mkdirSync(resultsDir, { recursive: true });
    const outPath = path.join(resultsDir, `${exp.name}_${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`  Results saved to ${outPath}`);
  }

  // Print comparison table if multiple experiments
  if (allResults.length > 1) {
    console.log("\n\n=== COMPARISON TABLE ===\n");
    console.log(
      "Experiment".padEnd(25) +
        "P@5".padEnd(8) +
        "R@5".padEnd(8) +
        "MRR".padEnd(8) +
        "NDCG@5".padEnd(8) +
        "SrcPres".padEnd(8) +
        "Contains".padEnd(8)
    );
    console.log("-".repeat(73));
    for (const r of allResults) {
      console.log(
        r.experiment.padEnd(25) +
          r.aggregated.avgPrecisionAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgRecallAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgMRR.toFixed(3).padEnd(8) +
          r.aggregated.avgNDCGAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgSourcePresence.toFixed(3).padEnd(8) +
          r.aggregated.avgContainsExpected.toFixed(3).padEnd(8)
      );
    }
  }
}

main().catch(console.error);
