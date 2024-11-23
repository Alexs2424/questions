'use client'

import { useState } from "react"
import QuestionAnswer from "./QuestionAnswer"
import Content from "./Content"

const DATA: Page[] = [{
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
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
  
  

export const InteractivePlayer = ({}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const page =  DATA[currentPageIndex]

    return <div>
        <Content text={page.content.join('\n')} />

        {page != null && <QuestionAnswer data={page} />}
        {page == null && <>Final page</> }

        <div className="flex items-end fill-slate-400">
            <button onClick={() => {
                setCurrentPageIndex((val) => val + 1)
            }} >
                Next
            </button>
        </div>
    </div>
}