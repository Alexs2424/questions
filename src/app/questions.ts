import { Anthropic } from '@anthropic-ai/sdk';
import type { Page } from './dataschema';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function generateMultipleChoiceQuestionsFromText(text: string, numQuestions = 3): Promise<string[]> {
    try {
        const prompt = `Given the following text, generate ${numQuestions} questions about its content. Format the questions as a JSON array of strings.

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

export async function generateShortResponseQuestion(text: string): Promise<string> {
    try {
        const prompt = `Given the following text, generate a question that requires a short, specific answer (1-2 sentences).
        The question should test understanding of key information from the text.
        Return only the question as a plain string.

        Text: """
        ${text}
        """

        Return only the question, without any additional text.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            temperature: 0.4,
            messages: [
                { role: 'user', content: prompt }
            ],
        });

        if (response.content[0].type === 'text') {
            return response.content[0].text.trim();
        }

        return 'What is the main point of this text?'; // fallback
    } catch (error) {
        console.error('Error generating short response question:', error);
        return 'What is the main point of this text?';
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

export async function generateIncorrectAnswers(context: string, question: string, count: number = 3): Promise<string[]> {
    try {
        const prompt = `
        Given the following context and question, generate ${count} different incorrect answers.
        Return the answers as a JSON array of strings, with each answer being clearly wrong but plausible.
  
        Context: """
        ${context}
        """
  
        Question: """
        ${question}
        """
  
        Return only a JSON array of ${count} incorrect answers.
      `;

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            temperature: 0.5,
            messages: [{ role: 'user', content: prompt }],
        });

        if (response.content[0].type === 'text') {
            try {
                const parsed = JSON.parse(response.content[0].text);
                if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                    return parsed;
                }
            } catch (error) {
                console.error('Failed to parse incorrect answers:', error);
            }
        }

        return Array(count).fill('');  // Fallback empty answers
    } catch (error) {
        console.error('Error generating answers:', error);
        return Array(count).fill('');
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

export async function generatePages(content: string, title: string): Promise<Page[]> {
    const questions = await generateMultipleChoiceQuestionsFromText(content, 2); // Generate 2 questions
    const pages: Page[] = [];

    for (const question of questions) {
        const page = await generateMultipleChoicePage(content, question);
        page.title = title;
        pages.push(page);
    }
    const shortResponseQuestion = await generateShortResponseQuestion(content);
    const page = await generateTextPage(content, shortResponseQuestion);
    page.title = title;
    pages.push(page);
    return pages;
}

export async function generateTextPage(content: string, question: string): Promise<Page> {
    try {
        // Use existing question or fallback
        question = question || "What is this text about?";
        
        return {
            content: [content],
            question,
            answerType: "text"
        };
    } catch (error) {
        console.error('Error generating text page:', error);
        // Return a basic page if something goes wrong
        return {
            content: [content],
            question: "What is this text about?",
            answerType: "text"
        };
    }
}

export async function generateMultipleChoicePage(content: string, question: string): Promise<Page> {
    try {
        // First generate a question about the content
        question = question || "What is this text about?"; // fallback question
        
        // Generate one correct answer and three incorrect answers
        const correctAnswer = await generateCorrectAnswer(content, question);
        const incorrectAnswers = await generateIncorrectAnswers(content, question, 3);

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