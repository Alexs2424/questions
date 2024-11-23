'use server'

import { Anthropic } from '@anthropic-ai/sdk';
import type { Page } from './dataschema';
import { generateMultipleChoicePage, generateTextPage } from './questions';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function handleQuestionAnswered(page: Page, multipleChoiceAnswer?: string, response?: string, isCorrect?: boolean) {
    if (page.multipleChoice && multipleChoiceAnswer) {
        return explainMultipleChoiceResponse(page.content.join(' '), page.question, multipleChoiceAnswer, isCorrect || false);
    }
    if (response) {
        return evaluateTextResponse(page.content.join(' '), page.question, response);
    }
}
  
export interface TextEvaluation {
    isCorrect: boolean;
    explanation: string;
    confidence: number;  // 0-1 score of how confident the evaluation is
    newPage?: Page;
}

export async function generateQuestionVariation(content: string, originalQuestion: string): Promise<string> {
    try {
        const prompt = `
        Given this content and original question, create a different question that tests the same concept but is worded differently.
        The new question should have the same difficulty level and test similar understanding.

        Content: """
        ${content}
        """

        Original question: """
        ${originalQuestion}
        """

        Return only the new question as plain text, without any additional explanation.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 150,
            temperature: 0.4,  // Low temperature for similar difficulty level
            messages: [{ role: 'user', content: prompt }]
        });

        if (response.content[0].type === 'text') {
            return response.content[0].text.trim();
        }

        return originalQuestion; // Fallback to original if generation fails

    } catch (error) {
        console.error('Error generating question variation:', error);
        return originalQuestion;
    }
}

// Test data
const testEvaluation: TextEvaluation = {
    isCorrect: true,
    explanation: "The answer correctly identifies that implementing financial regulations and social safety nets were key lessons from the Great Depression.",
    confidence: 0.95
};

const testEvaluationIncorrect: TextEvaluation = {
    isCorrect: false, 
    explanation: "The answer oversimplifies the lessons by focusing only on stock market crashes while ignoring other important factors.",
    confidence: 0.87
};

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
        
        if(!isCorrect) {
            const questionVariation = await generateQuestionVariation(content, question);
            const page = await generateMultipleChoicePage(content, questionVariation);
            return {
                isCorrect,
                explanation,
                confidence: 1.0,  // Always 1.0 for multiple choice
                newPage: page,
            };
        }

        return {
            isCorrect,
            explanation,
            confidence: 1.0,  // Always 1.0 for multiple choice
        };

    } catch (error) {
        return {
            isCorrect,
            explanation: `The answer "${selectedAnswer}" is ${isCorrect ? 'correct' : 'incorrect'}.`,
            confidence: 1.0
        };
    }
}

function removeFirstAndLastLines(text: string): string {
    const lines = text.split('\n');
    return lines.slice(1, -1).join('\n');
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
        console.log(result.content[0].text);
        let response: string;
        if (result.content[0].text.startsWith("```")) {
            response = removeFirstAndLastLines(result.content[0].text);
        }
        else {
            response = result.content[0].text;
        }

        const evaluation = JSON.parse(response);


        if(!evaluation.isCorrect) {
            const questionVariation = await generateQuestionVariation(content, question);
            const page = await generateTextPage(content, questionVariation);
            return {
                isCorrect: Boolean(evaluation.isCorrect),
                explanation: String(evaluation.explanation),
                confidence: Number(evaluation.confidence),
                newPage: page
            };
        }
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

