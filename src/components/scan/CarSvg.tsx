interface CarSvgProps {
  color?: string;
  size?: number;
  className?: string;
}

const CarSvg = ({ color = '#A8A9AD', size = 120, className = '' }: CarSvgProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Car body */}
      <rect x="55" y="40" width="90" height="120" rx="30" fill={color} />
      
      {/* Hood line */}
      <path d="M70 75 L130 75" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
      
      {/* Windshield */}
      <rect x="68" y="55" width="64" height="28" rx="8" fill="rgba(140,200,255,0.5)" />
      
      {/* Rear window */}
      <rect x="72" y="120" width="56" height="22" rx="6" fill="rgba(140,200,255,0.4)" />
      
      {/* Door line - left */}
      <line x1="55" y1="100" x2="68" y2="100" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      {/* Door line - right */}
      <line x1="132" y1="100" x2="145" y2="100" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      
      {/* Side mirrors */}
      <ellipse cx="48" cy="72" rx="6" ry="4" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <ellipse cx="152" cy="72" rx="6" ry="4" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      
      {/* Headlights */}
      <rect x="65" y="42" width="16" height="8" rx="4" fill="rgba(255,255,200,0.9)" />
      <rect x="119" y="42" width="16" height="8" rx="4" fill="rgba(255,255,200,0.9)" />
      
      {/* Taillights */}
      <rect x="67" y="152" width="14" height="6" rx="3" fill="rgba(255,60,60,0.8)" />
      <rect x="119" y="152" width="14" height="6" rx="3" fill="rgba(255,60,60,0.8)" />
      
      {/* Wheels */}
      <circle cx="45" cy="60" r="10" fill="#1a1a1a" />
      <circle cx="45" cy="60" r="5" fill="#333" />
      <circle cx="155" cy="60" r="10" fill="#1a1a1a" />
      <circle cx="155" cy="60" r="5" fill="#333" />
      <circle cx="45" cy="140" r="10" fill="#1a1a1a" />
      <circle cx="45" cy="140" r="5" fill="#333" />
      <circle cx="155" cy="140" r="10" fill="#1a1a1a" />
      <circle cx="155" cy="140" r="5" fill="#333" />
      
      {/* Rim spokes */}
      {[45, 155].map(cx => [60, 140].map(cy => (
        <g key={`${cx}-${cy}`}>
          <line x1={cx} y1={cy-4} x2={cx} y2={cy+4} stroke="#555" strokeWidth="0.8" />
          <line x1={cx-4} y1={cy} x2={cx+4} y2={cy} stroke="#555" strokeWidth="0.8" />
        </g>
      )))}
      
      {/* Shine gradient overlay */}
      <defs>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
      </defs>
      <rect x="55" y="40" width="90" height="120" rx="30" fill="url(#shine)" />
    </svg>
  );
};

export default CarSvg;
