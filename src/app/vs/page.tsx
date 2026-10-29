import { redirect } from "next/navigation";
import VsClient from "@/components/VsClient";

export const metadata = { title: "대학 투표" };

export default function VotingPage() {
  if (process.env.VS_FRONTEND_ENABLED !== "true") {
    redirect("https://k-unirank.com/vs/");
  }
  return <VsClient />;
}
