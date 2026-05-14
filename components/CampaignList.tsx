export default function CampaignList() {
  const campaigns = [
    {
      title: "Education for Kids",
      raised: "₹80,000",
      goal: "₹1,50,000",
      status: "Active",
    },
    {
      title: "Medical Emergency Fund",
      raised: "₹50,000",
      goal: "₹1,00,000",
      status: "Active",
    },
    {
      title: "Food Donation Drive",
      raised: "₹30,000",
      goal: "₹75,000",
      status: "Paused",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <h3 className="font-semibold mb-4">Campaigns</h3>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <div
            key={c.title}
            className="p-4 rounded-xl bg-gray-50 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{c.title}</h4>
              <p className="text-xs text-gray-500">
                {c.raised} raised / {c.goal}
              </p>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full ${
                c.status === "Active"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}