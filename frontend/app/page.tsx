import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the SR form page
  redirect("/sr/new")
}
