

export interface Page {
    content: string[];
    question: string;
    multipleChoice?: {answer: string; correct: boolean}[]
    answerType: "multipleChoice" | 'text'
}
