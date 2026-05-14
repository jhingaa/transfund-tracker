import Link from "next/link";

interface LogoProps {
  size?: number;
  href?: string;
  className?: string;
}

function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00b964" />
          <stop offset="100%" stopColor="#00d4aa" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#0069ff" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="44" height="44" rx="12" fill="url(#logoGrad)" />

      {/* Coin circle (fund) */}
      <circle cx="15" cy="29" r="7.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />

      {/* Rupee symbol inside coin */}
      <text x="15" y="33" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="system-ui">₹</text>

      {/* Rising arrow shaft */}
      <line x1="21" y1="24" x2="33" y2="12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />

      {/* Arrow head */}
      <polyline
        points="27.5,11 33.5,11.5 33,17.5"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small sparkle dot — top left */}
      <circle cx="7" cy="8" r="1.5" fill="white" opacity="0.6" />
      <circle cx="12" cy="5" r="1" fill="white" opacity="0.4" />
      <circle cx="5" cy="13" r="1" fill="white" opacity="0.4" />
    </svg>
  );
}

export default function Logo({ size = 36, href = "/", className = "" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <div className="transition-transform duration-300 group-hover:scale-105">
        <LogoIcon size={size} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-gray-900 tracking-tight"
          style={{ fontSize: size * 0.47, lineHeight: 1.1 }}>
          Trans<span style={{ color: "#00b964" }}>Fund</span>
        </span>
        <span className="font-semibold text-gray-400 tracking-widest uppercase"
          style={{ fontSize: size * 0.26, letterSpacing: "0.12em" }}>
          Tracker
        </span>
      </div>
    </Link>
  );
}
