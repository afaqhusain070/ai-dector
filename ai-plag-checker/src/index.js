import fs from "fs";
import { graph } from "./graph/pipeline.js";

async function run() {
  const filePath = process.argv[2] ?? "./example.pdf";

  if (!fs.existsSync(filePath)) {
    console.error(
      `Input file not found: ${filePath}\nProvide a path to a PDF: node src/index.js path/to/file.pdf`
    );
    return;
  }

  const output = await graph.invoke({ filePath });

  console.log("Final AI Detection:");
  console.log(output.result);
}

run();
