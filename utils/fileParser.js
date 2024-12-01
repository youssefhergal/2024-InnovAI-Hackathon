import pdfParse from "pdf-parse";
import { readFileSync } from "fs";

/**
 * Extract text from a PDF file.
 * @param {Object} file - The file object containing filePath and fileType.
 * @returns {string|null} The extracted text or null if an error occurs.
 */
export async function extractTextFromPdf(file) {
    const { filePath } = file;

    try {
        const fileBuffer = readFileSync(filePath); // Read the PDF file as a buffer
        const data = await pdfParse(fileBuffer); // Extract text using pdf-parse
        return data.text; // Return the extracted text
    } catch (error) {
        console.error("Error parsing PDF file:", error);
        return null;
    }
}
