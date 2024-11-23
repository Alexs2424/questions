import { Anthropic } from '@anthropic-ai/sdk';
import type { Page } from './dataschema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function handleQuestionAnswered(page: Page, selection?: number, response?: string) {
    if(page.multipleChoice && selection) {
        return explainMultipleChoiceResponse(page.content[0], page.question, page.multipleChoice[selection].answer, page.multipleChoice[selection].correct);
    }
    if(response) {
        return evaluateTextResponse(page.content[0], page.question, response);
    }
}
  
interface TextEvaluation {
    isCorrect: boolean;
    explanation: string;
    confidence: number;  // 0-1 score of how confident the evaluation is
}

export async function explainMultipleChoiceResponse(
    content: string,
    question: string,
    selectedAnswer: string,
    isCorrect: boolean
): Promise<TextEvaluation> {
    try {
        const prompt = `
        ${isCorrect ? 'Explain why this answer is correct' : 'Explain why this answer is incorrect'} in one clear sentence.
        
        Context: """
        ${content}
        """

        Question: """
        ${question}
        """

        Selected answer: """
        ${selectedAnswer}
        """

        Return only a single explanatory sentence.`;

        const result = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 100,
            temperature: 0.1,
            messages: [{ role: 'user', content: prompt }]
        });

        const explanation = result.content[0].type === 'text' 
            ? result.content[0].text.trim() 
            : `The answer "${selectedAnswer}" is ${isCorrect ? 'correct' : 'incorrect'}.`;

        return {
            isCorrect,
            explanation,
            confidence: 1.0  // Always 1.0 for multiple choice
        };

    } catch (error) {
        return {
            isCorrect,
            explanation: `The answer "${selectedAnswer}" is ${isCorrect ? 'correct' : 'incorrect'}.`,
            confidence: 1.0
        };
    }
}
  
export async function evaluateTextResponse(
    content: string, 
    question: string, 
    response: string
): Promise<TextEvaluation> {
    try {
      const prompt = `
        Evaluate if this response correctly answers the question based on the given context.
        
        Context: """
        ${content}
        """
  
        Question: """
        ${question}
        """
  
        Response to evaluate: """
        ${response}
        """
  
        Return a JSON object with:
        {
          "isCorrect": boolean (true if the answer is correct),
          "explanation": string (brief explanation of why it's correct/incorrect),
          "confidence": number (0-1 score of how confident you are in this evaluation)
        }
      `;
  
      const result = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });
  
      if (result.content[0].type === 'text') {
        const evaluation = JSON.parse(result.content[0].text);
        return {
          isCorrect: Boolean(evaluation.isCorrect),
          explanation: String(evaluation.explanation),
          confidence: Number(evaluation.confidence)
        };
      }
  
      throw new Error('Invalid response format');
  
    } catch (error) {
      console.error('Error evaluating response:', error);
      return {
        isCorrect: false,
        explanation: "Failed to evaluate the response due to an error",
        confidence: 0
      };
    }
}

