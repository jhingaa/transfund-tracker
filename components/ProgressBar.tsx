type Props = {
  value: number;
};

export default function ProgressBar({ value }: Props) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}