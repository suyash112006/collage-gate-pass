import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Smart Gate Pass</h1>
          <p className="text-gray-500">Welcome to the College Gate Pass Management System</p>
        </div>

        <div className="space-y-4 pt-4">
          <Link href="/student/login" className="block">
            <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              Student Login
            </Button>
          </Link>
          <Link href="/tg/login" className="block">
            <Button variant="outline" className="w-full h-12 text-lg border-gray-300 text-gray-700 hover:bg-gray-50">
              Teacher Guardian Login
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
