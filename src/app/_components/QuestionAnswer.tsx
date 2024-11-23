'use client'

import { useState } from 'react'

export default function QuestionAnswer({data}: {data: Page}) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call
    setAnswer('This is a sample answer') 
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
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span>{choice.answer}</span>
                        </label>
                    ))}
                </div>
                </>
            )
        }
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>

      {answer && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  )
}
