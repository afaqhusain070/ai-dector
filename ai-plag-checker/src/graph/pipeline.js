import { StateGraph } from "@langchain/langgraph";
import { z } from "zod";

import { loadPdf } from "../ingest/loadPdf.js";
import { preprocess, chunk, extractFeatures } from "../features/extract.js";
import { embedChunks } from "../embed/embedding.js";
import { classify } from "../model/classifier.js";

// Define a Zod schema for the graph state
const StateSchema = z.object({
  filePath: z.string().describe("Path to the input file"),
  text: z.string().optional(),
  chunks: z.array(z.string()).optional(),
  features: z.array(z.array(z.number())).optional(),
  embeddings: z.array(z.array(z.number())).optional(),
  vectors: z.array(z.array(z.number())).optional(),
  result: z.any().optional(),
});

// Build the graph using the zod schema and the proper StateGraph APIs
const builder = new StateGraph(StateSchema);

builder
  .addNode("load", async (s) => ({ text: await loadPdf(s.filePath) }))
  .addNode("prep", (s) => ({ text: preprocess(s.text) }))
  .addNode("makeChunks", (s) => ({ chunks: chunk(s.text) }))
  .addNode("embed", async (s) => ({ embeddings: await embedChunks(s.chunks) }))
  .addNode("feat", (s) => ({
    features: s.chunks.map((c) => extractFeatures(c)),
  }))
  .addNode("combine", (s) => ({
    vectors: s.embeddings.map((e, i) => [...e, ...s.features[i]]),
  }))
  .addNode("predict", async (s) => ({ result: await classify(s.vectors) }));

builder
  .addEdge("__start__", "load")
  .addEdge("load", "prep")
  .addEdge("prep", "makeChunks")
  .addEdge("makeChunks", "embed")
  .addEdge("embed", "feat")
  .addEdge("feat", "combine")
  .addEdge("combine", "predict")
  .addEdge("predict", "__end__");

export const graph = builder.compile();
