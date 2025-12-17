import Tesseract from "tesseract.js";

export async function doOCR(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");
  return text;
}
