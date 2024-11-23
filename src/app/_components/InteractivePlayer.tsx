'use client'

import { useState, useRef } from "react"
import { Page } from "../dataschema"
import { handleQuestionAnswered, TextEvaluation } from "../algorithm"

export const DATA: Page[] = [{
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
    ],
    question: "What is the main theme discussed in this passage about voluptas (pleasure)?",
    multipleChoice: [
      { answer: "Pleasure is universally sought after", correct: false },
      { answer: "People who seek pleasure are ignorant", correct: false },
      { answer: "The relationship between pleasure, pain, and rational decision-making", correct: true },
      { answer: "Pleasure should be avoided at all costs", correct: false }
    ],
    answerType: "multipleChoice"
  },
  {
    content: [
      "The scientific method is a systematic approach to investigating phenomena, acquiring new knowledge, and correcting and integrating existing knowledge. It involves making observations, formulating hypotheses, conducting experiments, and analyzing results.",
      
      "A key aspect of the scientific method is its emphasis on empirical evidence and reproducibility. Scientists must be able to replicate each other's experiments to verify findings. This process helps eliminate bias and ensures that conclusions are based on solid evidence rather than personal beliefs.",
      
      "The iterative nature of science means that scientific understanding is constantly evolving. As new evidence emerges, theories may be refined or even replaced. This self-correcting aspect is one of the greatest strengths of the scientific method."
    ],
    question: "What makes the scientific method an effective approach to gaining knowledge?",
    multipleChoice: [
      { answer: "It relies solely on theoretical reasoning", correct: false },
      { answer: "It is a one-time process that provides definitive answers", correct: false },
      { answer: "It combines systematic investigation with empirical verification", correct: true },
      { answer: "It depends entirely on computer simulations", correct: false }
    ],
    answerType: "multipleChoice"
  },
  {
    content: [
      "Climate change represents one of the most significant challenges facing our planet today. Rising global temperatures have led to melting ice caps, rising sea levels, and increasingly extreme weather events.",
      
      "The primary driver of modern climate change is the emission of greenhouse gases, particularly carbon dioxide, from human activities. These emissions trap heat in the atmosphere, leading to a gradual warming of the Earth's surface.",
      
      "Addressing climate change requires both individual and collective action. This includes reducing carbon emissions, transitioning to renewable energy sources, and implementing sustainable practices across all sectors of society."
    ],
    question: "What is your analysis of the relationship between human activities and climate change based on this passage?",
    answerType: "text"
  }]

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

// interface Answer {
//     userInput: any; // this could be a multiple choice object or
//     feedback: string;
// }

export const InteractivePlayer = ({pages}: {pages: Page[]}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const page = pages[currentPageIndex]
    const [nextDisabled, setNextDisabled] = useState(true)
    const [answer, setAnswer] = useState('')
    const [multipleChoiceAnswer, setMultipleChoiceAnswer] = useState('')
    const [isCorrect, setIsCorrect] = useState<boolean>(false)

    const [answerReceived, setAnswerReceived] = useState(false)
    const [evaluation, setEvaluation] = useState<TextEvaluation>()
    const formRef = useRef<HTMLFormElement>(null)
    const [submitLoading, setSubmitLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement API call

        setSubmitLoading(true)
        
        const evaluationResponse = await handleQuestionAnswered(page, multipleChoiceAnswer || undefined, answer || undefined, isCorrect)
        // const evaluationResponse = testEvaluation
        if (evaluationResponse) {
            setEvaluation(evaluationResponse)
        }
        
        setNextDisabled(false)
        setAnswerReceived(true)
        setSubmitLoading(false)
    }

    const handleContinue = () => {
        setAnswer('')
        setMultipleChoiceAnswer('')
        setAnswerReceived(false)
        setCurrentPageIndex((val) => val + 1)
        formRef.current?.reset()
    }

    if (!page) {
        return <FinalPage />
    }

    return (
        <div className="flex flex-col gap-5">
            {page != null && 
                <div className=" bg-[#f8f8f3] rounded-[16px] shadow-md border border-gray-100 p-6">
                    {page.content.map((contentParagraph, idx) => (
                        <p className="whitespace-pre-wrap leading-relaxed mb-4" key={idx}>
                            {contentParagraph}
                        </p>
                    ))}
                </div>
            }

            {page != null && (
                <div className="w-full max-w-2xl flex flex-col gap-4  p-6 self-center">
                    <h2 className="font-semibold">
                        {page.question}
                    </h2>
                    <div className="pt-3">
                        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {page.answerType === 'multipleChoice' && (
                                <>
                                    <div className="flex flex-col gap-3">
                                        {page.multipleChoice?.map((choice, index) => (
                                            <label key={index} className={`flex items-center gap-2 p-2 rounded-md transition-colors shadow-sm border-2 border-gray-200 ${!answerReceived ? " hover:shadow-md cursor-pointer" : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="multipleChoice"
                                                    value={choice.answer}
                                                    onChange={(e) => {
                                                        setMultipleChoiceAnswer(choice.answer)
                                                        setIsCorrect(choice.correct)
                                                    }}
                                                    className="w-4 h-4 text-blue-500"
                                                    disabled={answerReceived}
                                                />
                                                <span className={answerReceived ? (
                                                    choice.correct ? "text-green-600 font-medium" : 
                                                    choice.answer === multipleChoiceAnswer ? "text-red-600" : ""
                                                ) : ""}>
                                                    {choice.answer}
                                                    {answerReceived && choice.correct && (
                                                        <span className="ml-2 text-green-600">✓</span>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                            {page.answerType === 'text' && (
                                <>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                                        placeholder="Type your answer here..."
                                    />
                                </>
                            )}
                            {!answerReceived && <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                                disabled={(!multipleChoiceAnswer && !answer) || answerReceived || submitLoading}
                            >
                                {submitLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>}
                        </form>
                    </div>
                    {answerReceived && evaluation && (
                        <div className={`p-4 rounded-lg border ${evaluation.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {evaluation.isCorrect ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <span className={`font-medium ${evaluation.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                    {evaluation.isCorrect ? 'Correct!' : 'Incorrect'}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-3">{evaluation.explanation}</p>
                            {page.answerType == 'text' && <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Confidence:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                                    <div 
                                        className={`h-2 rounded-full ${evaluation.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${evaluation.confidence * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600">{Math.round(evaluation.confidence * 100)}%</span>
                            </div>}
                        </div>
                    )}

                    {answerReceived && <div className="p-4 flex items-end fill-slate-400 justify-end">
                        <button 
                            onClick={handleContinue}
                            disabled={nextDisabled}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center content-end gap-2"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>}
                </div>
            )}
        </div>
    )
}

const FinalPage = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <h2 className="text-2xl font-bold text-gray-800">
                Congratulations!
            </h2>
            <p className="text-gray-600 text-center max-w-md">
                You have completed all the questions.
            </p>
        </div>
    )
}