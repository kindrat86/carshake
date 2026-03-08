interface EvidenceBarsProps {
  score: number; // 1-5
}

const EvidenceBars = ({ score }: EvidenceBarsProps) => {
  const heights = [6, 9, 12, 15, 18];
  const color = score >= 4 ? 'bg-status-green' : score === 3 ? 'bg-status-amber' : 'bg-status-red';

  return (
    <div className="flex items-end gap-0.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm ${i < score ? color : 'bg-border-light'}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
};

export default EvidenceBars;
