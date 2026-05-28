import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  Phone,
  CalendarDays,
  Euro,
  DollarSign,
  Wrench,
  PaintBucket,
  Layers,
  ShieldCheck,
  Truck,
  Award,
  Volume2,
  CloudSun,
  AlertTriangle,
  Gem,
  Settings,
  Languages,
  Package,
  Hammer,
  BadgePercent,
  Drill,
  ScrollText,
  Building2,
  Bot,
  Zap
} from "lucide-react";
import { db } from "./firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

const STORAGE_KEY = "hamouda-display-settings-v4";
const NL = String.fromCharCode(10);

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop stop-color='#05070b'/>
      <stop offset='.55' stop-color='#101827'/>
      <stop offset='1' stop-color='#020617'/>
    </linearGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#g)'/>
  <path d='M0 760 C270 590 540 790 850 620 S1260 470 1600 610 V900 H0Z' fill='#f7b500' opacity='.20'/>
  <text x='800' y='370' text-anchor='middle' fill='#f7b500' font-size='92' font-family='Arial' font-weight='900'>HAMOUDI</text>
  <text x='800' y='470' text-anchor='middle' fill='white' font-size='50' font-family='Arial'>Building Materials Display</text>
</svg>`);

const DEFAULT_DATA = {
  language: "he",
  businessNameHe: "חמודי חומרי בניין",
  businessNameAr: "حمودة لمواد البناء",
  sloganHe: "חומרים איכותיים לבנייה מקצועית",
  sloganAr: "مواد عالية الجودة للبناء والمشاريع",
  phone: "054-7285036",
  whatsapp: "0547285036",
  primaryColor: "#f5b21a",
  backgroundColor: "#05070b",
  textScale: 0.66,
  slideSeconds: 8,
  tickerSpeed: 95,
  musicUrl: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  backgroundMusicUrl: "",
  backgroundMusicVolume: 0.07,
  heroImageUrl: "",
  tickerText: "",
  alertText: "",
  goldPrice: "--",
  newsApiKey: "",
  constructionNews: [],
  projectImages: [FALLBACK_IMAGE],
  backgroundImages: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1920&q=80"
  ],
  projectTitlesAr: ["مشروع من أعمالنا"],
  projectTitlesHe: ["פרויקט מהעבודות שלנו"],
  logoText: "ח",
  heroSlides: [
    {
      titleHe: "כל מה שהקבלן צריך במקום אחד",
      titleAr: "كل ما يحتاجه المقاول في مكان واحد",
      subtitleHe: "ברזל • מלט • צבעים • גבס • כלי עבודה • חומרי איטום",
      subtitleAr: "حديد • إسمنت • دهانات • جبص • أدوات • عزل",
      image: FALLBACK_IMAGE,
      images: [FALLBACK_IMAGE],
      media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }],
      tagHe: "דף הבית",
      tagAr: "الرئيسية"
    }
  ],
  prices: [
    { nameHe: "מלט", nameAr: "إسمنت", price: "29", unitHe: "שק", unitAr: "كيس", change: "+1", direction: "up", icon: "cement" },
    { nameHe: "ברזל 8 מ״מ", nameAr: "حديد 8 ملم", price: "32", unitHe: "מ׳", unitAr: "متر", change: "0", direction: "flat", icon: "steel" },
    { nameHe: "ברזל 10 מ״מ", nameAr: "حديد 10 ملم", price: "38", unitHe: "מ׳", unitAr: "متر", change: "-1", direction: "down", icon: "steel" },
    { nameHe: "ברזל 12 מ״מ", nameAr: "حديد 12 ملم", price: "43", unitHe: "מ׳", unitAr: "متر", change: "+2", direction: "up", icon: "steel" },
    { nameHe: "גבס לבן", nameAr: "جبص أبيض", price: "45", unitHe: "לוח", unitAr: "لوح", change: "0", direction: "flat", icon: "gypsum" },
    { nameHe: "צבע פנים", nameAr: "دهان داخلي", price: "120", unitHe: "גלון", unitAr: "غالون", change: "-5", direction: "down", icon: "paint" },
    { nameHe: "חול דק", nameAr: "رمل ناعم", price: "180", unitHe: "קוב", unitAr: "كوب", change: "+5", direction: "up", icon: "sand" },
    { nameHe: "חומר איטום", nameAr: "مادة عزل", price: "65", unitHe: "יח׳", unitAr: "قطعة", change: "0", direction: "flat", icon: "seal" }
  ],
  topProductsHe: ["מלט", "ברזל", "גבס", "צבעים", "חומרי איטום", "כלי עבודה"],
  topProductsAr: ["إسمنت", "حديد", "جبص", "دهانات", "مواد عزل", "أدوات عمل"],
  offerTitleHe: "מבצע השבוע",
  offerTitleAr: "عرض الأسبوع",
  offerTextHe: "הנחה על צבעים וחומרי איטום",
  offerTextAr: "خصم على الدهانات ومواد العزل",
  offerPercent: "5%",
  tickerHe: ["🔥 מבצעים יומיים על חומרי בניין", "🚚 אספקה מהירה להזמנות גדולות", "🏗️ ציוד מלא לקבלנים ופרויקטים", "📞 להזמנות ושירות: 054-7285036"],
  tickerAr: ["🔥 عروض يومية على مواد البناء", "🚚 توصيل سريع للطلبات الكبيرة", "🏗️ تجهيز كامل للمقاولين والمشاريع", "📞 للطلب والاستفسار: 054-7285036"]
};

function injectTvTheme() {
  if (typeof document === "undefined" || document.getElementById("hamouda-tv-pixel-theme-v2")) return;
  const style = document.createElement("style");
  style.id = "hamouda-tv-pixel-theme-v2";
  style.innerHTML = `
    :root {
      --gold: #f5b21a;
      --gold2: #ffdc63;
      --dark: #05070b;
      --panel: rgba(9,15,25,.88);
      --line: rgba(245,178,26,.55);
    }
    * { box-sizing: border-box; }
    body { margin: 0; overflow: hidden; background:#03060b; }
    .tv-root {
      position:relative;
      isolation:isolate;
      width: 100vw;
      height: 100vh;
      color: #fff;
      overflow: hidden;
      background:#03060b;
      font-family: Heebo, Arial, sans-serif;
    }

    /* Dynamic construction background controlled from Firebase: backgroundImages */
    .background-slideshow {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 0%, rgba(245,178,26,.15), transparent 34%),
        linear-gradient(180deg, #03060b 0%, #06101e 56%, #03060b 100%);
      pointer-events:none;
    }

    .background-slideshow img {
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      object-fit:cover;
      object-position:center center;
      filter: blur(8px) brightness(.42) saturate(1.18);
      transform: scale(1.10);
      opacity:0;
      transition: opacity 1.35s ease-in-out;
      will-change: opacity, transform;
    }

    .background-slideshow img.active {
      opacity:1;
      animation: bgSlowZoom 18s ease-in-out infinite;
    }

    .background-vignette {
      position:fixed;
      inset:0;
      z-index:1;
      pointer-events:none;
      background:
        radial-gradient(circle at 50% 22%, rgba(245,178,26,.12), transparent 30%),
        radial-gradient(circle at 85% 65%, rgba(245,178,26,.10), transparent 34%),
        linear-gradient(180deg, rgba(3,6,11,.58), rgba(3,6,11,.78));
    }

    .pixel-shell, .hidden-controls, .live-alert, .settings-drawer {
      position: relative;
      z-index: 2;
    }

    @keyframes bgSlowZoom {
      0%,100% { transform:scale(1.10); }
      50% { transform:scale(1.17); }
    }
    .pixel-shell { height: 100%; padding: .85vw; display:flex; flex-direction:column; gap:.8vw; }
    .glass-panel {
      border: 1px solid rgba(245,178,26,.38);
      background: linear-gradient(180deg, rgba(12,20,33,.82), rgba(4,9,15,.88));
      border-radius: 1.25vw;
      box-shadow: 0 0 0 1px rgba(255,255,255,.04) inset, 0 0 28px rgba(245,178,26,.12);
    }
    .topbar { height: 5.9vw; display:grid; grid-template-columns: 1.45fr 3.25fr 1.25fr; align-items:center; padding:.55vw .75vw; gap:.75vw; }
    .brand { display:flex; align-items:center; gap:.9vw; }
    .logo-box {
      width:4.35vw; height:4.35vw; border-radius:1vw;
      display:grid; place-items:center; font-size:2.25vw; font-weight:1000;
      color:#07111f; background:linear-gradient(135deg, #f2aa12, #ffe27b);
      box-shadow: 0 0 24px rgba(245,178,26,.75), inset 0 0 12px rgba(255,255,255,.5);
    }
    .brand-title { font-size:2.05vw; line-height:1; font-weight:1000; letter-spacing:-.03em; text-shadow:0 0 12px rgba(255,255,255,.18); }
    .brand-sub { margin-top:.35vw; color:rgba(255,255,255,.72); font-size:.9vw; font-weight:700; }
    .top-pills { display:flex; justify-content:center; gap:.48vw; overflow:hidden; }
    .data-pill {
      min-width:6.7vw; height:3.75vw; border-radius:.75vw; padding:.35vw .65vw;
      display:grid; grid-template-columns:2.05vw 1fr; align-items:center; gap:.42vw;
      border:1px solid rgba(245,178,26,.32);
      background:linear-gradient(180deg, rgba(8,13,22,.92), rgba(3,7,12,.96));
      box-shadow:0 0 16px rgba(245,178,26,.10);
    }
    .pill-icon {
      width:2.05vw; height:2.05vw; border-radius:.55vw; display:grid; place-items:center;
      color:var(--gold2); border:1px solid rgba(245,178,26,.45);
      background:radial-gradient(circle, rgba(245,178,26,.18), rgba(0,0,0,.15));
      filter: drop-shadow(0 0 8px rgba(245,178,26,.55));
    }
    .pill-label { color:rgba(255,255,255,.63); font-size:.7vw; font-weight:800; }
    .pill-value { font-size:.86vw; color:var(--gold2); font-weight:1000; text-shadow:0 0 10px rgba(245,178,26,.45); white-space:nowrap; }
    .pill-change { color:#27f36b; font-size:.72vw; font-weight:1000; margin-inline-start:.25vw; }
    .time-box { display:flex; align-items:center; justify-content:flex-end; gap:.75vw; }
    .time-main { color:var(--gold2); font-size:1.55vw; font-weight:1000; text-shadow:0 0 12px rgba(245,178,26,.55); }
    .date-main { color:rgba(255,255,255,.72); font-size:.86vw; font-weight:700; text-align:end; }
    .main-grid { flex:1; min-height:0; display:grid; grid-template-columns: 24.6vw 1fr 24.2vw; gap:.85vw; }
    .prices-card { padding:.8vw; display:flex; flex-direction:column; min-height:0; }
    .section-title { display:flex; align-items:center; justify-content:center; gap:.8vw; color:var(--gold); font-size:1.25vw; font-weight:1000; margin:.1vw 0 .7vw; }
    .section-title:before,.section-title:after { content:""; height:1px; width:4.1vw; background:linear-gradient(90deg, transparent, var(--gold), transparent); }
    .price-list {
      display:flex;
      flex-direction:column;
      gap:.42vw;
      overflow:hidden;
      height:100%;
      min-height:0;
      position:relative;
    }
    .price-list:before,
    .price-list:after {
      content:"";
      position:absolute;
      left:0;
      right:0;
      height:1.2vw;
      z-index:2;
      pointer-events:none;
    }
    .price-list:before {
      top:0;
      background:linear-gradient(180deg, rgba(6,10,17,.96), transparent);
    }
    .price-list:after {
      bottom:0;
      background:linear-gradient(0deg, rgba(6,10,17,.96), transparent);
    }
    .price-track {
      display:flex;
      flex-direction:column;
      gap:.42vw;
      animation: priceWheel 60s linear infinite;
      will-change:transform;
    }
    @keyframes priceWheel {
      0% { transform:translateY(0); }
      100% { transform:translateY(-50%); }
    }
    .price-row {
      height:3.75vw; flex:0 0 3.75vw; display:grid; grid-template-columns:3vw 1fr 5.5vw 2.35vw; align-items:center; gap:.52vw;
      border-radius:.65vw; padding:.35vw .55vw; border:1px solid rgba(255,255,255,.10);
      background:linear-gradient(90deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
      box-shadow:inset 0 0 18px rgba(255,255,255,.025);
    }
    .price-row:nth-child(1), .price-row:hover { border-color:rgba(245,178,26,.70); box-shadow:0 0 18px rgba(245,178,26,.20), inset 0 0 18px rgba(245,178,26,.05); }
    .prod-icon { width:2.55vw; height:2.55vw; border-radius:.55vw; border:1px solid rgba(245,178,26,.35); display:grid; place-items:center; color:#fff; background:rgba(0,0,0,.32); }
    .prod-name { font-size:.95vw; font-weight:1000; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .prod-unit { font-size:.65vw; color:rgba(255,255,255,.58); font-weight:700; margin-top:.05vw; }
    .prod-price { color:white; font-size:1.55vw; font-weight:1000; text-align:end; text-shadow:0 0 12px rgba(255,245,214,.75); animation: valueGlow 2.8s ease-in-out infinite; }
    .prod-change { font-size:.85vw; font-weight:1000; text-align:center; }
    .up { color:#24ff65; } .down { color:#ff4052; } .flat { color:rgba(255,255,255,.68); }
    .small-note { font-size:.62vw; color:rgba(255,255,255,.64); text-align:center; margin-top:.25vw; }
    .hero-card { position:relative; overflow:hidden; min-height:0; }
    .hero-media {
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#050911;
      overflow:hidden;
    }
    .hero-media img,
    .hero-media video {
      max-width:100%;
      max-height:100%;
      width:auto;
      height:auto;
      object-fit:contain;
      object-position:center center;
      display:block;
      opacity:.96;
      transition:opacity .65s ease;
    }
    .hero-dark { position:absolute; inset:0; background:linear-gradient(90deg, rgba(0,0,0,.22), rgba(0,0,0,.10), rgba(0,0,0,.35)); pointer-events:none; }
    .hero-content { position:absolute; top:12%; right:6%; width:47%; text-align:right; }
    .hero-title { font-size:3.15vw; line-height:1.02; font-weight:1000; color:white; text-shadow:0 .12vw .1vw #000, 0 0 18px rgba(0,0,0,.7); }
    .hero-title .gold { display:block; color:var(--gold); font-size:3.25vw; text-shadow:0 0 18px rgba(245,178,26,.55); }
    .hero-subtitle { margin-top:.9vw; color:#fff; font-weight:900; font-size:1.02vw; text-shadow:0 0 10px #000; }
    .hero-service-bar { position:absolute; bottom:.95vw; right:1.2vw; left:1.2vw; height:4.8vw; display:grid; grid-template-columns:repeat(3,1fr); gap:.8vw; }
    .service-box { border-top:1px solid rgba(245,178,26,.25); background:rgba(0,0,0,.46); border-radius:.7vw; display:grid; grid-template-columns:3vw 1fr; align-items:center; gap:.45vw; padding:.65vw; }
    .service-icon { width:2.65vw; height:2.65vw; border-radius:.55vw; display:grid; place-items:center; background:rgba(245,178,26,.11); color:var(--gold); border:1px solid rgba(245,178,26,.30); }
    .service-title { font-size:.93vw; font-weight:1000; }
    .service-sub { font-size:.62vw; color:rgba(255,255,255,.64); font-weight:700; }
    .hero-arrow { position:absolute; top:47%; width:2.45vw; height:2.45vw; border-radius:50%; display:grid; place-items:center; background:rgba(0,0,0,.55); color:#fff; border:1px solid rgba(245,178,26,.55); box-shadow:0 0 18px rgba(245,178,26,.35); font-size:1.9vw; font-weight:900; }
    .arrow-left { left:.85vw; } .arrow-right { right:.85vw; }
    .dots { position:absolute; bottom:6.25vw; left:50%; transform:translateX(-50%); display:flex; gap:.42vw; }
    .dot { width:.72vw; height:.72vw; border-radius:50%; background:rgba(255,255,255,.62); box-shadow:0 0 8px rgba(255,255,255,.2); }
    .dot.active { background:var(--gold); box-shadow:0 0 12px rgba(245,178,26,.9); }
    .offer-card {
      position:relative; overflow:hidden; padding:1.3vw; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
      border-color:rgba(245,178,26,.72);
      background:
        radial-gradient(circle at 50% 35%, rgba(245,178,26,.20), transparent 28%),
        linear-gradient(180deg, rgba(12,12,11,.96), rgba(4,7,12,.98));
      box-shadow:0 0 30px rgba(245,178,26,.22), inset 0 0 48px rgba(245,178,26,.06);
    }
    .offer-card:before { content:""; position:absolute; inset:-30%; background:radial-gradient(circle, rgba(255,223,100,.25), transparent 22%); animation: shimmer 6s linear infinite; opacity:.55; }
    .offer-title { position:relative; font-size:1.75vw; font-weight:1000; text-shadow:0 0 18px rgba(255,255,255,.35); }
    .offer-percent { position:relative; color:var(--gold2); font-size:6.7vw; line-height:1; font-weight:1000; margin:.8vw 0 .5vw; text-shadow:0 0 22px rgba(245,178,26,.85), 0 0 60px rgba(245,178,26,.35); animation: pulseGold 2.4s ease-in-out infinite; }
    .offer-word { position:relative; font-size:2vw; font-weight:1000; }
    .offer-text { position:relative; font-size:1.2vw; font-weight:1000; margin-top:.4vw; }
    .offer-button { position:relative; margin-top:1.6vw; width:70%; padding:.75vw 1vw; border-radius:.65vw; background:linear-gradient(180deg, #f7c238, #d99505); color:#09111f; font-size:1.25vw; font-weight:1000; box-shadow:0 0 26px rgba(245,178,26,.55); }
    .projects-card {
      position:relative; overflow:hidden; padding:1vw; display:flex; flex-direction:column; text-align:center;
      border-color:rgba(245,178,26,.72);
      background:
        radial-gradient(circle at 50% 20%, rgba(245,178,26,.17), transparent 30%),
        linear-gradient(180deg, rgba(12,20,33,.96), rgba(4,7,12,.98));
      box-shadow:0 0 30px rgba(245,178,26,.20), inset 0 0 48px rgba(245,178,26,.055);
    }
    .projects-card:before { content:""; position:absolute; inset:-30%; background:radial-gradient(circle, rgba(255,223,100,.18), transparent 23%); animation: shimmer 7s linear infinite; opacity:.5; }
    .projects-title { position:relative; color:var(--gold2); font-size:1.35vw; font-weight:1000; margin-bottom:.75vw; text-shadow:0 0 14px rgba(245,178,26,.55); }
    .project-photo-wrap {
      position:relative; flex:1; min-height:0; border-radius:1vw; overflow:hidden;
      border:1px solid rgba(245,178,26,.52); background:#050911;
      box-shadow:0 0 22px rgba(245,178,26,.22), inset 0 0 22px rgba(255,255,255,.035);
    }
    .project-photo-wrap img,
    .project-photo-wrap video {
      width:100%; height:100%; object-fit:cover; object-position:center center; display:block;
    }
    .project-photo-wrap img {
      animation: projectKenBurns 10s ease-in-out infinite;
    }
    .project-overlay {
      position:absolute; left:0; right:0; bottom:0; padding:1vw .7vw .75vw;
      background:linear-gradient(0deg, rgba(0,0,0,.86), rgba(0,0,0,.50), transparent);
    }
    .project-name { color:#fff; font-size:1.25vw; font-weight:1000; text-shadow:0 0 12px #000; }
    .project-desc { color:rgba(255,255,255,.82); font-size:.72vw; font-weight:800; margin-top:.25vw; }
    .project-footer { position:relative; margin-top:.72vw; color:#fff; font-size:.8vw; font-weight:900; line-height:1.35; }
    .project-footer strong { color:var(--gold2); font-size:1vw; display:block; margin-bottom:.15vw; }
    @keyframes projectKenBurns { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
    .ticker-wrap { height:4.8vw; display:grid; grid-template-columns:11.8vw 1fr; align-items:center; padding:.55vw; overflow:hidden; }
    .ticker-label {
      height:100%; display:flex; align-items:center; justify-content:center; gap:.6vw; color:#07111f;
      background:linear-gradient(135deg, #ffdb54, #f0a300); border-radius:.7vw; font-size:1.05vw; font-weight:1000;
      clip-path:polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%);
    }
    .ticker-window { position:relative; overflow:hidden; height:100%; display:flex; align-items:center; border:1px solid rgba(245,178,26,.33); border-radius:.65vw; background:rgba(0,0,0,.45); }
    .ticker-track { display:inline-block; white-space:nowrap; padding-inline-start:0; padding-inline-end:4vw; color:#fff; font-size:1.1vw; font-weight:900; animation: tickerMove linear infinite; will-change:transform; }
    .bottom-nav { height:4.9vw; display:grid; grid-template-columns:repeat(7,1fr); align-items:center; padding:.48vw; gap:.5vw; }
    .nav-item { height:100%; border:1px solid rgba(255,255,255,.12); border-radius:.6vw; background:linear-gradient(180deg, rgba(255,255,255,.045), rgba(0,0,0,.28)); display:flex; align-items:center; justify-content:center; gap:.65vw; font-size:1.02vw; font-weight:900; color:#fff; }
    .nav-item.active { color:var(--gold2); border-color:rgba(245,178,26,.85); box-shadow:0 0 18px rgba(245,178,26,.35), inset 0 0 16px rgba(245,178,26,.10); }
    .hidden-controls { position:fixed; top:.9vw; left:.9vw; z-index:40; display:flex; gap:.45vw; opacity:.04; transition:opacity .2s; }
    .hidden-controls:hover { opacity:1; }
    .control-btn { border:0; background:#f5b21a; color:#07111f; border-radius:.5vw; font-weight:900; padding:.45vw .7vw; cursor:pointer; }
    .settings-drawer { position:fixed; top:0; left:0; width:32vw; max-width:540px; height:100vh; overflow:auto; z-index:80; background:#07111f; border-right:1px solid rgba(245,178,26,.45); padding:1vw; }
    .settings-drawer input,.settings-drawer select,.settings-drawer textarea { width:100%; background:#111827; color:#fff; border:1px solid rgba(255,255,255,.14); border-radius:.55vw; padding:.7vw; margin-top:.25vw; }
    .settings-drawer label { display:block; margin-bottom:.7vw; font-size:.8vw; color:rgba(255,255,255,.75); }
    .settings-box { border:1px solid rgba(255,255,255,.1); padding:.8vw; border-radius:.8vw; margin-bottom:.8vw; background:rgba(255,255,255,.04); }

    .live-alert {
      position:fixed;
      top:6.95vw;
      left:50%;
      transform:translateX(-50%);
      z-index:60;
      min-width:42vw;
      max-width:76vw;
      min-height:3vw;
      border-radius:.85vw;
      padding:.55vw 1.1vw;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.7vw;
      color:#fff;
      font-size:1.15vw;
      font-weight:1000;
      background:linear-gradient(135deg, rgba(182,18,18,.96), rgba(255,67,67,.92), rgba(140,9,9,.96));
      border:1px solid rgba(255,255,255,.28);
      box-shadow:0 0 28px rgba(255,44,44,.45), inset 0 0 20px rgba(255,255,255,.1);
      animation: alertPulse 1.8s ease-in-out infinite;
      text-shadow:0 0 10px rgba(0,0,0,.65);
    }
    @keyframes alertPulse { 0%,100% { opacity:.92; transform:translateX(-50%) scale(1); } 50% { opacity:1; transform:translateX(-50%) scale(1.025); } }
    @keyframes tickerMove { 0% { transform:translateX(0); } 100% { transform:translateX(45%); } }
    @keyframes shimmer { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes pulseGold { 0%,100% { transform:scale(1); } 50% { transform:scale(1.035); } }
    @keyframes valueGlow { 0%,100% { text-shadow:0 0 8px rgba(255,245,214,.48); } 50% { text-shadow:0 0 18px rgba(255,245,214,.9); } }

    /* Clean hero: hide all overlay text, icons, arrows and dots over image */
    .hero-content, .hero-title, .hero-subtitle, .hero-arrow, .dots, .hero-service-bar, .service-box, .hero-dark {
      display:none !important;
    }
    .hero-media {
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#050911;
      overflow:hidden;
    }
    .hero-media img,
    .hero-media video {
      max-width:100%;
      max-height:100%;
      width:auto;
      height:auto;
      object-fit:contain;
      object-position:center center;
      display:block;
      opacity:1;
    }


    /* HAMOODI AI cinematic product showcase - safe add-on */
    .ai-cinema-shell {
      position:absolute;
      inset:0;
      z-index:4;
      display:grid;
      grid-template-rows: 5.2vw 1fr 8.3vw;
      gap:.55vw;
      padding:.9vw 1vw;
      background:
        radial-gradient(circle at 50% 42%, rgba(0,194,255,.13), transparent 33%),
        linear-gradient(90deg, rgba(0,0,0,.66), rgba(0,0,0,.18), rgba(0,0,0,.64));
    }
    .ai-headline {
      display:grid;
      grid-template-columns:4.6vw 1fr;
      align-items:center;
      gap:.8vw;
      width:77%;
      justify-self:center;
      border:1px solid rgba(56,211,255,.55);
      background:linear-gradient(180deg, rgba(2,15,28,.86), rgba(0,5,11,.72));
      border-radius:1vw;
      padding:.55vw .8vw;
      box-shadow:0 0 28px rgba(0,195,255,.18), inset 0 0 26px rgba(0,195,255,.08);
    }
    .ai-avatar {
      width:3.8vw;
      height:3.8vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      color:#06111c;
      background:radial-gradient(circle, #8df3ff, #0097ff 55%, #062141 100%);
      box-shadow:0 0 24px rgba(0,210,255,.85);
      animation: aiFloat 2.6s ease-in-out infinite;
    }
    .ai-text-main { font-size:1.15vw; font-weight:1000; color:#fff; line-height:1.2; }
    .ai-text-main strong { color:#65eaff; text-shadow:0 0 14px rgba(101,234,255,.7); }
    .voice-bars { display:flex; align-items:flex-end; gap:.16vw; height:.9vw; margin-top:.28vw; direction:ltr; }
    .voice-bars span { width:.12vw; border-radius:1vw; background:linear-gradient(180deg,#7ff5ff,#f5b21a); animation: voiceWave .8s ease-in-out infinite; opacity:.95; }
    .voice-bars span:nth-child(2n){ animation-delay:.1s; }
    .voice-bars span:nth-child(3n){ animation-delay:.2s; }
    .voice-bars span:nth-child(4n){ animation-delay:.3s; }

    .cinema-center {
      position:relative;
      display:grid;
      grid-template-columns: 1fr 9vw;
      gap:.8vw;
      min-height:0;
    }
    .cinema-product-stage {
      position:relative;
      overflow:hidden;
      border:1px solid rgba(245,178,26,.42);
      border-radius:1.15vw;
      background:
        radial-gradient(circle at 50% 55%, rgba(245,178,26,.18), transparent 24%),
        linear-gradient(180deg, rgba(6,13,24,.72), rgba(1,4,9,.84));
      box-shadow:0 0 34px rgba(245,178,26,.15), inset 0 0 60px rgba(255,255,255,.035);
    }
    .scan-line {
      position:absolute;
      top:0; bottom:0;
      width:.22vw;
      background:linear-gradient(180deg, transparent, rgba(104,239,255,.95), transparent);
      box-shadow:0 0 24px rgba(104,239,255,.9);
      animation: scanMove 4.2s ease-in-out infinite;
      z-index:5;
    }
    .stage-floor {
      position:absolute;
      left:12%; right:12%; bottom:10%; height:2.3vw;
      border-radius:50%;
      background:radial-gradient(ellipse, rgba(245,178,26,.55), rgba(245,178,26,.12) 45%, transparent 70%);
      filter:blur(.1vw);
      animation: floorPulse 2s ease-in-out infinite;
    }
    .cinema-product-title {
      position:absolute;
      top:.9vw;
      right:1vw;
      z-index:6;
      color:var(--gold2);
      font-size:1.65vw;
      font-weight:1000;
      text-shadow:0 0 18px rgba(245,178,26,.65);
    }
    .cinema-product-price {
      position:absolute;
      left:1vw;
      bottom:1vw;
      z-index:6;
      min-width:7.5vw;
      border-radius:.9vw;
      border:1px solid rgba(245,178,26,.65);
      background:rgba(0,0,0,.76);
      padding:.55vw .8vw;
      text-align:center;
      box-shadow:0 0 25px rgba(245,178,26,.25);
    }
    .cinema-product-price b { display:block; color:#fff; font-size:2vw; line-height:1; text-shadow:0 0 16px rgba(255,255,255,.65); }
    .cinema-product-price small { color:var(--gold2); font-weight:900; font-size:.75vw; }

    .product-visual {
      position:absolute;
      left:50%; top:52%;
      transform:translate(-50%,-50%);
      width:15vw; height:15vw;
      z-index:4;
    }
    .cement-bag {
      width:9.2vw; height:12.4vw;
      margin:1vw auto 0;
      border-radius:.9vw .9vw .55vw .55vw;
      background:linear-gradient(135deg,#d8ad6c,#f7dfad 35%,#9a6b37 100%);
      border:.12vw solid rgba(255,255,255,.35);
      box-shadow:0 1vw 3vw rgba(0,0,0,.55), inset 0 0 1vw rgba(255,255,255,.25);
      animation: cementSpin 4.5s ease-in-out infinite;
      transform-style:preserve-3d;
      position:relative;
    }
    .cement-bag:before { content:'אסמנט'; position:absolute; top:2.4vw; left:.8vw; right:.8vw; text-align:center; font-size:1.25vw; font-weight:1000; color:#102033; }
    .cement-bag:after { content:'50 KG'; position:absolute; bottom:2.4vw; left:0; right:0; text-align:center; font-size:1.05vw; font-weight:1000; color:#102033; }
    .cement-dust { position:absolute; inset:auto 0 1.1vw 0; height:3vw; background:radial-gradient(circle,rgba(255,220,150,.35),transparent 65%); filter:blur(.5vw); animation:dustBurst 2.2s ease-in-out infinite; }

    .steel-bars { position:absolute; left:50%; bottom:2.6vw; width:12vw; height:12vw; transform:translateX(-50%); }
    .steel-bars span { position:absolute; bottom:0; width:.72vw; border-radius:.4vw; background:repeating-linear-gradient(0deg,#a7b4c8 0 .22vw,#485569 .22vw .42vw); box-shadow:0 0 18px rgba(118,214,255,.55); animation:steelRise 3.2s cubic-bezier(.2,.8,.2,1) infinite; }
    .steel-bars span:nth-child(1){ left:1vw; height:8vw; animation-delay:0s; }
    .steel-bars span:nth-child(2){ left:3vw; height:10.2vw; animation-delay:.15s; }
    .steel-bars span:nth-child(3){ left:5vw; height:11.4vw; animation-delay:.3s; }
    .steel-bars span:nth-child(4){ left:7vw; height:9.4vw; animation-delay:.45s; }
    .steel-bars span:nth-child(5){ left:9vw; height:7.8vw; animation-delay:.6s; }
    .rock-burst { position:absolute; left:50%; bottom:1.9vw; width:12vw; height:3vw; transform:translateX(-50%); background:radial-gradient(ellipse, rgba(255,190,75,.45), transparent 62%); filter:blur(.18vw); animation:rockShake 1.25s ease-in-out infinite; }

    .paint-scene { position:absolute; inset:0; overflow:hidden; }
    .paint-can { position:absolute; left:50%; bottom:2.6vw; width:8vw; height:6.1vw; transform:translateX(-50%); border-radius:.65vw .65vw 1.3vw 1.3vw; background:linear-gradient(90deg,#f5b21a,#fff,#f5b21a); border:.15vw solid rgba(255,255,255,.5); box-shadow:0 .8vw 2vw rgba(0,0,0,.55); z-index:3; }
    .paint-can:after { content:''; position:absolute; left:-.2vw; right:-.2vw; top:-.7vw; height:1.4vw; border-radius:50%; background:linear-gradient(90deg,#c8c8c8,#fff,#b1b1b1); border:.12vw solid rgba(255,255,255,.55); }
    .paint-pour { position:absolute; top:-2vw; left:50%; width:5vw; height:11vw; transform:translateX(-50%); background:linear-gradient(180deg,#ff2bd6,#7b2cff 42%,#19d5ff); border-radius:0 0 2.8vw 2.8vw; filter:drop-shadow(0 0 18px rgba(255,43,214,.8)); animation:paintPour 2.9s ease-in-out infinite; z-index:4; }
    .paint-splash { position:absolute; left:50%; bottom:7.4vw; width:10vw; height:3vw; transform:translateX(-50%); background:radial-gradient(ellipse,#ff2bd6,rgba(123,44,255,.8) 42%,transparent 70%); filter:blur(.08vw); animation:splashPulse 2.9s ease-in-out infinite; z-index:5; }

    .electric-scene { position:absolute; inset:0; }
    .electric-coil { position:absolute; left:50%; bottom:3vw; width:10vw; height:5vw; transform:translateX(-50%); border:.55vw solid #111827; border-top-color:#2dd4ff; border-right-color:#101827; border-radius:50%; box-shadow:0 0 24px rgba(45,212,255,.8); animation:electricPulse 1.6s ease-in-out infinite; }
    .spark { position:absolute; background:#7df9ff; box-shadow:0 0 15px #7df9ff; transform-origin:center; clip-path:polygon(45% 0,62% 40%,100% 42%,65% 60%,78% 100%,48% 67%,12% 100%,30% 58%,0 42%,38% 38%); animation:sparkFlash 1.15s ease-in-out infinite; }
    .spark.s1 { left:42%; top:25%; width:2vw; height:3vw; }
    .spark.s2 { left:58%; top:35%; width:1.4vw; height:2.2vw; animation-delay:.3s; }
    .spark.s3 { left:49%; top:15%; width:1.1vw; height:1.8vw; animation-delay:.55s; }

    .wood-stack { position:absolute; left:50%; top:52%; width:12vw; height:10vw; transform:translate(-50%,-50%); }
    .wood-plank { position:absolute; left:50%; width:10vw; height:1.4vw; transform:translateX(-50%); border-radius:.25vw; background:linear-gradient(90deg,#8b4e16,#e2aa5c 45%,#70410f); box-shadow:0 .3vw .8vw rgba(0,0,0,.45); animation:woodSlide 3.2s ease-in-out infinite; }
    .wood-plank:nth-child(1){ bottom:1vw; animation-delay:0s; }
    .wood-plank:nth-child(2){ bottom:2.5vw; animation-delay:.16s; }
    .wood-plank:nth-child(3){ bottom:4vw; animation-delay:.32s; }
    .wood-plank:nth-child(4){ bottom:5.5vw; animation-delay:.48s; }

    .cinema-thumbs { display:grid; gap:.48vw; }
    .cinema-thumb { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,.12); border-radius:.75vw; background:rgba(0,0,0,.44); display:grid; place-items:center; color:#fff; opacity:.7; transition:.35s ease; }
    .cinema-thumb.active { opacity:1; border-color:rgba(245,178,26,.85); box-shadow:0 0 20px rgba(245,178,26,.32); color:var(--gold2); transform:scale(1.04); }
    .cinema-thumb svg { width:1.7vw; height:1.7vw; }
    .cinema-thumb span { font-size:.55vw; font-weight:1000; margin-top:.15vw; }

    @keyframes aiFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-.25vw); } }
    @keyframes voiceWave { 0%,100% { height:.18vw; } 50% { height:.9vw; } }
    @keyframes scanMove { 0% { left:-3%; opacity:0; } 15%,85% { opacity:1; } 100% { left:103%; opacity:0; } }
    @keyframes floorPulse { 0%,100% { opacity:.55; transform:scaleX(.9); } 50% { opacity:1; transform:scaleX(1.12); } }
    @keyframes cementSpin { 0% { transform:rotateY(-28deg) rotateZ(-1deg); } 45% { transform:rotateY(28deg) rotateZ(1deg); } 100% { transform:rotateY(-28deg) rotateZ(-1deg); } }
    @keyframes dustBurst { 0%,100% { opacity:.2; transform:scale(.75); } 50% { opacity:.7; transform:scale(1.2); } }
    @keyframes steelRise { 0% { transform:translateY(8vw); opacity:.15; } 28%,70% { transform:translateY(0); opacity:1; } 100% { transform:translateY(8vw); opacity:.15; } }
    @keyframes rockShake { 0%,100% { transform:translateX(-50%) scale(.8); opacity:.3; } 50% { transform:translateX(-50%) scale(1.15); opacity:.85; } }
    @keyframes paintPour { 0% { transform:translateX(-50%) translateY(-10vw) scaleY(.15); opacity:0; } 22%,72% { transform:translateX(-50%) translateY(0) scaleY(1); opacity:1; } 100% { transform:translateX(-50%) translateY(4vw) scaleY(.2); opacity:0; } }
    @keyframes splashPulse { 0%,100% { transform:translateX(-50%) scale(.45); opacity:.2; } 45%,70% { transform:translateX(-50%) scale(1.15); opacity:.95; } }
    @keyframes electricPulse { 0%,100% { filter:brightness(1); transform:translateX(-50%) scale(1); } 50% { filter:brightness(1.8); transform:translateX(-50%) scale(1.08); } }
    @keyframes sparkFlash { 0%,100% { opacity:.1; transform:scale(.35) rotate(0deg); } 50% { opacity:1; transform:scale(1.15) rotate(14deg); } }
    @keyframes woodSlide { 0% { transform:translateX(9vw); opacity:0; } 30%,75% { transform:translateX(-50%); opacity:1; } 100% { transform:translateX(-12vw); opacity:0; } }

    @media (max-aspect-ratio: 14/9) {
      .topbar { grid-template-columns: 1.6fr 2.2fr 1.5fr; }
      .main-grid { grid-template-columns: 24.5vw 1fr 24vw; }
    }
  `;
  document.head.appendChild(style);
}

function normalizeData(input) {
  const merged = { ...DEFAULT_DATA, ...(input || {}) };
  merged.musicUrl = String(merged.musicUrl || DEFAULT_DATA.musicUrl || "");
  merged.backgroundMusicUrl = String(merged.backgroundMusicUrl || "");
  merged.backgroundMusicVolume = Math.min(1, Math.max(0, Number(merged.backgroundMusicVolume ?? 0.07) || 0.07));
  const slides = (merged.heroSlides || DEFAULT_DATA.heroSlides).map((slide) => {
    const oldImages = slide.images && slide.images.length ? slide.images : [slide.image || FALLBACK_IMAGE];
    let media = slide.media && slide.media.length
      ? slide.media
      : oldImages.map((src, i) => ({ type: "image", src, name: slide.imageNames?.[i] || `image-${i + 1}` }));
    media = media.filter((m) => m?.src && !String(m.src).startsWith("blob:"));
    if (!media.length) media = [{ type: "image", src: FALLBACK_IMAGE, name: "default" }];
    return { ...slide, image: media[0]?.src || FALLBACK_IMAGE, images: media.filter((m) => m.type === "image").map((m) => m.src), media };
  });
  const projectImages = Array.isArray(merged.projectImages) && merged.projectImages.length
    ? merged.projectImages.filter(Boolean).map(String)
    : [FALLBACK_IMAGE];
  const backgroundImages = Array.isArray(merged.backgroundImages) && merged.backgroundImages.length
    ? merged.backgroundImages.filter(Boolean).map(String)
    : (DEFAULT_DATA.backgroundImages || []);
  const projectTitlesAr = Array.isArray(merged.projectTitlesAr) ? merged.projectTitlesAr.map(String) : [];
  const projectTitlesHe = Array.isArray(merged.projectTitlesHe) ? merged.projectTitlesHe.map(String) : [];
  return { ...merged, heroSlides: slides, projectImages, backgroundImages, projectTitlesAr, projectTitlesHe };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeData(JSON.parse(saved)) : normalizeData(DEFAULT_DATA);
  } catch {
    return normalizeData(DEFAULT_DATA);
  }
}

function compactForStorage(data) {
  return {
    ...data,
    heroSlides: (data.heroSlides || []).map((s) => ({
      ...s,
      image: FALLBACK_IMAGE,
      images: [FALLBACK_IMAGE],
      media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }]
    })),
    projectImages: data.projectImages || [],
    backgroundImages: data.backgroundImages || [],
    projectTitlesAr: data.projectTitlesAr || [],
    projectTitlesHe: data.projectTitlesHe || []
  };
}

function saveLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactForStorage(data)));
  } catch {}
}

const t = (data, heKey, arKey) => (data.language === "ar" ? data[arKey] : data[heKey]);
const itemT = (data, item, heKey, arKey) => (data.language === "ar" ? item?.[arKey] : item?.[heKey]);

const isVideoUrl = (url) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(url || ""));

function applyFirebaseSettings(base, remote) {
  if (!remote) return base;
  const next = { ...base };

  if (remote.language === "ar" || remote.language === "he") next.language = remote.language;
  if (remote.storeNameAr) next.businessNameAr = remote.storeNameAr;
  if (remote.storeNameHe) next.businessNameHe = remote.storeNameHe;
  if (remote.storeName && !remote.storeNameAr) next.businessNameAr = remote.storeName;
  if (remote.sloganAr) next.sloganAr = remote.sloganAr;
  if (remote.sloganHe) next.sloganHe = remote.sloganHe;
  if (remote.phone) next.phone = remote.phone;
  if (remote.primaryColor) next.primaryColor = remote.primaryColor;
  if (remote.secondaryColor) next.backgroundColor = remote.secondaryColor;
  if (remote.offerTitleAr) next.offerTitleAr = remote.offerTitleAr;
  if (remote.offerTitleHe) next.offerTitleHe = remote.offerTitleHe;
  if (remote.offerTextAr) next.offerTextAr = remote.offerTextAr;
  if (remote.offerTextHe) next.offerTextHe = remote.offerTextHe;
  if (remote.offerTitle && !remote.offerTitleAr) next.offerTitleAr = remote.offerTitle;
  if (remote.offerText && !remote.offerTextAr) next.offerTextAr = remote.offerText;
  if (remote.offerPercent !== undefined) next.offerPercent = String(remote.offerPercent).includes("%") ? String(remote.offerPercent) : `${remote.offerPercent}%`;
  if (remote.tickerSpeed !== undefined) next.tickerSpeed = Number(remote.tickerSpeed) || next.tickerSpeed;
  if (remote.alertText !== undefined) next.alertText = String(remote.alertText || "");
  if (remote.goldPrice !== undefined) next.goldPrice = String(remote.goldPrice || "--");
  if (remote.newsApiKey !== undefined) next.newsApiKey = String(remote.newsApiKey || "");
  if (remote.musicUrl !== undefined) next.musicUrl = String(remote.musicUrl || "");
  if (remote.backgroundMusicUrl !== undefined) next.backgroundMusicUrl = String(remote.backgroundMusicUrl || "");
  if (remote.backgroundMusicVolume !== undefined) {
    const vol = Number(remote.backgroundMusicVolume);
    next.backgroundMusicVolume = Number.isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.07;
  }
  if (remote.constructionNews !== undefined) {
    next.constructionNews = Array.isArray(remote.constructionNews)
      ? remote.constructionNews.filter(Boolean).map(String)
      : String(remote.constructionNews || "").split("|").map((x) => x.trim()).filter(Boolean);
  }

  if (remote.projectImages !== undefined) {
    next.projectImages = Array.isArray(remote.projectImages)
      ? remote.projectImages.filter(Boolean).map(String)
      : String(remote.projectImages || "").split("|").map((x) => x.trim()).filter(Boolean);
  }
  if (remote.backgroundImages !== undefined) {
    next.backgroundImages = Array.isArray(remote.backgroundImages)
      ? remote.backgroundImages.filter(Boolean).map(String)
      : String(remote.backgroundImages || "").split("|").map((x) => x.trim()).filter(Boolean);
  }
  if (remote.projectTitlesAr !== undefined) {
    next.projectTitlesAr = Array.isArray(remote.projectTitlesAr)
      ? remote.projectTitlesAr.filter(Boolean).map(String)
      : String(remote.projectTitlesAr || "").split("|").map((x) => x.trim()).filter(Boolean);
  }
  if (remote.projectTitlesHe !== undefined) {
    next.projectTitlesHe = Array.isArray(remote.projectTitlesHe)
      ? remote.projectTitlesHe.filter(Boolean).map(String)
      : String(remote.projectTitlesHe || "").split("|").map((x) => x.trim()).filter(Boolean);
  }

  if (remote.heroImages && Array.isArray(remote.heroImages) && remote.heroImages.length > 0) {
    const images = remote.heroImages.filter(Boolean);
    const firstSlide = next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
    next.heroSlides = [{
      ...firstSlide,
      image: images[0],
      images,
      media: images.map((img, index) => ({ type: isVideoUrl(img) ? "video" : "image", src: img, name: `firebase-media-${index}` }))
    }];
  } else if (remote.heroImageUrl) {
    const firstSlide = next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
    next.heroSlides = [{
      ...firstSlide,
      image: remote.heroImageUrl,
      images: [remote.heroImageUrl],
      media: [{ type: isVideoUrl(remote.heroImageUrl) ? "video" : "image", src: remote.heroImageUrl, name: "firebase-media" }]
    }];
  }

  if (remote.tickerTextAr) next.tickerAr = [remote.tickerTextAr];
  if (remote.tickerTextHe) next.tickerHe = [remote.tickerTextHe];
  if (remote.tickerText && !remote.tickerTextAr) next.tickerAr = [remote.tickerText];

  if (remote.prices && Array.isArray(remote.prices) && remote.prices.length > 0) {
    next.prices = remote.prices.map((p, i) => ({
      nameHe: p.nameHe || "",
      nameAr: p.nameAr || "",
      price: String(p.price ?? "0"),
      unitHe: p.unitHe || "",
      unitAr: p.unitAr || "",
      change: p.change || "0",
      direction: p.direction || "flat",
      icon: p.icon || DEFAULT_DATA.prices[i % DEFAULT_DATA.prices.length]?.icon || "package"
    }));
  }

  if (remote.exchangeUSD !== undefined) next.exchangeUSD = remote.exchangeUSD;
  if (remote.exchangeEUR !== undefined) next.exchangeEUR = remote.exchangeEUR;
  if (remote.exchangeJOD !== undefined) next.exchangeJOD = remote.exchangeJOD;

  return normalizeData(next);
}

function toFirebaseSettings(data) {
  return {
    language: data.language || "he",
    storeNameAr: data.businessNameAr || "",
    storeNameHe: data.businessNameHe || "",
    sloganAr: data.sloganAr || "",
    sloganHe: data.sloganHe || "",
    phone: data.phone || "",
    primaryColor: data.primaryColor || "#f5b21a",
    secondaryColor: data.backgroundColor || "#05070b",
    offerTitleAr: data.offerTitleAr || "",
    offerTitleHe: data.offerTitleHe || "",
    offerTextAr: data.offerTextAr || "",
    offerTextHe: data.offerTextHe || "",
    offerPercent: Number(String(data.offerPercent || "0").replace("%", "")) || 0,
    tickerSpeed: Number(data.tickerSpeed || 95),
    musicUrl: data.musicUrl || "",
    backgroundMusicUrl: data.backgroundMusicUrl || "",
    backgroundMusicVolume: Number(data.backgroundMusicVolume ?? 0.07),
    alertText: data.alertText || "",
    goldPrice: data.goldPrice || "--",
    newsApiKey: data.newsApiKey || "",
    constructionNews: data.constructionNews || [],
    projectImages: data.projectImages || [],
    backgroundImages: data.backgroundImages || [],
    projectTitlesAr: data.projectTitlesAr || [],
    projectTitlesHe: data.projectTitlesHe || [],
    tickerTextAr: data.tickerAr?.[0] || "",
    tickerTextHe: data.tickerHe?.[0] || "",
    prices: (data.prices || []).map((p) => ({
      nameHe: p.nameHe || "",
      nameAr: p.nameAr || "",
      price: String(p.price ?? "0"),
      unitHe: p.unitHe || "",
      unitAr: p.unitAr || "",
      change: p.change || "0",
      direction: p.direction || "flat",
      icon: p.icon || "package"
    })),
    updatedAt: new Date().toISOString()
  };
}

function ProductIcon({ type }) {
  const props = { size: 22, strokeWidth: 1.8 };
  const key = String(type || "").toLowerCase();
  if (key.includes("cement") || key.includes("מלט")) return <Package {...props} />;
  if (key.includes("steel") || key.includes("ברזל")) return <Layers {...props} />;
  if (key.includes("paint") || key.includes("צבע")) return <PaintBucket {...props} />;
  if (key.includes("gypsum") || key.includes("גבס")) return <ScrollText {...props} />;
  if (key.includes("sand") || key.includes("חול")) return <Building2 {...props} />;
  if (key.includes("seal") || key.includes("איטום")) return <ShieldCheck {...props} />;
  return <Package {...props} />;
}

function PriceRow({ p, data }) {
  const dirClass = p.direction === "up" ? "up" : p.direction === "down" ? "down" : "flat";
  const arrow = p.direction === "up" ? "↑" : p.direction === "down" ? "↓" : "–";
  return (
    <div className="price-row">
      <div className="prod-icon"><ProductIcon type={p.icon || p.nameHe} /></div>
      <div>
        <div className="prod-name">{itemT(data, p, "nameHe", "nameAr")}</div>
        <div className="prod-unit">{itemT(data, p, "unitHe", "unitAr")}</div>
      </div>
      <div className="prod-price">₪{p.price}</div>
      <div className={`prod-change ${dirClass}`}>{arrow} {p.change}</div>
    </div>
  );
}


const CINEMATIC_ITEMS = [
  { key: "cement", labelHe: "מלט", labelAr: "إسمنت", icon: Package },
  { key: "steel", labelHe: "ברזל", labelAr: "حديد", icon: Layers },
  { key: "paint", labelHe: "צבעים", labelAr: "دهانات", icon: PaintBucket },
  { key: "electric", labelHe: "חשמל", labelAr: "كهرباء", icon: Zap },
  { key: "wood", labelHe: "עץ", labelAr: "أخشاب", icon: Hammer }
];

function getCinematicKind(item) {
  const text = `${item?.icon || ""} ${item?.nameHe || ""} ${item?.nameAr || ""}`.toLowerCase();
  if (text.includes("steel") || text.includes("ברזל") || text.includes("حديد")) return "steel";
  if (text.includes("paint") || text.includes("צבע") || text.includes("دهان")) return "paint";
  if (text.includes("electric") || text.includes("חשמל") || text.includes("كهرب")) return "electric";
  if (text.includes("wood") || text.includes("עץ") || text.includes("خشب")) return "wood";
  return "cement";
}

function CinematicProductDisplay({ activePrice, data, activeKind }) {
  const isAr = data.language === "ar";
  const name = itemT(data, activePrice, "nameHe", "nameAr") || (isAr ? "منتج مميز" : "מוצר מוביל");
  const unit = itemT(data, activePrice, "unitHe", "unitAr") || "";
  const price = activePrice?.price ?? "--";
  const label = isAr ? "HAMOODI AI يعرض الآن" : "HAMOODI AI מציג עכשיו";

  return (
    <div className="ai-cinema-shell">
      <div className="ai-headline">
        <div className="ai-avatar"><Bot size={34} /></div>
        <div>
          <div className="ai-text-main"><strong>HAMOODI AI</strong> — {label}: {name}</div>
          <div className="voice-bars">{Array.from({ length: 34 }).map((_, i) => <span key={i} />)}</div>
        </div>
      </div>

      <div className="cinema-center">
        <div className="cinema-product-stage">
          <div className="scan-line" />
          <div className="stage-floor" />
          <div className="cinema-product-title">{name}</div>
          <div className="cinema-product-price"><b>₪{price}</b><small>{unit}</small></div>
          <ProductAnimation kind={activeKind} />
        </div>
        <div className="cinema-thumbs">
          {CINEMATIC_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKind;
            return (
              <div key={item.key} className={`cinema-thumb ${active ? "active" : ""}`}>
                <div style={{ textAlign: "center" }}><Icon /><span>{isAr ? item.labelAr : item.labelHe}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hero-service-bar" style={{ display: "grid" }}>
        <div className="service-box"><div className="service-icon"><Truck size={26} /></div><div><div className="service-title">{isAr ? "توصيل سريع" : "אספקה מהירה"}</div><div className="service-sub">{isAr ? "للمشاريع والطلبات" : "להזמנות ופרויקטים"}</div></div></div>
        <div className="service-box"><div className="service-icon"><Award size={26} /></div><div><div className="service-title">{isAr ? "جودة مضمونة" : "איכות מובטחת"}</div><div className="service-sub">{isAr ? "مواد مختارة" : "חומרים נבחרים"}</div></div></div>
        <div className="service-box"><div className="service-icon"><Phone size={26} /></div><div><div className="service-title">{data.phone}</div><div className="service-sub">{isAr ? "للطلب والاستفسار" : "להזמנות ושירות"}</div></div></div>
      </div>
    </div>
  );
}

function ProductAnimation({ kind }) {
  if (kind === "steel") {
    return <div className="product-visual"><div className="rock-burst" /><div className="steel-bars"><span /><span /><span /><span /><span /></div></div>;
  }
  if (kind === "paint") {
    return <div className="product-visual"><div className="paint-scene"><div className="paint-pour" /><div className="paint-splash" /><div className="paint-can" /></div></div>;
  }
  if (kind === "electric") {
    return <div className="product-visual"><div className="electric-scene"><div className="electric-coil" /><div className="spark s1" /><div className="spark s2" /><div className="spark s3" /></div></div>;
  }
  if (kind === "wood") {
    return <div className="product-visual"><div className="wood-stack"><div className="wood-plank" /><div className="wood-plank" /><div className="wood-plank" /><div className="wood-plank" /></div></div>;
  }
  return <div className="product-visual"><div className="cement-dust" /><div className="cement-bag" /></div>;
}

function CurrencyPill({ icon, label, value, change }) {
  return (
    <div className="data-pill">
      <div className="pill-icon">{icon}</div>
      <div>
        <div className="pill-label">{label}</div>
        <div className="pill-value">{value} {change && <span className="pill-change">{change}</span>}</div>
      </div>
    </div>
  );
}

export default function HamoudaPremiumDisplay() {
  injectTvTheme();

  const [data, setData] = useState(loadData);
  const [draft, setDraft] = useState(data);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [fx, setFx] = useState({ loading: true, usdIls: "--", eurIls: "--", eurUsd: "--", jodIls: "--" });
  const [weather, setWeather] = useState({ loading: true, temp: "--", labelAr: "الطقس", labelHe: "מזג אוויר" });
  const [gold, setGold] = useState({ loading: true, price: "--" });
  const [constructionNews, setConstructionNews] = useState([]);
  const [firebaseSettingsId, setFirebaseSettingsId] = useState(null);

  const [cinemaIndex, setCinemaIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCinemaIndex((v) => (v + 1) % Math.max(1, (data.prices || []).length));
    }, 4200);
    return () => clearInterval(timer);
  }, [data.prices]);

  const isAr = data.language === "ar";
  const locale = isAr ? "ar" : "he";
  const currentSlide = data.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
  const slideMedia = currentSlide?.media?.length ? currentSlide.media : [{ type: "image", src: FALLBACK_IMAGE, name: "fallback" }];
  const currentMedia = slideMedia[imageIndex % Math.max(1, slideMedia.length)] || { type: "image", src: FALLBACK_IMAGE };
  const projectImages = data.projectImages?.length ? data.projectImages : [FALLBACK_IMAGE];
  const currentProjectImage = projectImages[projectIndex % Math.max(1, projectImages.length)] || FALLBACK_IMAGE;
  const currentProjectIsVideo = isVideoUrl(currentProjectImage);
  const currentProjectTitle =
    (isAr ? data.projectTitlesAr?.[projectIndex % Math.max(1, projectImages.length)] : data.projectTitlesHe?.[projectIndex % Math.max(1, projectImages.length)]) ||
    (isAr ? "مشروع من أعمالنا" : "פרויקט מהעבודות שלנו");
  const backgroundImages = data.backgroundImages?.length ? data.backgroundImages : (DEFAULT_DATA.backgroundImages || []);
  const currentBackground = backgroundImages[bgIndex % Math.max(1, backgroundImages.length)] || FALLBACK_IMAGE;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "settings"),
      (snapshot) => {
        if (snapshot.empty) return;
        const firstDoc = snapshot.docs[0];
        setFirebaseSettingsId(firstDoc.id);
        const remote = firstDoc.data();
        setData((current) => applyFirebaseSettings(current, remote));
        setDraft((current) => applyFirebaseSettings(current, remote));
      },
      (error) => console.error("Firebase settings error:", error)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const mediaCount = slideMedia.length || 1;
    const seconds = Math.max(4, Number(data.slideSeconds || 8));
    const timer = setInterval(() => setImageIndex((v) => (v + 1) % mediaCount), seconds * 1000);
    return () => clearInterval(timer);
  }, [slideMedia.length, data.slideSeconds]);

  useEffect(() => {
    const count = data.projectImages?.length || 1;
    const soundUrl = data.musicUrl || "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

    const playTransitionSound = () => {
      if (!soundUrl) return;
      try {
        const transitionSound = new Audio(soundUrl);
        transitionSound.volume = 0.14;
        transitionSound.currentTime = 0;
        transitionSound.play().catch(() => {});
      } catch {}
    };

    const timer = setInterval(() => {
      playTransitionSound();
      setProjectIndex((v) => (v + 1) % count);
    }, 10000);

    return () => clearInterval(timer);
  }, [data.projectImages?.length, data.musicUrl]);

  useEffect(() => {
    const count = data.backgroundImages?.length || 1;
    setBgIndex((v) => v % count);

    const timer = setInterval(() => {
      setBgIndex((v) => (v + 1) % count);
    }, 15000);

    return () => clearInterval(timer);
  }, [(data.backgroundImages || []).join("|")]);

  useEffect(() => {
    const musicUrl = String(data.backgroundMusicUrl || "").trim();
    if (!musicUrl) return;

    const bgMusic = new Audio(musicUrl);
    bgMusic.loop = true;
    bgMusic.volume = Math.min(1, Math.max(0, Number(data.backgroundMusicVolume ?? 0.07) || 0.07));
    bgMusic.preload = "auto";

    const tryPlay = () => {
      bgMusic.play().catch(() => {});
    };

    tryPlay();

    // Browsers may block autoplay until the first click/touch/key press.
    window.addEventListener("click", tryPlay, { once: true });
    window.addEventListener("touchstart", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
  }, [data.backgroundMusicUrl, data.backgroundMusicVolume]);

  useEffect(() => {
    async function getRates() {
      try {
        const r = await fetch("https://open.er-api.com/v6/latest/USD");
        const j = await r.json();
        const usdIls = j?.rates?.ILS;
        const eur = j?.rates?.EUR;
        const jod = j?.rates?.JOD;
        setFx({
          loading: false,
          usdIls: usdIls ? usdIls.toFixed(3) : "--",
          eurIls: usdIls && eur ? (usdIls / eur).toFixed(3) : "--",
          eurUsd: eur ? (1 / eur).toFixed(3) : "--",
          jodIls: usdIls && jod ? (usdIls / jod).toFixed(3) : "--"
        });
      } catch {
        setFx({ loading: false, usdIls: "--", eurIls: "--", eurUsd: "--", jodIls: "--" });
      }
    }
    getRates();
    const i = setInterval(getRates, 1000 * 60 * 60);
    return () => clearInterval(i);
  }, []);


  useEffect(() => {
    async function getWeather() {
      try {
        // Nablus coordinates. Free API, no key needed.
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=32.2211&longitude=35.2544&current=temperature_2m,weather_code&timezone=Asia%2FJerusalem");
        const j = await r.json();
        const temp = j?.current?.temperature_2m;
        const code = Number(j?.current?.weather_code ?? 0);
        const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code);
        const isCloud = [1, 2, 3, 45, 48].includes(code);
        setWeather({
          loading: false,
          temp: temp !== undefined ? `${Math.round(temp)}°` : "--",
          labelAr: isRain ? "ماطر" : isCloud ? "غائم" : "مشمس",
          labelHe: isRain ? "גשום" : isCloud ? "מעונן" : "שמשי"
        });
      } catch {
        setWeather({ loading: false, temp: "--", labelAr: "الطقس", labelHe: "מזג אוויר" });
      }
    }
    getWeather();
    const i = setInterval(getWeather, 1000 * 60 * 30);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    async function getGold() {
      try {
        // Public fallback endpoint; Firebase goldPrice overrides this if provided.
        const r = await fetch("https://api.gold-api.com/price/XAU");
        const j = await r.json();
        const price = j?.price || j?.price_gram_24k || j?.ask;
        setGold({ loading: false, price: price ? Number(price).toFixed(0) : "--" });
      } catch {
        setGold({ loading: false, price: "--" });
      }
    }
    getGold();
    const i = setInterval(getGold, 1000 * 60 * 15);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    async function getConstructionNews() {
      if (!data.newsApiKey) {
        setConstructionNews([]);
        return;
      }
      try {
        const q = encodeURIComponent("construction OR housing OR building materials OR contractors");
        const r = await fetch(`https://newsapi.org/v2/everything?q=${q}&language=he&sortBy=publishedAt&pageSize=5&apiKey=${data.newsApiKey}`);
        const j = await r.json();
        const titles = (j?.articles || []).map((a) => a?.title).filter(Boolean).slice(0, 5);
        setConstructionNews(titles);
      } catch {
        setConstructionNews([]);
      }
    }
    getConstructionNews();
    const i = setInterval(getConstructionNews, 1000 * 60 * 30);
    return () => clearInterval(i);
  }, [data.newsApiKey]);

  const tickerText = useMemo(() => {
    const arr = isAr ? data.tickerAr : data.tickerHe;
    const base = (arr && arr.length ? arr : DEFAULT_DATA.tickerHe);
    const manualNews = Array.isArray(data.constructionNews) ? data.constructionNews : [];
    const newsItems = [...manualNews, ...constructionNews].filter(Boolean);
    return [...base, ...newsItems.map((n) => `🏗️ ${n}`)].join("     •     ");
  }, [data, isAr, constructionNews]);

  const topProducts = isAr ? data.topProductsAr : data.topProductsHe;

  const saveSettings = async () => {
    saveLocal(draft);
    setData(draft);
    setSettingsOpen(false);
    try {
      const targetId = firebaseSettingsId || "main";
      await setDoc(doc(db, "settings", targetId), toFirebaseSettings(draft), { merge: true });
      setFirebaseSettingsId(targetId);
    } catch (error) {
      console.error("Firebase save error:", error);
    }
  };

  const toggleLanguage = () => {
    setData((d) => {
      const next = { ...d, language: d.language === "he" ? "ar" : "he" };
      saveLocal(next);
      const targetId = firebaseSettingsId || "main";
      setDoc(doc(db, "settings", targetId), toFirebaseSettings(next), { merge: true }).catch(console.error);
      setFirebaseSettingsId(targetId);
      return next;
    });
  };

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const activeCinemaPrice = (data.prices || [])[cinemaIndex % Math.max(1, (data.prices || []).length)] || DEFAULT_DATA.prices[0];
  const activeCinemaKind = getCinematicKind(activeCinemaPrice);

  return (
    <div dir="rtl" className="tv-root">
      <div className="background-slideshow">
        {backgroundImages.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className={i === bgIndex % Math.max(1, backgroundImages.length) ? "active" : ""}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          />
        ))}
      </div>
      <div className="background-vignette" />
      {data.alertText && (
        <div className="live-alert"><AlertTriangle size={26} /> {data.alertText}</div>
      )}
      <div className="hidden-controls">
        <button className="control-btn" onClick={() => { setDraft(data); setSettingsOpen(true); }}><Settings size={16} /></button>
        <button className="control-btn" onClick={toggleLanguage}><Languages size={16} /></button>
      </div>

      <div className="pixel-shell">
        <header className="topbar glass-panel">
          <div className="brand">
            <div className="logo-box">{data.logoText}</div>
            <div>
              <div className="brand-title">{t(data, "businessNameHe", "businessNameAr")}</div>
              <div className="brand-sub">{t(data, "sloganHe", "sloganAr")}</div>
            </div>
          </div>

          <div className="top-pills">
            <CurrencyPill icon={<CloudSun size={26} />} label={isAr ? (weather.labelAr || "الطقس") : (weather.labelHe || "מזג אוויר")} value={weather.temp} />
            <CurrencyPill icon={<Euro size={26} />} label={isAr ? "يورو" : "אירו"} value={`${data.exchangeEUR ?? fx.eurIls} €`} />
            <CurrencyPill icon={<DollarSign size={26} />} label={isAr ? "دولار" : "דולר"} value={`${data.exchangeUSD ?? fx.usdIls} $`} />
            <CurrencyPill icon={<span style={{fontWeight:1000,fontSize:".78vw"}}>JD</span>} label={isAr ? "دينار" : "דינר"} value={`${data.exchangeJOD ?? fx.jodIls} JD`} />
            <CurrencyPill icon={<Gem size={26} />} label={isAr ? "ذهب" : "זהב"} value={`$${data.goldPrice !== "--" ? data.goldPrice : gold.price}`} />
            <CurrencyPill icon={<Phone size={26} />} label={isAr ? "هاتف" : "טלפון"} value={data.phone} />
          </div>

          <div className="time-box">
            <div className="pill-icon"><CalendarDays size={28} /></div>
            <div>
              <div className="date-main">{now.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
              <div className="time-main">{now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
            </div>
          </div>
        </header>

        <section className="main-grid">
          <aside className="prices-card glass-panel">
            <div className="section-title">{isAr ? "أسعار اليوم" : "מחירי היום"} <BadgePercent size={20} /></div>
            <div className="price-list">
              <div className="price-track">
                {[...(data.prices || []), ...(data.prices || [])].map((p, i) => (
                  <PriceRow key={`${p.nameHe}-${i}`} p={p} data={data} />
                ))}
              </div>
            </div>
            <div className="small-note">* {isAr ? "الأسعار تتحدث حسب البيانات" : "המחירים מתעדכנים בזמן אמת"}</div>
          </aside>

          <main className="hero-card glass-panel">
            <div className="hero-media">
              {currentMedia.type === "video" ? (
                <video src={currentMedia.src} autoPlay muted loop playsInline />
              ) : (
                <img src={currentMedia.src || FALLBACK_IMAGE} alt="slide" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
              )}
            </div>
            <CinematicProductDisplay activePrice={activeCinemaPrice} data={data} activeKind={activeCinemaKind} />
          </main>

          <aside className="projects-card glass-panel">
            <div className="projects-title">
              📸 {isAr ? "مشاريع تم تنفيذها بموادنا" : "פרויקטים שבוצעו עם החומרים שלנו"}
            </div>

            <div className="project-photo-wrap">
              {currentProjectIsVideo ? (
                <video
                  key={currentProjectImage}
                  src={currentProjectImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={currentProjectImage}
                  alt="project"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
              )}
              <div className="project-overlay">
                <div className="project-name">{currentProjectTitle}</div>
                <div className="project-desc">
                  {isAr ? "تم التوريد من حمودة لمواد البناء" : "סופק על ידי חמודי חומרי בניין"}
                </div>
              </div>
            </div>

            <div className="project-footer">
              <strong>{isAr ? "نفخر بمساهمتنا في مئات المشاريع الناجحة" : "גאים לקחת חלק במאות פרויקטים מוצלחים"}</strong>
              {isAr ? "فلل • مطابخ • مبانٍ تجارية • مشاريع إسكانية" : "וילות • מטבחים • מבנים מסחריים • פרויקטים למגורים"}
            </div>
          </aside>
        </section>

        <section className="ticker-wrap glass-panel">
          <div className="ticker-label"><Volume2 size={28} /> {isAr ? "عروض وتحديثات" : "מבצעים ועדכונים"}</div>
          <div className="ticker-window">
            <div className="ticker-track" style={{ animationDuration: `${Math.max(25, Number(data.tickerSpeed || 95))}s` }}>
              {tickerText}     •     {tickerText}
            </div>
          </div>
        </section>

        <nav className="bottom-nav glass-panel">
          <div className="nav-item"><Wrench size={30} /> {isAr ? "أدوات عمل" : "כלי עבודה"}</div>
          <div className="nav-item"><ShieldCheck size={30} /> {isAr ? "مواد عزل" : "חומרי איטום"}</div>
          <div className="nav-item"><PaintBucket size={30} /> {isAr ? "دهانات" : "צבעים"}</div>
          <div className="nav-item"><ScrollText size={30} /> {isAr ? "جبص" : "גבס"}</div>
          <div className="nav-item"><Layers size={30} /> {isAr ? "حديد" : "ברזל"}</div>
          <div className="nav-item"><Package size={30} /> {isAr ? "إسمنت" : "מלט"}</div>
          <div className="nav-item active"><Home size={32} /> {isAr ? "الرئيسية" : "דף הבית"}</div>
        </nav>
      </div>

      {settingsOpen && (
        <aside className="settings-drawer">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1vw"}}>
            <h2 style={{fontSize:"1.6vw",fontWeight:1000}}>لوحة الإعدادات</h2>
            <button className="control-btn" onClick={() => setSettingsOpen(false)}>إغلاق</button>
          </div>

          <div className="settings-box">
            <label>لغة الشاشة
              <select value={draft.language} onChange={(e) => updateDraft("language", e.target.value)}>
                <option value="he">עברית</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <label>اسم المحل عبري <input value={draft.businessNameHe} onChange={(e) => updateDraft("businessNameHe", e.target.value)} /></label>
            <label>اسم المحل عربي <input value={draft.businessNameAr} onChange={(e) => updateDraft("businessNameAr", e.target.value)} /></label>
            <label>رقم الهاتف <input value={draft.phone} onChange={(e) => updateDraft("phone", e.target.value)} /></label>
          </div>

          <div className="settings-box">
            <label>روابط صور خلفية الشاشة، افصل بينها بـ |
              <textarea
                rows={5}
                value={(draft.backgroundImages || []).join(" | ")}
                onChange={(e) => updateDraft("backgroundImages", e.target.value.split("|").map(x => x.trim()).filter(Boolean))}
                placeholder="https://...jpg | https://...jpg | https://...jpg"
              />
            </label>
            <label>روابط صور المشاريع، افصل بينها بـ |
              <textarea
                rows={5}
                value={(draft.projectImages || []).join(" | ")}
                onChange={(e) => updateDraft("projectImages", e.target.value.split("|").map(x => x.trim()).filter(Boolean))}
                placeholder="https://...jpg | https://...mp4 | https://...webm"
              />
            </label>
            <label>أسماء المشاريع بالعربي، افصل بينها بـ |
              <input
                value={(draft.projectTitlesAr || []).join(" | ")}
                onChange={(e) => updateDraft("projectTitlesAr", e.target.value.split("|").map(x => x.trim()).filter(Boolean))}
                placeholder="فيلا سكنية | مطبخ عصري | مبنى تجاري"
              />
            </label>
            <label>أسماء المشاريع بالعبري، افصل بينها بـ |
              <input
                value={(draft.projectTitlesHe || []).join(" | ")}
                onChange={(e) => updateDraft("projectTitlesHe", e.target.value.split("|").map(x => x.trim()).filter(Boolean))}
                placeholder="וילה למגורים | מטבח מודרני | פרויקט מסחרי"
              />
            </label>
            <label>رابط صوت الانتقال MP3
              <input
                value={draft.musicUrl || ""}
                onChange={(e) => updateDraft("musicUrl", e.target.value)}
                placeholder="https://...mp3"
              />
            </label>
            <label>رابط الموسيقى الخلفية المستمرة MP3
              <input
                value={draft.backgroundMusicUrl || ""}
                onChange={(e) => updateDraft("backgroundMusicUrl", e.target.value)}
                placeholder="https://...mp3"
              />
            </label>
            <label>مستوى صوت الموسيقى الخلفية 0.01 - 1
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={draft.backgroundMusicVolume ?? 0.07}
                onChange={(e) => updateDraft("backgroundMusicVolume", Number(e.target.value))}
                placeholder="0.07"
              />
            </label>
            <label>سرعة شريط الأخبار <input type="number" value={draft.tickerSpeed} onChange={(e) => updateDraft("tickerSpeed", Number(e.target.value))} /></label>
            <label>تنبيه فوري <input value={draft.alertText || ""} onChange={(e) => updateDraft("alertText", e.target.value)} /></label>
            <label>سعر الذهب يدوي اختياري <input value={draft.goldPrice || ""} onChange={(e) => updateDraft("goldPrice", e.target.value)} /></label>
            <label>NewsAPI Key اختياري <input value={draft.newsApiKey || ""} onChange={(e) => updateDraft("newsApiKey", e.target.value)} /></label>
            <label>أخبار بناء يدوية، افصل بينها بـ | <input value={(draft.constructionNews || []).join(" | ")} onChange={(e) => updateDraft("constructionNews", e.target.value.split("|").map(x => x.trim()).filter(Boolean))} /></label>
          </div>

          <button className="control-btn" style={{width:"100%",height:"3vw",fontSize:"1.1vw"}} onClick={saveSettings}>حفظ وتشغيل</button>
        </aside>
      )}
    </div>
  );
}
