'use client'

import { handleFileUpload } from "../actions";

export function HomePageContent() {
    return (
      <main className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">
            Enhance your learning through interactive questions and real-time feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/experience"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Learning
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Content
              <input 
                type="file" 
                className="hidden" 
                accept=".txt,.pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload
                    const res = await handleFileUpload(file)
                    
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Interactive Questions</h3>
            <p className="text-gray-600">
              Engage with multiple choice and free-form questions designed to test your understanding.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
            <p className="text-gray-600">
              Receive detailed explanations and confidence scores to help guide your learning journey.
            </p>
          </div>
        </div>
      </main>
    );
  }
  