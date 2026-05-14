export default function DonationFeed() {
  const donations = [
    { name: "John Doe", amount: "₹10,000", time: "2m ago" },
    { name: "Sarah", amount: "₹5,000", time: "10m ago" },
    { name: "Alex", amount: "₹2,500", time: "1h ago" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <h3 className="font-semibold mb-4">Recent Donations</h3>

      <div className="space-y-3">
        {donations.map((d) => (
          <div
            key={d.name}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
          >
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-gray-500">{d.time}</p>
            </div>

            <p className="font-semibold">{d.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}