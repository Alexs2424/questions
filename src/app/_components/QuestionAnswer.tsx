


'use client'

import { useState } from 'react'

export default function QuestionAnswer() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call
    setAnswer('This is a sample answer') 
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full p-4 border rounded-lg resize-none min-h-[100px]"
        />
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
