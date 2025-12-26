let tf;
let _model;

export async function loadClassifier() {
  if (_model) return _model;

  // Try loading the native tfjs-node first (recommended). If it fails (native binary issue),
  // fall back to the pure-JS `@tensorflow/tfjs` and provide a helpful error message.
  try {
    const m = await import("@tensorflow/tfjs-node");
    tf = m.default ?? m;
  } catch (err) {
    console.warn(
      "Warning: @tensorflow/tfjs-node failed to load (native binaries). Falling back to @tensorflow/tfjs (pure JS). For best results install a tfjs-node build that matches your Node version or use Node 18/20 LTS."
    );
    try {
      const m = await import("@tensorflow/tfjs");
      tf = m.default ?? m;
    } catch (err2) {
      throw new Error(
        "TensorFlow is not available. Install `@tensorflow/tfjs-node` (recommended) or `@tensorflow/tfjs`. Original error: " +
          err.message
      );
    }
  }

  try {
    _model = await tf.loadLayersModel("file://src/model/model.json");
  } catch (err) {
    throw new Error(
      "Failed to load model from `src/model/model.json`. If using the pure-JS `@tensorflow/tfjs`, loading from `file://` may not be supported. " +
        err.message
    );
  }

  return _model;
}

export async function classify(vectors) {
  // Allow explicit dev override
  if (process.env.USE_STUB_CLASSIFIER === "1") {
    console.warn("Using stub classifier because USE_STUB_CLASSIFIER=1");
    return vectors.map(() => [0]);
  }

  try {
    const model = await loadClassifier();
    if (!tf || typeof tf.tensor2d !== "function") {
      console.warn("TensorFlow not available — returning stub predictions.");
      return vectors.map(() => [0]);
    }

    const tensor = tf.tensor2d(vectors);
    const out = model.predict(tensor);
    return out.array();
  } catch (err) {
    console.warn("Classifier error, returning stub predictions:", err.message);
    return vectors.map(() => [0]);
  }
}
