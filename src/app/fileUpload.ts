import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

export async function createContent(file: File): Promise<void> {
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
    instructions: "Answer in JSON format. ",
  });

  console.log("run ", run);

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      if (message.content[0].type === "text") {
        console.log(`${message.role} > ${message.content[0].text.value}`);
      }
      // console.log(`${message.role} > ${message.content[0].text.value}`);
    }
  } else {
    console.log(run.status);
  }
}
