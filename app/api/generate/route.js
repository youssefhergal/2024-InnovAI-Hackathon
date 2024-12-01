import { extractTextFromPdf } from "@/utils/fileParser";
import { courseOutlineAIModel } from "@/configs/AiModel";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import fs from "fs/promises";



export  async function POST(req) {


    try {
        const form = new formidable.IncomingForm();
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        const { createdBy } = fields;
        const file = files.file;

        // Read file content
        const fileBuffer = await fs.readFile(file.filepath);
        const textFromPdf = await extractTextFromPdf(fileBuffer);



        // AI prompt
        const PROMPT = `
            Generate a comprehensive study material outline for the topic: "${textFromPdf}".  
            Ensure the material is suitable for a difficulty level of easy.

            The output should include the following:
            1. **Course Title**: Provide a concise, engaging, and descriptive title for the course.
            2. **Course Summary**: Write a brief summary of the course, highlighting its objectives, target audience, and key takeaways.
            3. **List of Chapters** (Maximum of 3): 
               - Include a creative and descriptive title for each chapter.
               - Provide a brief summary of each chapter (2-3 sentences).
               - Suggest an appropriate emoji icon to represent each chapter.
            4. **Topics List**: Include a list of topics covered in each chapter to give a clear structure to the material.

            Ensure the output is returned in **valid JSON format**, structured as follows:
            {
              "title": "Course Title",
              "summary": "Course Summary",
              "chapters": [
                {
                  "title": "Chapter 1 Title",
                  "summary": "Chapter 1 Summary",
                  "emoji": "📘",
                  "topics": ["Topic 1", "Topic 2", "Topic 3"]
                },
                ...
              ]
            }
        `;

        const aiResp = await courseOutlineAIModel.sendMessage(PROMPT);
        let aiResult;
        aiResult = JSON.parse(aiResp.response.text());


        const courseData = {
            courseId: uuidv4(),
            courseType: "*",
            topic: "Extracted from PDF",
            difficultyLevel: "Easy",
            courseLayout: aiResult,
            createdBy,
            status: "Generated",
        };

    } catch (error) {
        console.error("Error processing PDF file:", error);
    }
}
