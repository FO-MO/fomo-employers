import { redirect } from "next/navigation";

export default function OverviewRedirectPage() {
  redirect("/employers/overview/dashboard");
}
