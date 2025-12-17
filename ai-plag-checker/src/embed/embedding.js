import { pipeline } from "@xenova/transformers";

let embedder;

export async function loadModel() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

export async function embedChunks(chunks) {
  const model = await loadModel();

  const embeddings = [];
  for (const chunk of chunks) {
    const output = await model(chunk);
    embeddings.push(Array.from(output[0][0])); // 384 dim
  }
  return embeddings;
}
