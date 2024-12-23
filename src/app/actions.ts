"use server";

const exampleData = require('./example.json');
import { handleQuestionAnswered } from "./algorithm";
import { createContent, turnContentIntoJson } from "./fileUpload";
import { generatePages } from "./questions";

const exampleContent = `The Great Depression, spanning from 1929 to the late 1930s, was the most severe economic downturn in modern history, profoundly affecting nations worldwide. It began with the dramatic stock market crash of October 1929, often referred to as "Black Tuesday," which wiped out millions of investors' wealth and set off a chain reaction of financial panic. Banks failed in unprecedented numbers, businesses collapsed, and unemployment soared, leaving nearly a quarter of the U.S. workforce jobless by 1933. Globally, the depression disrupted trade, deepened poverty, and triggered political instability, contributing to the rise of authoritarian regimes in some regions. In response, governments implemented various recovery strategies, with the U.S. launching President Franklin D. Roosevelt's New Deal, a series of programs and reforms aimed at revitalizing the economy, supporting workers, and rebuilding confidence. The Great Depression left an enduring legacy, reshaping economic policies and social safety nets while serving as a stark reminder of the vulnerabilities within financial systems.`;
const title = "The Great Depression";
const exampleQuestion = `What lessons can contemporary societies draw from the economic policies and social programs implemented during the Great Depression to better prepare for and mitigate the impact of future economic crises?`;
const exampleAnswer = `Contermporary societies can prevent stock market crashes in order to mitigate the impact of future economic crises.`;

export const fetchApi = async () => {
  console.log("hello");
};

// ... existing code ...

export async function getPages() {
    try {
        let pages: any[] = [];
        for(const outline of exampleData.lesson_outline.slice(0, 3)) {
            console.log(outline);
            pages = pages.concat(await generatePages(outline.content, outline.title));
        }
        // console.log(await handleQuestionAnswered(pages[0], 1));
        return { success: true, data: pages };
    } catch (error) {
        console.error('Error fetching pages:', error);
        return { success: false, error: 'Failed to fetch pages' };
    }
}

export async function handleFileUpload(file: File) {
  const content = await createContent(file);

  if (content) {
    const jsonFormat = await turnContentIntoJson(content);
    console.log('jsonFormat', jsonFormat);
    
    // Save JSON to file
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(process.cwd(), 'src/app/example.json');
    await fs.promises.writeFile(outputPath, jsonFormat, 'utf8');
  }


  // ...
}
