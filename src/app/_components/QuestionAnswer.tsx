'use client'

import { useState } from 'react'

export default function QuestionAnswer({data, handleAnswer}: {data: Page, handleAnswer: () => void}) {
  const [answer, setAnswer] = useState('')
  const [multipleChoiceAnswer, setMultipleChoiceAnswer] = useState('')
  const [answerReceived, setAnswerReceived] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call
    handleAnswer()
    setAnswerReceived(true)


    

  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
        <p className="font-semibold">
            {data.question}
        </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {
            data.answerType === 'multipleChoice' && (
                <>
                <div className="flex flex-col gap-3">
                    {data.multipleChoice?.map((choice, index) => (
                        <label key={index} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="multipleChoice"
                                value={choice.answer}
                                onChange={(e) => setMultipleChoiceAnswer(e.target.value)}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span>{choice.answer}</span>
                        </label>
                    ))}
                </div>
                </>
            )
        }
        {
            data.answerType === 'text' && (
                <>
                <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full h-32 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="Type your answer here..."
                />
                </>
            )
        }
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={(!multipleChoiceAnswer && !answer)}
        >
          Submit
        </button>
      </form>

      {/* {answer && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      )} */}
    </div>
  )
}
