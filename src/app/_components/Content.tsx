'use client'

export default function Content({ text }: {
    text: string
  }) {
  return (
    <div className="max-w-2xl">
      <p className="whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
    </div>
  )
}
