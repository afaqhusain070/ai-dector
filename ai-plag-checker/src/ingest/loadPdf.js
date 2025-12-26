import fs from "fs";

export async function loadPdf(path) {
  try {
    const buffer = fs.readFileSync(path);

    // Prefer ESM import which exposes `PDFParse` class in modern versions
    const pdfModule = await import("pdf-parse");
    const PDFParse = pdfModule.PDFParse ?? pdfModule.default ?? pdfModule;

    if (typeof PDFParse === "function") {
      // PDFParse is a constructor-based parser
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      return textResult.text;
    }

    // Fallback for the older function-style export (pdf(buffer) => { text })
    if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      return data.text;
    }

    throw new Error("Unsupported pdf-parse export shape");
  } catch (err) {
    throw new Error(`Failed to parse PDF at ${path}: ${err.message}`);
  }
}
