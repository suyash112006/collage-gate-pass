import { redirect } from "next/navigation"

export default function StudentRootPage() {
  // In Phase 1, we just mock the redirect behavior:
  // "Not authenticated? -> Student Login"
  redirect("/student/login")
}
