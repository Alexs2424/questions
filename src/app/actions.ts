'use server'

import { generateCorrectAnswer, generateQuestionsFromText } from './questions';

const exampleContent = `The Great Depression, spanning from 1929 to the late 1930s, was the most severe economic downturn in modern history, profoundly affecting nations worldwide. It began with the dramatic stock market crash of October 1929, often referred to as "Black Tuesday," which wiped out millions of investors' wealth and set off a chain reaction of financial panic. Banks failed in unprecedented numbers, businesses collapsed, and unemployment soared, leaving nearly a quarter of the U.S. workforce jobless by 1933. Globally, the depression disrupted trade, deepened poverty, and triggered political instability, contributing to the rise of authoritarian regimes in some regions. In response, governments implemented various recovery strategies, with the U.S. launching President Franklin D. Roosevelt's New Deal, a series of programs and reforms aimed at revitalizing the economy, supporting workers, and rebuilding confidence. The Great Depression left an enduring legacy, reshaping economic policies and social safety nets while serving as a stark reminder of the vulnerabilities within financial systems.`

export const fetchApi = async () => {
    console.log('hello')
    const questions = await generateQuestionsFromText(exampleContent, 3);
    console.log(questions);
    for (const question of questions) {
        const answers = await generateCorrectAnswer(exampleContent, question);
        console.log(answers);
    }
}