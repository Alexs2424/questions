import { DATA, InteractivePlayer } from "./_components/InteractivePlayer";
import { fetchApi, getPages } from "./actions";

export default async function Home() {
  const result = await getPages()
  // const result = {success: true, data: DATA, error: undefined}

  return (
    <div className="min-h-screen p-8 sm:p-20">
      <h1 className="text-3xl font-bold text-center mb-8">Interactive Learning</h1>
      <main className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        {result.success && <InteractivePlayer pages={result.data || []} />}
        {result.error && <>
          <h3>
            Got an error: {result.error} 
          </h3>
        </>}
      </main>
      <footer className="flex items-center justify-center gap-6 flex-wrap mt-16">
      </footer>
    </div>
  );
}
