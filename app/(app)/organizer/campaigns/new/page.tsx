import { redirect } from "next/navigation";

export default function CreateCampaignRedirect() {
  redirect("/organizer/create");
}