"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

/* ── Scroll-animation hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Campaign Slideshow ── */
const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80",
    quote: "A small act of kindness can change someone's entire world.",
    author: "— Unknown",
  },
  {
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
    quote: "Education is the most powerful weapon you can use to change the world.",
    author: "— Nelson Mandela",
  },
  {
    img: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80",
    quote: "No act of kindness, no matter how small, is ever wasted.",
    author: "— Aesop",
  },
  {
    img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1400&q=80",
    quote: "We rise by lifting others.",
    author: "— Robert Ingersoll",
  },
  {
    img: "https://images.unsplash.com/photo-1593113630400-ea4288922559?auto=format&fit=crop&w=1400&q=80",
    quote: "Alone we can do so little; together we can do so much.",
    author: "— Helen Keller",
  },
];

function CampaignSlideshow() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 400);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current]);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full h-[480px] md:h-[540px] overflow-hidden bg-gray-900">
      {/* Background image */}
      <img
        key={current}
        src={slide.img}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "scale(1.05)" : "scale(1)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Centered quote */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}
      >
        <span className="text-5xl md:text-7xl text-white/30 font-serif leading-none mb-4">"</span>
        <p className="text-2xl md:text-3xl font-bold text-white max-w-3xl leading-snug drop-shadow-lg">
          {slide.quote}
        </p>
        <p className="mt-5 text-white/60 text-sm font-medium tracking-wide">{slide.author}</p>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white text-xl transition border border-white/20">
        ‹
      </button>
      <button onClick={next} className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white text-xl transition border border-white/20">
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-7 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <svg width="34" height="34" viewBox="0 0 44 44" fill="none">
        <defs>
          <linearGradient id="fLogo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00b964" />
            <stop offset="100%" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        <rect width="44" height="44" rx="12" fill="url(#fLogo)" />
        <circle cx="15" cy="29" r="7.5" fill="none" stroke="white" strokeWidth="2.2" />
        <text x="15" y="33" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="system-ui">₹</text>
        <line x1="21" y1="24" x2="33" y2="12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <polyline points="27.5,11 33.5,11.5 33,17.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="8" r="1.5" fill="white" opacity="0.6" />
        <circle cx="12" cy="5" r="1" fill="white" opacity="0.4" />
        <circle cx="5" cy="13" r="1" fill="white" opacity="0.4" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-white tracking-tight" style={{ fontSize: 16 }}>
          Trans<span style={{ color: "#00d4aa" }}>Fund</span>
        </span>
        <span className="font-semibold text-gray-400 uppercase tracking-widest" style={{ fontSize: 9 }}>Tracker</span>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [fundraiseOpen, setFundraiseOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${scrolled ? "shadow-md" : "shadow-sm border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

          <Logo size={36} href="/" />

          <nav className="hidden md:flex items-center gap-1 flex-1 px-4">
            <div className="relative"
              onMouseEnter={() => setDonateOpen(true)}
              onMouseLeave={() => setDonateOpen(false)}>
              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Donate <ChevronDown size={14} className={`transition-transform duration-200 ${donateOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-200 ${donateOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                {["Browse Categories", "Crisis Relief", "Social Impact", "Nonprofits"].map((item) => (
                  <a key={item} href="/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00b964] transition">{item}</a>
                ))}
              </div>
            </div>

            <div className="relative"
              onMouseEnter={() => setFundraiseOpen(true)}
              onMouseLeave={() => setFundraiseOpen(false)}>
              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Fundraise <ChevronDown size={14} className={`transition-transform duration-200 ${fundraiseOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-200 ${fundraiseOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                {["How to Start", "Fundraising Tips", "Team Fundraising", "Charity Fundraising", "Ideas & Blog"].map((item) => (
                  <a key={item} href="/signup" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00b964] transition">{item}</a>
                ))}
              </div>
            </div>

            <a href="#how-it-works" className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              How it works
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 transition">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-[#00b964] hover:bg-[#00a356] text-white px-5 py-2.5 rounded-full transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0" style={{ transition: "all 0.2s" }}>
              Start a TransFund
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 animate-[fadeDown_0.2s_ease]">
            <Link href="/login" className="block text-sm font-medium text-gray-700 py-2">Sign in</Link>
            <Link href="/signup" className="block text-sm font-bold text-[#00b964] py-2">Start a TransFund</Link>
            <a href="#how-it-works" className="block text-sm text-gray-600 py-2">How it works</a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#fdf6f0] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">

          {/* Left */}
          <div className="flex-1 max-w-xl">
            <p className="hero-sub text-sm font-semibold text-[#00b964] uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="pulse-badge inline-block w-2 h-2 rounded-full bg-[#00b964]" />
              No fee to start fundraising
            </p>
            <h1 className="hero-title text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Where successful<br />
              <span className="gradient-text">fundraisers</span> start
            </h1>
            <p className="hero-sub text-lg text-gray-600 mb-4">
              More than <strong>₹50 crore</strong> is raised every week on TransFund Tracker.
            </p>
            <p className="hero-sub text-base text-gray-500 mb-8">
              Get started in just a few minutes — with helpful tools for donors and organizers.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-3">
              <Link href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#00b964] hover:bg-[#00a356] text-white font-bold rounded-full text-base shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                style={{ transition: "all 0.25s ease" }}>
                Start a TransFund
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 hover:border-[#00b964] hover:text-[#00b964] text-gray-700 font-bold rounded-full text-base transition-all duration-200">
                Sign in
              </Link>
            </div>
            <p className="hero-note mt-4 text-xs text-gray-400">TransFund charges no platform fee. You keep more of what you raise.</p>
          </div>

          {/* Right — floating circles */}
          <div className="flex-1 flex items-center justify-center relative min-h-[380px] w-full max-w-lg">
            <div className="float-center absolute w-56 h-56 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-6xl shadow-2xl z-10"
              style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              💚
            </div>
            {[
              { emoji: "🏥", color: "from-blue-300 to-blue-500",   top: "5%",  left: "10%",  size: "w-28 h-28", label: "Medical",   cls: "float-1" },
              { emoji: "🎓", color: "from-purple-300 to-purple-500", top: "5%",  right: "10%", size: "w-24 h-24", label: "Education", cls: "float-2" },
              { emoji: "🌊", color: "from-orange-300 to-red-400",   top: "40%", left: "0%",   size: "w-20 h-20", label: "Relief",    cls: "float-3" },
              { emoji: "🤝", color: "from-yellow-300 to-amber-400", bottom: "10%", left: "15%", size: "w-24 h-24", label: "Community", cls: "float-4" },
              { emoji: "🐾", color: "from-pink-300 to-rose-400",    bottom: "5%", right: "15%", size: "w-28 h-28", label: "Animals",   cls: "float-5" },
              { emoji: "⚡", color: "from-teal-300 to-cyan-500",    top: "38%", right: "2%",  size: "w-20 h-20", label: "Emergency", cls: "float-6" },
            ].map((c, i) => (
              <div key={i}
                className={`${c.cls} absolute ${c.size} rounded-full bg-gradient-to-br ${c.color} flex flex-col items-center justify-center shadow-xl text-3xl cursor-pointer hover:scale-110`}
                style={{ top: c.top, left: (c as any).left, right: (c as any).right, bottom: (c as any).bottom, transition: "transform 0.3s ease" }}>
                {c.emoji}
                <span className="text-white text-[9px] font-bold mt-0.5">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPAIGN SLIDESHOW ── */}
      <CampaignSlideshow />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">How TransFund Tracker works</h2>
            <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">Start raising funds in minutes. It's free, easy, and transparent.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Start your fundraiser", desc: "Create a campaign in minutes using our guided tools. Add your story, goal, and photos.", icon: "🚀", color: "bg-green-50 border-green-200", num: "bg-[#00b964]", delay: "delay-100" },
              { step: "2", title: "Share with everyone",   desc: "Share your fundraiser link on social media and use your dashboard to track progress.",   icon: "📢", color: "bg-blue-50 border-blue-200",   num: "bg-blue-500",   delay: "delay-300" },
              { step: "3", title: "Receive funds securely", desc: "Funds are transferred directly to your bank. Every rupee is tracked and transparent.",  icon: "💰", color: "bg-purple-50 border-purple-200", num: "bg-purple-500", delay: "delay-500" },
            ].map((item) => (
              <div key={item.step} data-animate="fade-up" className={`${item.delay} hover-lift rounded-3xl border-2 ${item.color} p-8`}>
                <div className={`w-10 h-10 ${item.num} text-white rounded-full flex items-center justify-center font-bold text-lg mb-5`}>
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">Fundraise for anything</h2>
            <p className="text-center text-gray-500 mb-12">People raise money for all kinds of causes on TransFund Tracker.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: "Medical",   emoji: "🏥", hover: "hover:bg-red-50 hover:border-red-300",    delay: "delay-100" },
              { name: "Education", emoji: "🎓", hover: "hover:bg-blue-50 hover:border-blue-300",  delay: "delay-200" },
              { name: "Emergency", emoji: "🚨", hover: "hover:bg-orange-50 hover:border-orange-300", delay: "delay-300" },
              { name: "Community", emoji: "🤝", hover: "hover:bg-green-50 hover:border-green-300",  delay: "delay-400" },
              { name: "NGOs",      emoji: "🌍", hover: "hover:bg-teal-50 hover:border-teal-300",   delay: "delay-100" },
              { name: "Memorial",  emoji: "🕊️", hover: "hover:bg-purple-50 hover:border-purple-300", delay: "delay-200" },
              { name: "Animals",   emoji: "🐾", hover: "hover:bg-pink-50 hover:border-pink-300",   delay: "delay-300" },
              { name: "Events",    emoji: "🎉", hover: "hover:bg-yellow-50 hover:border-yellow-300", delay: "delay-400" },
            ].map((cat) => (
              <Link key={cat.name} href="/login"
                data-animate="scale-in"
                className={`${cat.delay} hover-lift bg-white border-2 border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-2 ${cat.hover} transition-colors duration-200 cursor-pointer`}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">Real stories. Real impact.</h2>
            <p className="text-center text-gray-500 mb-12">See how TransFund Tracker has helped thousands of people.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", campaign: "Cancer Treatment Support", amount: "₹4,20,000", quote: "The transparency feature helped donors trust us completely. We exceeded our goal in 3 weeks.", avatar: "🧕", bg: "from-rose-100 to-pink-200", delay: "delay-100", animate: "fade-left" },
              { name: "Arjun M.", campaign: "Flood Relief Kerala",       amount: "₹8,50,000", quote: "Real-time tracking showed every rupee's journey. 2,400 donors joined our cause.",             avatar: "👨", bg: "from-blue-100 to-indigo-200", delay: "delay-200", animate: "fade-up" },
              { name: "Sunita K.", campaign: "Village School Rebuild",   amount: "₹2,75,000", quote: "Parents could see exactly how the funds were used. The trust made all the difference.",       avatar: "👩", bg: "from-emerald-100 to-teal-200", delay: "delay-300", animate: "fade-right" },
            ].map((story) => (
              <div key={story.name} data-animate={story.animate} className={`${story.delay} hover-lift bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden`}>
                <div className={`h-24 bg-gradient-to-br ${story.bg} flex items-center justify-center text-5xl`}>
                  {story.avatar}
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-[#00b964] mb-1">{story.campaign}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mb-3">{story.amount} raised</p>
                  <p className="text-sm text-gray-500 italic leading-relaxed mb-4">"{story.quote}"</p>
                  <p className="text-xs font-semibold text-gray-700">— {story.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-20 px-6 bg-[#fdf6f0]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1" data-animate="fade-left">
            <p className="text-sm font-semibold text-[#00b964] uppercase tracking-widest mb-3">The TransFund Giving Guarantee</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-5">Your donation is protected</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              TransFund Tracker has a dedicated Trust & Safety team working around the clock to protect your donations.
              Every transaction is verified and every rupee is traceable.
            </p>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                "✅ 100% transparent fund utilization",
                "✅ Verified organizer profiles",
                "✅ Secure payment processing",
                "✅ Real-time donation tracking",
                "✅ Dedicated support team",
              ].map((item, i) => (
                <li key={item} data-animate="fade-left" className={`delay-${(i + 1) * 100} font-medium`}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center" data-animate="zoom-in" style={{ transitionDelay: "0.2s" }}>
            <div className="w-72 h-72 rounded-full bg-gradient-to-br from-green-200 via-emerald-300 to-teal-400 flex items-center justify-center shadow-2xl float-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🛡️</div>
                <p className="font-extrabold text-white text-xl">100% Secure</p>
                <p className="text-green-100 text-sm">Giving Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-20 px-6 bg-[#00b964] text-white text-center">
        <div data-animate="scale-in">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to make a difference?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Join over 10 lakh people who trust TransFund Tracker to raise and give with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#00b964] font-extrabold rounded-full text-base hover:bg-gray-100 shadow-xl hover:-translate-y-1 active:translate-y-0"
              style={{ transition: "all 0.25s ease" }}>
              Start a TransFund
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold rounded-full text-base hover:bg-white/10 transition">
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-300 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <FooterLogo />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Transparent fundraising for causes that matter. Every rupee tracked.</p>
              <div className="flex gap-3 mt-4">
                {["📘", "🐦", "📸", "▶️"].map((icon, i) => (
                  <span key={i} className="text-xl cursor-pointer hover:scale-125 transition-transform duration-200">{icon}</span>
                ))}
              </div>
            </div>

            {[
              { heading: "About",     links: ["How it works", "Pricing", "Giving Guarantee", "Newsroom", "Careers", "Partnerships"], href: "#" },
              { heading: "Donate",    links: ["Browse Campaigns", "Crisis Relief", "Medical", "Education", "NGOs", "Emergency"],       href: "/login" },
              { heading: "Fundraise", links: ["Start a campaign", "How to fundraise", "Team fundraising", "Tips & Ideas", "Help Center", "Blog"], href: "/signup" },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">{col.heading}</h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={l}><a href={col.href} className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 TransFund Tracker. All rights reserved.</p>
            <div className="flex gap-6">
              {["Terms", "Privacy Policy", "Cookie Policy", "Accessibility", "Legal"].map((l) => (
                <a key={l} href="#" className="hover:text-gray-300 transition">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
