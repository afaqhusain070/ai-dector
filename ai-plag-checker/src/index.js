import { graph } from "./graph/pipeline.js";

async function run() {
  const output = await graph.run({
    filePath: "./example.pdf",
  });

  console.log("Final AI Detection:");
  console.log(output.result);
}

run();
