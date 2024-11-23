import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

export async function createContent(file: File): Promise<string | null> {
  const assistant = await openai.beta.assistants.create({
    name: "Substitute Teacher",
    instructions:
      "You are a helper for teachers. They will upload their own course content and then you will create an overview with a title and content for students to read.",
    model: "gpt-4o",
    tools: [{ type: "file_search" }],
  });

  //   const arrayBuffer = await file.arrayBuffer();
  //   const buffer = Buffer.from(arrayBuffer);

  //   const fileStreams = [
  //     {
  //       name: file.name,
  //       data: buffer,
  //     },
  //   ];
  // const fileStreams = [filePath].map((path) => fs.createReadStream(path));

  // Create a vector store including our two files.
  const vectorStore = await openai.beta.vectorStores.create({
    name: "Teacher resources",
  });

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: [file],
  });

  console.log();

  await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });

  const thread = await openai.beta.threads.create();

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content:
      "You are an assistant to help teachers create lesson outlines from materials teachers have already created, and that output will be used to teach students. \n Using this PDF that's uploaded, generate sets of titles, and content (content in the form of a paragraph with interesting information) about key aspects of the contained information. Keep the audience engaged, so no longer than 3 paragraphs of information per key idea in the text. ",
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
    instructions: "Answer in JSON format. Return all useful content available in the file. ",
  });

  console.log("run ", run);

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      if (message.content[0].type === "text" && message.role === 'assistant') {
        console.log(`${message.role} > ${message.content[0].text.value}`);
        return message.content[0].text.value
      }
      // console.log(`${message.role} > ${message.content[0].text.value}`);
    }
  } else {
    console.log(run.status);
  }

  return Promise.resolve(null)
}

const format = `
 "lesson_outline": [
      {
        "title": string
        "subtitle": string
        "content": string
      },

`


export async function turnContentIntoJson(content: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that converts content into structured JSON format."
      },
      {
        role: "user", 
        content: `Please analyze this content and create a JSON object with a lesson_outline array. Each element should be a key idea from the content, structured with a title, subtitle, and detailed content field. Format the response as follows:
        Elaborate on the content as you see fit.
        
        {
          "lesson_outline": [
            {
              "title": "A clear, engaging title for the key idea",
              "subtitle": "A brief subtitle or theme",
              "content": "A detailed paragraph (no more than 3 paragraphs) explaining the key idea and its significance"
            }
          ]
        }
        
        Here is the content to analyze: ${content}`
      }
    ],
    model: "gpt-4-1106-preview",
    response_format: { type: "json_object" },
    
  });

  return completion.choices[0].message.content;
}
