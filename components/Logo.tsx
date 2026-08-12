import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  href?: string;
  className?: string;
}

export default function Logo({ size = 36, href = "/", className = "" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <div className="transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo.png"
          alt="TransFund Tracker"
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
        />
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
