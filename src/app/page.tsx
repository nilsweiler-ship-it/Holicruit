import { redirect } from "next/navigation";

/** Entry point — route into the role selector (1.0). */
export default function HomePage() {
  redirect("/select-role");
}
