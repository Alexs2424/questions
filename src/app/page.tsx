import { HomePageContent } from "./_components/HomePageContent";
import { fetchApi, getPages } from "./actions";

export default async function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to Interactive Learning</h1>
      <HomePageContent />
    </div>
  );
}