import { StateGraph } from "@langchain/langgraph";

import { loadPdf } from "../ingest/loadPdf.js";
import { preprocess, chunk, extractFeatures } from "../features/extract.js";
import { embedChunks } from "../embed/embedding.js";
import { classify } from "../model/classifier.js";

export const graph = new StateGraph({
  states: {
    filePath: null,
    text: null,
    chunks: null,
    features: null,
    embeddings: null,
    vectors: null,
    result: null,
  },
  edges: {
    START: "load",
    load: "prep",
    prep: "makeChunks",
    makeChunks: "embed",
    embed: "feat",
    feat: "combine",
    combine: "predict",
    predict: "END",
  },
});

graph.defineNode("load", async (s) => {
  s.text = await loadPdf(s.filePath);
  return s;
});
graph.defineNode("prep", async (s) => {
  s.text = preprocess(s.text);
  return s;
});
graph.defineNode("makeChunks", async (s) => {
  s.chunks = chunk(s.text);
  return s;
});
graph.defineNode("embed", async (s) => {
  s.embeddings = await embedChunks(s.chunks);
  return s;
});
graph.defineNode("feat", async (s) => {
  s.features = s.chunks.map((c) => extractFeatures(c));
  return s;
});
graph.defineNode("combine", async (s) => {
  s.vectors = s.embeddings.map((e, i) => [...e, ...s.features[i]]);
  return s;
});
graph.defineNode("predict", async (s) => {
  s.result = await classify(s.vectors);
  return s;
});
