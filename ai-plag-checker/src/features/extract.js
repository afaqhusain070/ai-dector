export function preprocess(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function chunk(text, size = 1500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size)
    chunks.push(text.slice(i, i + size));
  return chunks;
}

export function extractFeatures(chunk) {
  const words = chunk.split(/\s+/);
  const sentences = chunk.split(/[.!?]/);

  return [
    words.length,
    words.join("").length / words.length || 0,
    words.length / (sentences.length || 1),
    (chunk.match(/[.,!?;]/g) || []).length,
    (chunk.match(/\b(the|and|is|in|it)\b/gi) || []).length,
  ];
}
