interface PlayerCounterProps {
  count: number;
}

export default function PlayerCounter({ count }: PlayerCounterProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-xl">
      <span>Players Connected:</span>
      <span className="font-bold">{count}</span>
    </div>
  );
}
