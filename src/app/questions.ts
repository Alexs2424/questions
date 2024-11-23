import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateQuestionsFromText(text: string, numQuestions: number = 3) {
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

    // Parse the response to get questions
    const content = response.content[0].text;
    const questions = JSON.parse(content);
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions');
  }
}