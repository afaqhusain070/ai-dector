import * as tf from "@tensorflow/tfjs-node";

export async function loadClassifier() {
  return await tf.loadLayersModel("file://src/model/model.json");
}

export async function classify(vectors) {
  const model = await loadClassifier();
  const tensor = tf.tensor2d(vectors);
  const out = model.predict(tensor);
  return out.array();
}
