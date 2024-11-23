import { Anthropic } from '@anthropic-ai/sdk';
import type { Page } from './dataschema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function generateQuestionsFromText(text: string, numQuestions = 3): Promise<string[]> {
  try {
    const prompt = `Given the following text, generate ${numQuestions} thought-provoking questions about its content. Format the questions as a JSON array of strings.

Text: """
${text}
"""

Generate ${numQuestions} questions about this text. Return only a JSON array of questions.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    if (response.content[0].type === 'text') {
        try {
            const content = response.content[0].text;
            const parsed = await JSON.parse(content);
            // Verify it's an array and all elements are strings
            if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
              console.error('Response was not an array of strings:', parsed);
              return [];
            }
            return parsed;
          } catch (error) {
            console.error('Failed to parse JSON response:', error);
            return [];
        }
    }
    return [];
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions');
  }
}

export async function generateCorrectAnswer(context: string, question: string): Promise<string> {
    try {
      const prompt = `
        Given the following context and question, generate the correct answer.
        Return only the answer as a plain text string, without any additional formatting or explanation.
  
        Context: """
        ${context}
        """
  
        Question: """
        ${question}
        """
  
        Return only the correct answer as a plain text string.
      `;
  
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.1, // Lower temperature for more focused/accurate response
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
  
      if (response.content[0].type === 'text') {
        return response.content[0].text.trim();
      }
      
      return '';
    } catch (error) {
      console.error('Error generating answer:', error);
      return '';
    }
  }

  export async function generateIncorrectAnswer(context: string, question: string): Promise<string> {
    try {
      const prompt = `
        Given the following context and question, generate an incorrect answer.
        Return only the answer as a plain text string, without any additional formatting or explanation.
  
        Context: """
        ${context}
        """
  
        Question: """
        ${question}
        """
  
        Return only the incorrect answer as a plain text string.
      `;
  
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.5, // Lower temperature for more focused/accurate response
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
  
      if (response.content[0].type === 'text') {
        return response.content[0].text.trim();
      }
      
      return '';
    } catch (error) {
      console.error('Error generating answer:', error);
      return '';
    }
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  export async function generatePage(content: string): Promise<Page> {
    try {
      // First generate a question about the content
      const questions = await generateQuestionsFromText(content, 1);
      const question = questions[0] || "What is this text about?"; // fallback question
  
      // Randomly decide between multiple choice and text answer
      const isMultipleChoice = await determineAnswerType(content, question) === "multipleChoice";
  
      if (isMultipleChoice) {
        // Generate one correct answer and three incorrect answers
        const correctAnswer = await generateCorrectAnswer(content, question);
        const incorrectAnswers = await Promise.all([
          generateIncorrectAnswer(content, question),
          generateIncorrectAnswer(content, question),
          generateIncorrectAnswer(content, question)
        ]);
  
        // Combine and shuffle answers
        let multipleChoice = [
          { answer: correctAnswer, correct: true },
          ...incorrectAnswers.map(answer => ({ answer, correct: false }))
        ];
        multipleChoice = shuffleArray(multipleChoice);
  
        return {
          content: [content],
          question,
          multipleChoice,
          answerType: "multipleChoice"
        };
      } else {
        return {
          content: [content],
          question,
          answerType: "text"
        };
      }
    } catch (error) {
      console.error('Error generating page:', error);
      // Return a basic page if something goes wrong
      return {
        content: [content],
        question: "What is this text about?",
        answerType: "text"
      };
    }
  }

type AnswerType = "multipleChoice" | "text";

export async function determineAnswerType(content: string, question: string): Promise<AnswerType> {
  try {
    const prompt = `
      Given the following content and question, determine if this should be answered as:
      - "multipleChoice": if the question has clear, distinct possible answers
      - "text": if the question requires explanation or has many possible valid answers
      
      Return ONLY the word "multipleChoice" or "text".

      Content: """
      ${content}
      """

      Question: """
      ${question}
      """

      Return ONLY "multipleChoice" or "text".
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (response.content[0].type === 'text') {
      const answer = response.content[0].text.trim().toLowerCase();
      if (answer === 'multiplechoice') return 'multipleChoice';
      if (answer === 'text') return 'text';
    }
    
    // Default to text if we can't determine
    return 'text';
  } catch (error) {
    console.error('Error determining answer type:', error);
    return 'text';
  }
}