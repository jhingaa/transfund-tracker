import ProgressBar from "@/components/ProgressBar";

export default function CampaignCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4">
      <div className="h-40 bg-gray-200 rounded-xl mb-4" />

      <h3 className="font-semibold text-lg">
        Help Children Education
      </h3>

      <p className="text-sm text-gray-500 mb-2">
        Support school supplies
      </p>

      <ProgressBar value={60} />

      <div className="text-xs text-gray-500 mt-2">
        120 donors
      </div>
    </div>
  );
}