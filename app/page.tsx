import { redirect } from "next/navigation";

export default function Home() {
  // Directly redirect to dashboard, the layout there will protect it
  // and send unauthenticated users to /login automatically.
  redirect("/dashboard");
}