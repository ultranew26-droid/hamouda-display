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
  Building2
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
      position:relative;
      width:4.55vw;
      height:4.55vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      place-content:center;
      font-size:2.45vw;
      line-height:1;
      font-weight:1000;
      color:#ffe8a3;
      isolation:isolate;
      overflow:visible;
      background:
        radial-gradient(circle at 50% 50%, rgba(255,217,92,.20) 0 34%, transparent 35%),
        radial-gradient(circle at 50% 50%, #111827 0 54%, #05070b 55% 100%);
      border:1px solid rgba(255,220,99,.92);
      box-shadow:
        0 0 10px rgba(255,220,99,.75),
        0 0 28px rgba(245,178,26,.62),
        0 0 58px rgba(245,178,26,.26),
        inset 0 0 18px rgba(255,220,99,.16),
        inset 0 0 32px rgba(0,0,0,.70);
      text-shadow:
        0 1px 0 rgba(255,255,255,.25),
        0 0 12px rgba(255,220,99,.95),
        0 0 28px rgba(245,178,26,.55);
      animation: aiLogoPulse 4.8s ease-in-out infinite;
    }
    .logo-box > span {
      position:relative;
      z-index:4;
      display:grid;
      place-items:center;
      width:100%;
      height:100%;
      transform:translateY(-.03vw);
    }
    .logo-box:before {
      content:"";
      position:absolute;
      inset:-.38vw;
      border-radius:50%;
      z-index:1;
      background:
        conic-gradient(
          from 0deg,
          transparent 0deg 34deg,
          rgba(255,220,99,.95) 36deg 58deg,
          transparent 60deg 122deg,
          rgba(245,178,26,.70) 124deg 148deg,
          transparent 150deg 226deg,
          rgba(255,220,99,.88) 228deg 252deg,
          transparent 254deg 360deg
        );
      -webkit-mask:radial-gradient(circle, transparent 0 63%, #000 64% 100%);
      mask:radial-gradient(circle, transparent 0 63%, #000 64% 100%);
      filter:drop-shadow(0 0 9px rgba(245,178,26,.75));
      animation: aiLogoRing 7s linear infinite;
    }
    .logo-box:after {
      content:"";
      position:absolute;
      inset:-.72vw;
      border-radius:50%;
      z-index:0;
      background:
        radial-gradient(circle, rgba(245,178,26,.20), transparent 62%),
        conic-gradient(from 180deg, transparent 0 19%, rgba(255,220,99,.30) 20% 22%, transparent 23% 48%, rgba(255,220,99,.22) 49% 51%, transparent 52% 100%);
      filter:blur(.02vw);
      animation: aiLogoOuterRing 12s linear infinite reverse;
      pointer-events:none;
    }
    .logo-box .logo-scan {
      position:absolute;
      inset:.38vw;
      border-radius:50%;
      z-index:3;
      background:linear-gradient(115deg, transparent 0 36%, rgba(255,255,255,.58) 45%, transparent 58% 100%);
      mix-blend-mode:screen;
      opacity:.58;
      animation: aiLogoSweep 5.8s ease-in-out infinite;
      pointer-events:none;
    }
    .logo-box .logo-circuit {
      position:absolute;
      inset:-.95vw;
      z-index:-1;
      pointer-events:none;
    }
    .logo-box .logo-circuit:before,
    .logo-box .logo-circuit:after {
      content:"";
      position:absolute;
      top:50%;
      width:1.45vw;
      height:1px;
      background:linear-gradient(90deg, transparent, rgba(255,220,99,.95), transparent);
      box-shadow:
        .35vw -.32vw 0 rgba(245,178,26,.45),
        .72vw .34vw 0 rgba(245,178,26,.35);
      opacity:.82;
    }
    .logo-box .logo-circuit:before { right:100%; transform:translateY(-50%); }
    .logo-box .logo-circuit:after { left:100%; transform:translateY(-50%) rotate(180deg); }
    @keyframes aiLogoPulse {
      0%,100% { transform:scale(1); filter:brightness(1); }
      50% { transform:scale(1.045); filter:brightness(1.18); }
    }
    @keyframes aiLogoRing { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes aiLogoOuterRing { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes aiLogoSweep {
      0%, 38% { transform:translateX(85%) rotate(12deg); opacity:0; }
      48% { opacity:.64; }
      68%,100% { transform:translateX(-85%) rotate(12deg); opacity:0; }
    }
    .brand-title { font-size:2.05vw; line-height:1; font-weight:1000; letter-spacing:-.03em; text-shadow:0 0 12px rgba(255,255,255,.18); }
    .brand-sub { margin-top:.35vw; color:rgba(255,255,255,.72); font-size:.9vw; font-weight:700; }
    .top-pills {
      display:flex;
      justify-content:center;
      gap:.58vw;
      overflow:hidden;
      padding:.12vw .25vw;
    }
    .data-pill {
      position:relative;
      min-width:7.15vw;
      height:3.95vw;
      border-radius:.9vw;
      padding:.34vw .68vw;
      display:grid;
      grid-template-columns:2.35vw 1fr;
      align-items:center;
      gap:.48vw;
      overflow:hidden;
      border:1px solid rgba(255,210,84,.48);
      background:
        radial-gradient(circle at 18% 50%, rgba(255,210,84,.16), transparent 36%),
        linear-gradient(180deg, rgba(11,17,29,.96), rgba(3,7,12,.98));
      box-shadow:
        0 0 0 1px rgba(255,255,255,.035) inset,
        0 0 18px rgba(245,178,26,.14),
        inset 0 0 22px rgba(245,178,26,.035);
    }
    .data-pill:before {
      content:"";
      position:absolute;
      top:-1px;
      left:12%;
      right:12%;
      height:1px;
      background:linear-gradient(90deg, transparent, rgba(255,230,150,.92), transparent);
      box-shadow:0 0 12px rgba(255,220,99,.85);
    }
    .data-pill:after {
      content:"";
      position:absolute;
      inset:-45% -30%;
      background:linear-gradient(110deg, transparent 34%, rgba(255,255,255,.10) 45%, transparent 58%);
      animation:pillLightSweep 6.5s ease-in-out infinite;
      pointer-events:none;
    }
    @keyframes pillLightSweep {
      0%,45% { transform:translateX(70%) rotate(8deg); opacity:0; }
      55% { opacity:.85; }
      85%,100% { transform:translateX(-75%) rotate(8deg); opacity:0; }
    }
    .pill-icon {
      position:relative;
      width:2.34vw;
      height:2.34vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      color:var(--gold2);
      border:1px solid rgba(255,220,99,.72);
      background:
        radial-gradient(circle at 32% 24%, rgba(255,255,255,.50), transparent 18%),
        radial-gradient(circle, rgba(255,198,55,.30), rgba(0,0,0,.20) 66%);
      box-shadow:
        0 0 14px rgba(245,178,26,.58),
        inset 0 0 12px rgba(255,220,99,.18);
      filter:drop-shadow(0 0 7px rgba(245,178,26,.50));
    }
    .pill-icon:before {
      content:"";
      position:absolute;
      inset:-.23vw;
      border-radius:50%;
      border:1px solid rgba(245,178,26,.38);
      border-top-color:rgba(255,230,150,.88);
      animation:pillIconRing 7s linear infinite;
    }
    @keyframes pillIconRing { to { transform:rotate(360deg); } }
    .premium-symbol {
      font-size:1.26vw;
      line-height:1;
      font-weight:1000;
      color:#ffdc63;
      text-shadow:0 0 10px rgba(245,178,26,.75);
    }
    .premium-symbol.gold-bars {
      font-size:1.02vw;
      letter-spacing:-.14em;
      transform:skewX(-8deg);
    }
    .data-pill.phone .pill-icon { animation:pillCallPulse 3.2s ease-in-out infinite; }
    .data-pill.weather .pill-icon { animation:pillWeatherFloat 4.5s ease-in-out infinite; }
    @keyframes pillCallPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
    @keyframes pillWeatherFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-.12vw); } }
    .pill-label {
      color:rgba(255,255,255,.70);
      font-size:.69vw;
      font-weight:900;
      line-height:1;
      white-space:nowrap;
    }
    .pill-value {
      margin-top:.25vw;
      font-size:.92vw;
      color:var(--gold2);
      font-weight:1000;
      text-shadow:0 0 11px rgba(245,178,26,.55);
      white-space:nowrap;
      letter-spacing:.01em;
    }
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
    .hidden-controls { position:fixed; top:.9vw; left:.9vw; z-index:40; display:flex; gap:.45vw; opacity:.65; transition:opacity .2s; }
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



    /* Live Product Spotlight - Design 2 */
    .spotlight-card {
      padding:.8vw;
      display:flex;
      flex-direction:column;
      min-height:0;
      overflow:hidden;
      position:relative;
    }
    .spotlight-card:before {
      content:"";
      position:absolute;
      inset:-25%;
      background:
        radial-gradient(circle at 30% 20%, rgba(255,220,99,.16), transparent 24%),
        radial-gradient(circle at 80% 70%, rgba(245,178,26,.12), transparent 28%);
      animation: spotlightAura 8s linear infinite;
      pointer-events:none;
    }
    @keyframes spotlightAura { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .spotlight-title {
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.65vw;
      color:var(--gold2);
      font-size:1.12vw;
      font-weight:1000;
      margin:.05vw 0 .65vw;
      text-shadow:0 0 14px rgba(245,178,26,.55);
    }
    .spotlight-title:before,.spotlight-title:after {
      content:"";
      height:1px;
      flex:1;
      background:linear-gradient(90deg, transparent, rgba(245,178,26,.75), transparent);
    }
    .featured-product {
      position:relative;
      min-height:12.2vw;
      border-radius:1vw;
      overflow:hidden;
      border:1px solid rgba(245,178,26,.78);
      background:
        radial-gradient(circle at 20% 35%, rgba(245,178,26,.22), transparent 30%),
        linear-gradient(135deg, rgba(12,20,33,.92), rgba(4,8,14,.96));
      box-shadow:0 0 28px rgba(245,178,26,.23), inset 0 0 35px rgba(255,255,255,.035);
      display:grid;
      grid-template-columns:40% 1fr;
      gap:.8vw;
      padding:.8vw;
      margin-bottom:.72vw;
    }
    .featured-product:after {
      content:"";
      position:absolute;
      inset:-40% -20%;
      background:linear-gradient(115deg, transparent 25%, rgba(255,255,255,.12) 45%, transparent 62%);
      animation: lightSweep 4.8s ease-in-out infinite;
      pointer-events:none;
    }
    @keyframes lightSweep { 0% { transform:translateX(70%) rotate(8deg); opacity:0; } 35% { opacity:.9; } 70%,100% { transform:translateX(-80%) rotate(8deg); opacity:0; } }
    .featured-image-wrap {
      position:relative;
      border-radius:.85vw;
      overflow:hidden;
      background:#080d14;
      border:1px solid rgba(255,255,255,.12);
      box-shadow:inset 0 0 22px rgba(0,0,0,.6);
    }
    .featured-image-wrap img {
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
      filter:saturate(1.05) contrast(1.05);
      animation: productFloat 4.5s ease-in-out infinite;
    }
    @keyframes productFloat { 0%,100% { transform:scale(1.03) translateY(0); } 50% { transform:scale(1.08) translateY(-.25vw); } }
    .featured-info {
      position:relative;
      display:flex;
      flex-direction:column;
      justify-content:center;
      min-width:0;
    }
    .featured-name {
      font-size:1.72vw;
      line-height:1.08;
      font-weight:1000;
      color:#fff;
      text-shadow:0 0 16px rgba(255,255,255,.16);
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .featured-unit { margin-top:.35vw; font-size:.78vw; font-weight:800; color:rgba(255,255,255,.66); }
    .price-badge-xl {
      margin-top:.75vw;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:.55vw;
      min-height:3.25vw;
      border-radius:.8vw;
      padding:.35vw .6vw;
      border:1px solid rgba(245,178,26,.9);
      background:linear-gradient(135deg, rgba(245,178,26,.16), rgba(0,0,0,.35));
      box-shadow:0 0 24px rgba(245,178,26,.28), inset 0 0 18px rgba(245,178,26,.08);
    }
    .shekel-coin {
      flex:0 0 auto;
      width:2.45vw;
      height:2.45vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      color:#07111f;
      font-size:1.25vw;
      font-weight:1000;
      background:radial-gradient(circle at 32% 25%, #fff1a6, #ffc637 48%, #c98904 100%);
      box-shadow:0 0 20px rgba(245,178,26,.72), inset 0 0 8px rgba(255,255,255,.65);
    }
    .price-number-xl {
      flex:1;
      direction:ltr;
      text-align:center;
      font-size:2.35vw;
      line-height:1;
      font-weight:1000;
      color:#fff6d5;
      letter-spacing:.01em;
      text-shadow:0 0 13px rgba(255,245,214,.78), 0 0 28px rgba(245,178,26,.32);
    }
    .change-pill {
      min-width:3.25vw;
      height:2.25vw;
      border-radius:999px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.22vw;
      padding:0 .55vw;
      font-size:.92vw;
      font-weight:1000;
      border:1px solid rgba(255,255,255,.12);
      direction:ltr;
      white-space:nowrap;
    }
    .change-pill.up { background:rgba(34,197,94,.18); color:#39ff78; border-color:rgba(34,197,94,.38); box-shadow:0 0 16px rgba(34,197,94,.20); }
    .change-pill.down { background:rgba(239,68,68,.16); color:#ff4f62; border-color:rgba(239,68,68,.35); box-shadow:0 0 16px rgba(239,68,68,.18); }
    .change-pill.flat { background:rgba(255,255,255,.11); color:rgba(255,255,255,.72); }
    .spotlight-dots {
      position:relative;
      display:flex;
      justify-content:center;
      gap:.32vw;
      margin:.1vw 0 .52vw;
    }
    .spotlight-dot { width:.58vw; height:.22vw; border-radius:999px; background:rgba(255,255,255,.34); }
    .spotlight-dot.active { width:1.05vw; background:var(--gold); box-shadow:0 0 10px rgba(245,178,26,.8); }
    .product-list-window {
      position:relative;
      flex:1;
      min-height:0;
      overflow:hidden;
      border-radius:.95vw;
    }
    .product-list-window:before,.product-list-window:after {
      content:"";
      position:absolute;
      left:0; right:0;
      height:1vw;
      z-index:2;
      pointer-events:none;
    }
    .product-list-window:before { top:0; background:linear-gradient(180deg, rgba(6,10,17,.96), transparent); }
    .product-list-window:after { bottom:0; background:linear-gradient(0deg, rgba(6,10,17,.96), transparent); }
    .product-list-track {
      display:flex;
      flex-direction:column;
      gap:.42vw;
      animation: productListMove 42s linear infinite;
      will-change:transform;
    }
    @keyframes productListMove { 0% { transform:translateY(0); } 100% { transform:translateY(-50%); } }
    .product-line {
      height:3.15vw;
      flex:0 0 3.15vw;
      display:grid;
      grid-template-columns:3.85vw 1fr 6.1vw 3.25vw;
      align-items:center;
      gap:.55vw;
      padding:.32vw .42vw;
      border-radius:.75vw;
      border:1px solid rgba(255,255,255,.10);
      background:linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.018));
      box-shadow:inset 0 0 18px rgba(255,255,255,.025);
    }
    .product-line.active {
      border-color:rgba(245,178,26,.82);
      box-shadow:0 0 19px rgba(245,178,26,.24), inset 0 0 18px rgba(245,178,26,.05);
    }
    .product-thumb {
      width:3.45vw;
      height:2.42vw;
      border-radius:.45vw;
      overflow:hidden;
      background:#0c111a;
      border:1px solid rgba(255,255,255,.12);
    }
    .product-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .product-line-name { font-size:.98vw; font-weight:1000; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .product-line-unit { margin-top:.08vw; font-size:.61vw; color:rgba(255,255,255,.55); font-weight:800; }
    .price-mini-badge {
      height:2.28vw;
      border-radius:.55vw;
      border:1px solid rgba(245,178,26,.75);
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.28vw;
      background:linear-gradient(135deg, rgba(245,178,26,.13), rgba(0,0,0,.38));
      box-shadow:0 0 14px rgba(245,178,26,.18);
      direction:ltr;
    }
    .mini-coin {
      width:1.25vw;
      height:1.25vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:linear-gradient(135deg,#fff1a6,#f5b21a);
      color:#07111f;
      font-size:.66vw;
      font-weight:1000;
    }
    .mini-price { color:#fff6d5; font-size:1.18vw; font-weight:1000; text-shadow:0 0 10px rgba(255,245,214,.55); }
    .all-products-btn {
      position:relative;
      height:2.15vw;
      margin-top:.52vw;
      border-radius:.65vw;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.45vw;
      color:var(--gold2);
      font-size:.8vw;
      font-weight:1000;
      border:1px solid rgba(245,178,26,.28);
      background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(0,0,0,.25));
    }



    /* PRODUCTS ONLY PANEL - remove big featured card and keep the moving product list only */
    .spotlight-card { padding:.7vw; }
    .featured-product, .spotlight-dots { display:none !important; }
    .product-list-window {
      flex:1;
      min-height:0;
      margin-top:.15vw;
      border-radius:1vw;
      border:1px solid rgba(245,178,26,.24);
      background:linear-gradient(180deg, rgba(255,255,255,.025), rgba(0,0,0,.22));
      box-shadow:inset 0 0 20px rgba(0,0,0,.35);
    }
    .product-list-track { gap:.48vw; animation: productListMove 38s linear infinite; }
    .product-line {
      height:4.18vw;
      flex:0 0 4.18vw;
      grid-template-columns:4.55vw 1fr 6.7vw 3.55vw;
      gap:.65vw;
      padding:.42vw .55vw;
      border-radius:.82vw;
      background:linear-gradient(90deg, rgba(255,255,255,.075), rgba(255,255,255,.02));
      border:1px solid rgba(255,255,255,.12);
    }
    .product-line.active {
      border-color:rgba(245,178,26,.95);
      background:linear-gradient(90deg, rgba(245,178,26,.16), rgba(255,255,255,.025));
      box-shadow:0 0 22px rgba(245,178,26,.28), inset 0 0 22px rgba(245,178,26,.08);
    }
    .product-thumb { width:4.15vw; height:3.05vw; border-radius:.58vw; }
    .product-line-name { font-size:1.16vw; line-height:1.05; }
    .product-line-unit { font-size:.68vw; margin-top:.16vw; }
    .price-mini-badge {
      height:2.55vw;
      border-radius:.62vw;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.34vw;
      border:1px solid rgba(245,178,26,.92);
      background:linear-gradient(135deg, rgba(245,178,26,.17), rgba(0,0,0,.36));
      box-shadow:0 0 16px rgba(245,178,26,.24), inset 0 0 14px rgba(245,178,26,.08);
      direction:ltr;
    }
    .mini-coin {
      width:1.58vw;
      height:1.58vw;
      border-radius:50%;
      display:grid;
      place-items:center;
      color:#07111f;
      font-size:.82vw;
      font-weight:1000;
      background:radial-gradient(circle at 32% 25%, #fff1a6, #ffc637 48%, #c98904 100%);
      box-shadow:0 0 13px rgba(245,178,26,.68), inset 0 0 6px rgba(255,255,255,.65);
    }
    .mini-price { font-size:1.35vw; font-weight:1000; color:#fff6d5; text-shadow:0 0 10px rgba(255,245,214,.7); }
    .change-pill { height:2.35vw; min-width:3.25vw; font-size:.86vw; }
    .all-products-btn {
      margin-top:.48vw;
      height:2.45vw;
      border-radius:.75vw;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.45vw;
      color:var(--gold2);
      font-weight:1000;
      font-size:.92vw;
      border:1px solid rgba(245,178,26,.42);
      background:rgba(0,0,0,.32);
    }



    /* PRO ALIGN FIX - clean professional moving product list */
    .spotlight-card { padding:.62vw !important; }
    .product-list-window {
      margin-top:.1vw !important;
      border-radius:.9vw !important;
      border:1px solid rgba(245,178,26,.34) !important;
      background:linear-gradient(180deg, rgba(8,13,22,.96), rgba(3,7,12,.96)) !important;
      box-shadow:inset 0 0 22px rgba(0,0,0,.45), 0 0 18px rgba(245,178,26,.10) !important;
    }
    .product-list-track {
      gap:.34vw !important;
      animation: productListMove 34s linear infinite !important;
    }
    .product-line {
      height:3.54vw !important;
      flex:0 0 3.54vw !important;
      display:grid !important;
      grid-template-columns:3.55vw minmax(0,1fr) 5.35vw 2.65vw !important;
      align-items:center !important;
      column-gap:.46vw !important;
      padding:.34vw .45vw !important;
      border-radius:.72vw !important;
      background:linear-gradient(90deg, rgba(255,255,255,.058), rgba(255,255,255,.014)) !important;
      border:1px solid rgba(255,255,255,.105) !important;
      box-shadow:inset 0 0 14px rgba(255,255,255,.018) !important;
    }
    .product-line.active {
      border-color:rgba(245,178,26,.80) !important;
      background:linear-gradient(90deg, rgba(245,178,26,.105), rgba(255,255,255,.018)) !important;
      box-shadow:0 0 16px rgba(245,178,26,.18), inset 0 0 16px rgba(245,178,26,.045) !important;
    }
    .product-thumb {
      width:3.18vw !important;
      height:2.34vw !important;
      border-radius:.48vw !important;
      justify-self:center !important;
      border:1px solid rgba(255,255,255,.14) !important;
    }
    .product-line-name {
      font-size:.98vw !important;
      line-height:1.08 !important;
      letter-spacing:-.015em !important;
      font-weight:950 !important;
      max-width:100% !important;
    }
    .product-line-unit {
      font-size:.56vw !important;
      margin-top:.10vw !important;
      color:rgba(255,255,255,.52) !important;
    }
    .price-mini-badge {
      width:5.35vw !important;
      min-width:5.35vw !important;
      max-width:5.35vw !important;
      height:2.18vw !important;
      justify-self:center !important;
      display:grid !important;
      grid-template-columns:1.3vw 1fr !important;
      align-items:center !important;
      justify-content:center !important;
      gap:.22vw !important;
      padding:0 .34vw !important;
      border-radius:.54vw !important;
      border:1px solid rgba(245,178,26,.82) !important;
      background:linear-gradient(135deg, rgba(245,178,26,.16), rgba(0,0,0,.40)) !important;
      box-shadow:0 0 12px rgba(245,178,26,.18), inset 0 0 10px rgba(245,178,26,.06) !important;
    }
    .mini-coin {
      width:1.22vw !important;
      height:1.22vw !important;
      font-size:.62vw !important;
      line-height:1 !important;
      box-shadow:0 0 10px rgba(245,178,26,.55), inset 0 0 5px rgba(255,255,255,.55) !important;
    }
    .mini-price {
      font-size:1.02vw !important;
      line-height:1 !important;
      font-weight:1000 !important;
      text-align:center !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing:.01em !important;
      color:#fff6d5 !important;
      text-shadow:0 0 8px rgba(255,245,214,.48) !important;
    }
    .change-pill {
      width:2.45vw !important;
      min-width:2.45vw !important;
      height:2.05vw !important;
      justify-self:center !important;
      border-radius:.62vw !important;
      font-size:.76vw !important;
      font-weight:1000 !important;
      padding:0 !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      font-variant-numeric: tabular-nums !important;
    }
    .spotlight-title {
      font-size:1.04vw !important;
      margin-bottom:.48vw !important;
      gap:.5vw !important;
    }
    .all-products-btn {
      height:2.05vw !important;
      margin-top:.34vw !important;
      font-size:.72vw !important;
      border-radius:.62vw !important;
    }



    /* SIMPLE PRODUCT EDITOR + PRICE ONLY LIST */
    .product-line {
      grid-template-columns:3.55vw minmax(0,1fr) 6.15vw !important;
    }
    .price-mini-badge {
      width:6.15vw !important;
      min-width:6.15vw !important;
      max-width:6.15vw !important;
    }
    .mini-price { font-size:1.06vw !important; }
    .simple-price-only {
      grid-template-columns:2.45vw 1fr !important;
    }
    .product-editor-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:.6vw;
      margin-top:.7vw;
    }
    .product-editor-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:.55vw;
      margin-top:.55vw;
    }
    .product-editor-btn {
      border:0;
      border-radius:.55vw;
      padding:.7vw;
      color:#07111f;
      background:linear-gradient(135deg, #ffdb54, #f0a300);
      font-weight:1000;
      cursor:pointer;
    }
    .product-editor-btn.secondary {
      color:#fff;
      background:#263244;
      border:1px solid rgba(255,255,255,.12);
    }
    .product-admin-list {
      display:flex;
      flex-direction:column;
      gap:.45vw;
      max-height:15vw;
      overflow:auto;
      padding-inline-end:.2vw;
      margin-top:.75vw;
    }
    .product-admin-row {
      display:grid;
      grid-template-columns:3.2vw 1fr 4.4vw 3.8vw 3.8vw;
      align-items:center;
      gap:.45vw;
      border:1px solid rgba(255,255,255,.10);
      border-radius:.65vw;
      padding:.35vw;
      background:rgba(255,255,255,.04);
    }
    .product-admin-thumb {
      width:3vw;
      height:2.2vw;
      border-radius:.45vw;
      object-fit:cover;
      background:#111827;
    }
    .product-admin-name {
      font-size:.78vw;
      color:#fff;
      font-weight:900;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .product-admin-price {
      text-align:center;
      color:var(--gold2);
      font-size:.78vw;
      font-weight:1000;
    }
    .mini-action-btn {
      border:0;
      border-radius:.45vw;
      padding:.45vw .3vw;
      font-size:.68vw;
      font-weight:900;
      color:#07111f;
      background:#f5b21a;
      cursor:pointer;
    }
    .mini-action-btn.delete {
      background:#ef4444;
      color:#fff;
    }

    .image-upload-box {
      position:relative;
      min-height:5.2vw;
      border:1px dashed rgba(245,178,26,.55);
      border-radius:.75vw;
      background:rgba(245,178,26,.06);
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.7vw;
      padding:.75vw;
      cursor:pointer;
      text-align:center;
      color:#ffdc63;
      font-weight:1000;
    }
    .image-upload-box input {
      position:absolute;
      inset:0;
      opacity:0;
      cursor:pointer;
      margin:0;
      padding:0;
    }
    .image-preview-row {
      display:grid;
      grid-template-columns:5vw 1fr auto;
      align-items:center;
      gap:.7vw;
      margin:.65vw 0;
      padding:.55vw;
      border-radius:.7vw;
      border:1px solid rgba(245,178,26,.28);
      background:rgba(0,0,0,.24);
    }
    .image-preview-row img {
      width:5vw;
      height:3.3vw;
      object-fit:cover;
      border-radius:.55vw;
      border:1px solid rgba(245,178,26,.45);
    }
    .save-products-now {
      grid-column:1 / -1;
      background:linear-gradient(135deg,#39ff78,#16a34a) !important;
      color:#06120b !important;
      box-shadow:0 0 18px rgba(34,197,94,.28);
    }
    .product-editor-note {
      margin-top:.5vw;
      font-size:.72vw;
      line-height:1.45;
      color:rgba(255,255,255,.70);
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
      border-radius:.6vw;
      padding:.55vw;
    }




    /* PRICE FLASH LIKE STOCK MARKET */
    .flash-price {
      position:relative;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:.45vw;
      padding:.06vw .18vw;
      transition:transform .25s ease, color .25s ease, background .25s ease;
      will-change:transform, box-shadow, background;
    }
    .flash-price-up {
      animation:flashPriceGreen 1.05s ease both;
    }
    .flash-price-down {
      animation:flashPriceRed 1.05s ease both;
    }
    @keyframes flashPriceGreen {
      0% { background:rgba(34,197,94,0); box-shadow:0 0 0 rgba(34,197,94,0); transform:scale(1); }
      24% { background:rgba(34,197,94,.34); box-shadow:0 0 22px rgba(34,197,94,.82), inset 0 0 16px rgba(34,197,94,.28); transform:scale(1.10); color:#dfffee; }
      100% { background:rgba(34,197,94,0); box-shadow:0 0 0 rgba(34,197,94,0); transform:scale(1); }
    }
    @keyframes flashPriceRed {
      0% { background:rgba(239,68,68,0); box-shadow:0 0 0 rgba(239,68,68,0); transform:scale(1); }
      24% { background:rgba(239,68,68,.34); box-shadow:0 0 22px rgba(239,68,68,.82), inset 0 0 16px rgba(239,68,68,.26); transform:scale(1.10); color:#ffe1e1; }
      100% { background:rgba(239,68,68,0); box-shadow:0 0 0 rgba(239,68,68,0); transform:scale(1); }
    }
    .pill-value .flash-price {
      min-width:3.2vw;
    }
    .price-mini-badge .flash-price,
    .price-number-xl.flash-price,
    .prod-price .flash-price {
      width:100%;
    }


    /* SMART AUTO CATEGORY NAV */
    .bottom-nav.smart-category-nav {
      position:relative;
      overflow:hidden;
      padding-top:1.18vw !important;
      border-color:rgba(245,178,26,.46);
      background:
        radial-gradient(circle at 50% 0%, rgba(245,178,26,.12), transparent 55%),
        linear-gradient(180deg, rgba(12,20,33,.90), rgba(4,9,15,.92));
    }
    .active-category-label {
      position:absolute;
      top:.18vw;
      left:50%;
      transform:translateX(-50%);
      z-index:4;
      height:.92vw;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.28vw;
      padding:0 .7vw;
      border-radius:999px;
      color:#07111f;
      background:linear-gradient(135deg, #ffdc63, #f5b21a);
      font-size:.52vw;
      font-weight:1000;
      letter-spacing:.02em;
      box-shadow:0 0 16px rgba(245,178,26,.55);
      white-space:nowrap;
    }
    .nav-light-runner {
      position:absolute;
      top:.05vw;
      bottom:.05vw;
      width:2.8vw;
      z-index:1;
      border-radius:999px;
      background:linear-gradient(90deg, transparent, rgba(255,220,99,.45), transparent);
      filter:blur(.3vw);
      animation: navLightRunner 5s linear infinite;
      pointer-events:none;
    }
    @keyframes navLightRunner {
      0% { transform:translateX(-5vw); opacity:0; }
      10% { opacity:.75; }
      90% { opacity:.75; }
      100% { transform:translateX(100vw); opacity:0; }
    }
    .smart-nav-item {
      position:relative;
      z-index:2;
      height:100%;
      border:1px solid rgba(255,255,255,.12);
      border-radius:.68vw;
      background:linear-gradient(180deg, rgba(255,255,255,.045), rgba(0,0,0,.32));
      display:flex;
      align-items:center;
      justify-content:center;
      gap:.62vw;
      font-size:.98vw;
      font-weight:950;
      color:#fff;
      overflow:hidden;
      transition:all .55s ease;
    }
    .smart-nav-item svg {
      transition:transform .55s ease, filter .55s ease;
    }
    .smart-nav-item.active {
      color:#07111f;
      border-color:rgba(255,220,99,1);
      background:linear-gradient(135deg, #ffdc63, #f5b21a 48%, #d79505);
      box-shadow:0 0 24px rgba(245,178,26,.52), inset 0 0 18px rgba(255,255,255,.28);
      transform:translateY(-.08vw);
    }
    .smart-nav-item.active svg {
      transform:scale(1.14);
      filter:drop-shadow(0 0 8px rgba(255,255,255,.45));
      animation: smartNavIconPulse 1.45s ease-in-out infinite;
    }
    .smart-nav-item.active:after {
      content:"";
      position:absolute;
      inset:-40% -20%;
      background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,.42) 48%, transparent 63%);
      animation: smartNavSweep 2.6s ease-in-out infinite;
      pointer-events:none;
    }
    @keyframes smartNavIconPulse { 0%,100% { transform:scale(1.08); } 50% { transform:scale(1.24); } }
    @keyframes smartNavSweep { 0% { transform:translateX(80%); opacity:0; } 45% { opacity:.8; } 100% { transform:translateX(-80%); opacity:0; } }
    .filtered-products-hint {
      position:absolute;
      top:2.05vw;
      right:.9vw;
      z-index:4;
      color:rgba(255,220,99,.88);
      font-size:.62vw;
      font-weight:900;
      pointer-events:none;
    }


    /* FINAL CLEAN SMOOTH PRODUCTS - no labels, no jumping */
    .active-category-label,
    .filtered-products-hint {
      display:none !important;
    }
    .bottom-nav.smart-category-nav {
      padding-top:.48vw !important;
    }
    .product-list-window {
      overflow:hidden !important;
      border-radius:1vw !important;
    }
    .smooth-product-track {
      animation: productListMoveSmooth 64s linear infinite !important;
      will-change: transform !important;
      transform: translate3d(0,0,0);
      backface-visibility:hidden;
    }
    .product-list-window:hover .smooth-product-track {
      animation-play-state: running;
    }
    @keyframes productListMoveSmooth {
      0% { transform:translate3d(0,0,0); }
      100% { transform:translate3d(0,var(--product-scroll-step),0); }
    }
    .product-line {
      transition: transform .55s ease, box-shadow .55s ease, border-color .55s ease, background .55s ease !important;
    }
    .product-line.active {
      animation: activeProductGlow 2.4s ease-in-out infinite !important;
    }
    @keyframes activeProductGlow {
      0%,100% { filter:brightness(1); transform:translateX(0); }
      50% { filter:brightness(1.12); transform:translateX(-.12vw); }
    }
    .price-mini-badge {
      transition: transform .35s ease, box-shadow .35s ease !important;
    }
    .product-line.active .price-mini-badge {
      transform:scale(1.035);
      box-shadow:0 0 18px rgba(245,178,26,.32), inset 0 0 12px rgba(245,178,26,.09) !important;
    }


    /* UNIQUE PRODUCT LIST - no duplicated rows when category has few items */
    .smooth-product-track.no-scroll {
      animation:none !important;
      transform:translate3d(0,0,0) !important;
    }
    .spotlight-title.clean-category-title {
      margin-bottom:.62vw !important;
    }
    .spotlight-title.clean-category-title .category-name-only {
      color:#ffdc63;
      font-size:1.16vw;
      font-weight:1000;
      text-shadow:0 0 14px rgba(245,178,26,.60);
    }
    .empty-category-note {
      height:3.54vw;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:.72vw;
      border:1px dashed rgba(245,178,26,.34);
      color:rgba(255,220,99,.78);
      font-size:.82vw;
      font-weight:900;
      background:rgba(245,178,26,.045);
    }



    /* PREMIUM PHONE CARD - makes the phone tile stand out from the top market pills */
    .data-pill.phone-premium {
      min-width:8.45vw !important;
      grid-template-columns:2.75vw 1fr !important;
      border-color:rgba(63,255,143,.62) !important;
      background:
        radial-gradient(circle at 15% 50%, rgba(63,255,143,.20), transparent 34%),
        radial-gradient(circle at 78% 22%, rgba(255,220,99,.18), transparent 28%),
        linear-gradient(180deg, rgba(8,24,20,.98), rgba(4,8,13,.98)) !important;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.045) inset,
        0 0 24px rgba(63,255,143,.18),
        0 0 28px rgba(245,178,26,.16),
        inset 0 0 26px rgba(63,255,143,.055) !important;
      transform:translateY(-.10vw);
    }
    .data-pill.phone-premium:before {
      left:8% !important;
      right:8% !important;
      background:linear-gradient(90deg, transparent, rgba(63,255,143,.95), rgba(255,230,150,.95), transparent) !important;
      box-shadow:0 0 16px rgba(63,255,143,.75), 0 0 18px rgba(245,178,26,.38) !important;
    }
    .data-pill.phone-premium:after {
      background:linear-gradient(110deg, transparent 31%, rgba(63,255,143,.12) 43%, rgba(255,255,255,.14) 50%, transparent 61%) !important;
      animation:phoneCardSweep 4.6s ease-in-out infinite !important;
    }
    @keyframes phoneCardSweep {
      0%,36% { transform:translateX(85%) rotate(8deg); opacity:0; }
      50% { opacity:1; }
      82%,100% { transform:translateX(-78%) rotate(8deg); opacity:0; }
    }
    .data-pill.phone-premium .pill-icon {
      width:2.72vw !important;
      height:2.72vw !important;
      border-color:rgba(63,255,143,.86) !important;
      color:#ffef9f !important;
      background:
        radial-gradient(circle at 31% 24%, rgba(255,255,255,.62), transparent 16%),
        radial-gradient(circle, rgba(63,255,143,.26), rgba(245,178,26,.18) 54%, rgba(0,0,0,.24) 72%) !important;
      box-shadow:
        0 0 18px rgba(63,255,143,.48),
        0 0 24px rgba(245,178,26,.38),
        inset 0 0 14px rgba(255,220,99,.18) !important;
      animation:phoneIconPremiumPulse 2.35s ease-in-out infinite !important;
    }
    .data-pill.phone-premium .pill-icon svg {
      filter:drop-shadow(0 0 7px rgba(255,220,99,.85));
      animation:phoneHandsetTilt 4.2s ease-in-out infinite;
    }
    @keyframes phoneIconPremiumPulse {
      0%,100% { transform:scale(1); }
      50% { transform:scale(1.10); }
    }
    @keyframes phoneHandsetTilt {
      0%,100% { transform:rotate(0deg); }
      18% { transform:rotate(-10deg); }
      30% { transform:rotate(8deg); }
      42% { transform:rotate(0deg); }
    }
    .phone-energy-ring {
      position:absolute;
      inset:.28vw;
      border-radius:.78vw;
      border:1px solid rgba(63,255,143,.24);
      box-shadow:inset 0 0 16px rgba(63,255,143,.06);
      pointer-events:none;
      animation:phoneBorderBreath 2.8s ease-in-out infinite;
    }
    @keyframes phoneBorderBreath {
      0%,100% { opacity:.35; transform:scale(.985); }
      50% { opacity:.95; transform:scale(1.01); }
    }
    .phone-signal-wave {
      position:absolute;
      inset:-.45vw;
      border-radius:50%;
      border:1px solid rgba(63,255,143,.30);
      opacity:0;
      animation:phoneSignalWave 2.4s ease-out infinite;
      pointer-events:none;
    }
    @keyframes phoneSignalWave {
      0% { transform:scale(.72); opacity:.75; }
      100% { transform:scale(1.45); opacity:0; }
    }
    .data-pill.phone-premium .pill-label {
      color:rgba(255,255,255,.82) !important;
      font-size:.72vw !important;
    }
    .data-pill.phone-premium .pill-value {
      margin-top:.18vw !important;
      font-size:1.03vw !important;
      color:#fff1a6 !important;
      text-shadow:0 0 12px rgba(245,178,26,.72), 0 0 18px rgba(63,255,143,.22) !important;
    }
    .data-pill.phone-premium .flash-price {
      min-width:auto !important;
      padding:.03vw .12vw !important;
    }
    .phone-subline {
      margin-top:.08vw;
      color:#39ff8a;
      font-size:.47vw;
      font-weight:1000;
      line-height:1;
      letter-spacing:.02em;
      text-shadow:0 0 8px rgba(63,255,143,.45);
      white-space:nowrap;
      opacity:.92;
    }

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
    next.prices = remote.prices.map((p) => ({
      nameHe: p.nameHe || p.name || "",
      nameAr: p.nameAr || p.name || "",
      price: String(p.price ?? "0"),
      image: p.image || p.imageUrl || ""
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
      nameHe: p.nameHe || p.name || "",
      nameAr: p.nameAr || p.name || "",
      price: String(p.price ?? "0"),
      image: p.image || ""
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
      <div className="prod-price"><FlashPrice value={String(p.price || "0")} prefix="₪" /></div>
      <div className={`prod-change ${dirClass}`}>{arrow} {p.change}</div>
    </div>
  );
}



const PRODUCT_IMAGE_MAP = {
  cement: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
  steel: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=600&q=80",
  paint: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
  gypsum: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80",
  sand: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  seal: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
  package: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
};

function getProductImage(product) {
  if (product?.image) return product.image;
  const key = String(product?.icon || product?.nameHe || product?.nameAr || "").toLowerCase();
  if (key.includes("cement") || key.includes("מלט") || key.includes("إسمنت")) return PRODUCT_IMAGE_MAP.cement;
  if (key.includes("steel") || key.includes("ברזל") || key.includes("حديد")) return PRODUCT_IMAGE_MAP.steel;
  if (key.includes("paint") || key.includes("צבע") || key.includes("دهان")) return PRODUCT_IMAGE_MAP.paint;
  if (key.includes("gypsum") || key.includes("גבס") || key.includes("جبص")) return PRODUCT_IMAGE_MAP.gypsum;
  if (key.includes("sand") || key.includes("חול") || key.includes("رمل")) return PRODUCT_IMAGE_MAP.sand;
  if (key.includes("seal") || key.includes("איטום") || key.includes("عزل")) return PRODUCT_IMAGE_MAP.seal;
  return PRODUCT_IMAGE_MAP.package;
}

function ChangeBadge({ product }) {
  const direction = product?.direction === "up" ? "up" : product?.direction === "down" ? "down" : "flat";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "−";
  const changeText = String(product?.change ?? "0").replace(/^\+/, "");
  return <div className={`change-pill ${direction}`}>{direction === "up" ? "+" : direction === "down" ? "-" : "0"}{direction === "flat" ? "" : changeText} {arrow}</div>;
}


const SMART_CATEGORIES = [
  { id: "tools", he: "כלי עבודה", ar: "أدوات عمل", Icon: Wrench, keys: ["tool", "tools", "כלי", "עבודה", "أداة", "اداة", "أدوات", "ادوات", "شنيور", "دريل", "مفك", "مطرقة"] },
  { id: "seal", he: "חומרי איטום", ar: "مواد عزل", Icon: ShieldCheck, keys: ["seal", "איטום", "عزل", "زفت", "بيتومين", "سيكا"] },
  { id: "paint", he: "צבעים", ar: "دهانات", Icon: PaintBucket, keys: ["paint", "צבע", "دهان", "دهانات", "معجون", "برايمر", "رول"] },
  { id: "gypsum", he: "גבס", ar: "جبص", Icon: ScrollText, keys: ["gypsum", "גבס", "جبص", "جبس", "لوح"] },
  { id: "steel", he: "ברזל", ar: "حديد", Icon: Layers, keys: ["steel", "ברזל", "حديد", "8", "10", "12", "16"] },
  { id: "cement", he: "מלט", ar: "إسمنت", Icon: Package, keys: ["cement", "מלט", "إسمنت", "اسمنت", "أسمنت", "مونة"] },
  { id: "home", he: "דף הבית", ar: "الرئيسية", Icon: Home, keys: [] }
];

function productMatchesCategory(product, category) {
  if (!category || category.id === "home") return true;
  const text = `${product?.nameHe || ""} ${product?.nameAr || ""} ${product?.name || ""} ${product?.icon || ""}`.toLowerCase();
  return category.keys.some((k) => text.includes(String(k).toLowerCase()));
}

function getProductsForCategory(products, category) {
  const list = Array.isArray(products) && products.length ? products : DEFAULT_DATA.prices;
  const filtered = list.filter((p) => productMatchesCategory(p, category));
  return filtered.length ? filtered : list;
}

function LiveProductSpotlight({ data, isAr, activeCategory }) {
  const baseProducts = (data.prices && data.prices.length ? data.prices : DEFAULT_DATA.prices);
  const products = getProductsForCategory(baseProducts, activeCategory);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory?.id, products.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((v) => (v + 1) % Math.max(1, products.length));
    }, 4200);
    return () => clearInterval(timer);
  }, [products.length, activeCategory?.id]);

  const active = products[activeIndex % Math.max(1, products.length)] || DEFAULT_DATA.prices[0];
  const shouldScroll = products.length > 5;
  const repeatCount = shouldScroll ? Math.max(2, Math.ceil(12 / Math.max(1, products.length))) : 1;
  const repeatedProducts = shouldScroll ? Array.from({ length: repeatCount }).flatMap(() => products) : products;
  const scrollStep = shouldScroll ? `${-(100 / repeatCount)}%` : "0%";
  const categoryTitle = activeCategory?.id === "home"
    ? (isAr ? "كل المنتجات" : "כל המוצרים")
    : (isAr ? activeCategory?.ar : activeCategory?.he) || (isAr ? "المنتجات" : "מוצרים");

  return (
    <aside className="spotlight-card glass-panel">
      <div className="spotlight-title clean-category-title"><BadgePercent size={20} /> <span className="category-name-only">{categoryTitle}</span></div>
      <div className="featured-product" key={`${active.nameHe}-${activeIndex}`}>
        <div className="featured-image-wrap">
          <img src={getProductImage(active)} alt="product" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
        </div>
        <div className="featured-info">
          <div className="featured-name">{itemT(data, active, "nameHe", "nameAr")}</div>
          <div className="price-badge-xl simple-price-only">
            <div className="shekel-coin">₪</div>
            <FlashPrice className="price-number-xl" value={String(active.price || "0")} />
          </div>
        </div>
      </div>

      <div className="spotlight-dots">
        {products.slice(0, 8).map((_, i) => <span key={i} className={`spotlight-dot ${i === activeIndex % products.length ? "active" : ""}`} />)}
      </div>

      <div className="product-list-window">
        <div className={`product-list-track smooth-product-track ${shouldScroll ? "" : "no-scroll"}`} style={{ "--product-scroll-step": scrollStep }}>
          {repeatedProducts.map((p, i) => {
            const originalIndex = i % products.length;
            const activeRow = originalIndex === activeIndex % products.length;
            return (
              <div className={`product-line ${activeRow ? "active" : ""}`} key={`${p.nameHe}-${i}`}>
                <div className="product-thumb"><img src={getProductImage(p)} alt="" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} /></div>
                <div>
                  <div className="product-line-name">{itemT(data, p, "nameHe", "nameAr")}</div>
                  <div className="product-line-unit">{isAr ? "السعر الحالي" : "מחיר"}</div>
                </div>
                <div className="price-mini-badge"><span className="mini-coin">₪</span><FlashPrice className="mini-price" value={String(p.price || "0")} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="all-products-btn"><Package size={18} /> {isAr ? "لكل المنتجات" : "לכל המוצרים"}</div>
    </aside>
  );
}


function SmartCategoryNav({ isAr, activeCategoryIndex }) {
  return (
    <nav className="bottom-nav smart-category-nav glass-panel">
      <div className="nav-light-runner" />
      {SMART_CATEGORIES.map((category, index) => {
        const Icon = category.Icon;
        const active = index === activeCategoryIndex;
        return (
          <div className={`smart-nav-item ${active ? "active" : ""}`} key={category.id}>
            <Icon size={active ? 34 : 30} />
            {isAr ? category.ar : category.he}
          </div>
        );
      })}
    </nav>
  );
}


function numberFromDisplay(value) {
  const cleaned = String(value ?? "").replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function FlashPrice({ value, className = "", prefix = "", suffix = "" }) {
  const [flashClass, setFlashClass] = useState("");
  const [previous, setPrevious] = useState(null);
  const numericValue = numberFromDisplay(value);

  useEffect(() => {
    if (numericValue === null) return;

    if (previous !== null && numericValue !== previous) {
      setFlashClass(numericValue > previous ? "flash-price-up" : "flash-price-down");
      setPrevious(numericValue);
      const timer = setTimeout(() => setFlashClass(""), 1050);
      return () => clearTimeout(timer);
    }

    setPrevious(numericValue);
  }, [numericValue]);

  return (
    <span className={`flash-price ${flashClass} ${className}`.trim()}>
      {prefix}{value}{suffix}
    </span>
  );
}

function CurrencyPill({ icon, label, value, change, kind = "" }) {
  const isPhone = kind === "phone";

  return (
    <div className={`data-pill ${kind} ${isPhone ? "phone-premium" : ""}`.trim()}>
      {isPhone && <span className="phone-energy-ring" />}
      <div className="pill-icon">
        {isPhone && <span className="phone-signal-wave" />}
        {icon}
      </div>
      <div className="pill-content">
        <div className="pill-label">{label}</div>
        <div className="pill-value"><FlashPrice value={value} /> {change && <span className="pill-change">{change}</span>}</div>
        {isPhone && <div className="phone-subline">WhatsApp • זמין ב-WhatsApp</div>}
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
  const [productForm, setProductForm] = useState({ name: "", price: "", image: "", editIndex: -1 });
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const isAr = data.language === "ar";
  const locale = isAr ? "ar" : "he";
  const activeCategory = SMART_CATEGORIES[activeCategoryIndex % SMART_CATEGORIES.length] || SMART_CATEGORIES[0];
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
    const timer = setInterval(() => {
      setActiveCategoryIndex((current) => (current + 1) % SMART_CATEGORIES.length);
    }, 5000);
    return () => clearInterval(timer);
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
    await persistSettings(draft, true);
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

  const persistSettings = async (nextData, closeDrawer = false) => {
    saveLocal(nextData);
    setData(nextData);
    setDraft(nextData);
    if (closeDrawer) setSettingsOpen(false);
    try {
      const targetId = firebaseSettingsId || "main";
      await setDoc(doc(db, "settings", targetId), toFirebaseSettings(nextData), { merge: true });
      setFirebaseSettingsId(targetId);
    } catch (error) {
      console.error("Firebase save error:", error);
    }
  };

  const resetProductForm = () => setProductForm({ name: "", price: "", image: "", editIndex: -1 });

  const handleProductImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 520;
        const maxH = 360;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setProductForm((form) => ({ ...form, image: String(reader.result || "") }));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.72);
        setProductForm((form) => ({ ...form, image: compressed }));
      };
      img.onerror = () => setProductForm((form) => ({ ...form, image: String(reader.result || "") }));
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const buildProductDraft = () => {
    const name = productForm.name.trim();
    const price = String(productForm.price || "").trim();
    if (!name || !price) return null;

    const product = {
      nameHe: name,
      nameAr: name,
      price,
      image: productForm.image || ""
    };

    const products = Array.isArray(draft.prices) ? [...draft.prices] : [];
    if (productForm.editIndex >= 0 && productForm.editIndex < products.length) {
      products[productForm.editIndex] = product;
    } else {
      products.push(product);
    }
    return { ...draft, prices: products };
  };

  const saveProductToDraft = () => {
    const nextDraft = buildProductDraft();
    if (!nextDraft) return;
    setDraft(nextDraft);
    resetProductForm();
  };

  const saveProductAndPublish = async () => {
    const nextDraft = buildProductDraft();
    if (!nextDraft) return;
    await persistSettings(nextDraft, false);
    resetProductForm();
  };

  const editProductFromDraft = (index) => {
    const p = draft.prices?.[index];
    if (!p) return;
    setProductForm({
      name: p.nameHe || p.nameAr || "",
      price: String(p.price || ""),
      image: p.image || "",
      editIndex: index
    });
  };

  const deleteProductFromDraft = (index) => {
    setDraft((current) => ({
      ...current,
      prices: (current.prices || []).filter((_, i) => i !== index)
    }));
    if (productForm.editIndex === index) resetProductForm();
  };

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
            <div className="logo-box"><span>{data.logoText}</span><i className="logo-scan" /><i className="logo-circuit" /></div>
            <div>
              <div className="brand-title">{t(data, "businessNameHe", "businessNameAr")}</div>
              <div className="brand-sub">{t(data, "sloganHe", "sloganAr")}</div>
            </div>
          </div>

          <div className="top-pills">
            <CurrencyPill kind="weather" icon={<CloudSun size={27} strokeWidth={1.9} />} label={isAr ? (weather.labelAr || "الطقس") : (weather.labelHe || "מזג אוויר")} value={weather.temp} />
            <CurrencyPill kind="euro" icon={<span className="premium-symbol">€</span>} label={isAr ? "يورو" : "אירו"} value={`€ ${data.exchangeEUR ?? fx.eurIls}`} />
            <CurrencyPill kind="usd" icon={<span className="premium-symbol">$</span>} label={isAr ? "دولار" : "דולר"} value={`$ ${data.exchangeUSD ?? fx.usdIls}`} />
            <CurrencyPill kind="jod" icon={<span className="premium-symbol">🏛</span>} label={isAr ? "دينار" : "דינר"} value={`JD ${data.exchangeJOD ?? fx.jodIls}`} />
            <CurrencyPill kind="gold" icon={<span className="premium-symbol gold-bars">▰▰▰</span>} label={isAr ? "ذهب" : "זהב"} value={`$${data.goldPrice !== "--" ? data.goldPrice : gold.price}`} />
            <CurrencyPill kind="phone" icon={<Phone size={27} strokeWidth={2.3} />} label={isAr ? "هاتف" : "טלפון"} value={data.phone} />
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
          <LiveProductSpotlight data={data} isAr={isAr} activeCategory={activeCategory} />

          <main className="hero-card glass-panel">
            <div className="hero-media">
              {currentMedia.type === "video" ? (
                <video src={currentMedia.src} autoPlay muted loop playsInline />
              ) : (
                <img src={currentMedia.src || FALLBACK_IMAGE} alt="slide" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
              )}
            </div>
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

        <SmartCategoryNav isAr={isAr} activeCategoryIndex={activeCategoryIndex} />
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
            <h3 style={{fontSize:"1.05vw",fontWeight:1000,color:"#ffdc63",marginBottom:".6vw"}}>إضافة / تعديل منتجات الأسعار</h3>
            <div className="image-upload-box">
              <span>🖼 اضغط هنا لإرفاق صورة المنتج من الجهاز</span>
              <input type="file" accept="image/*" onChange={(e) => handleProductImageFile(e.target.files?.[0])} />
            </div>
            {productForm.image && (
              <div className="image-preview-row">
                <img src={productForm.image} alt="preview" />
                <div>
                  <div style={{fontWeight:1000,color:"#ffdc63"}}>تم اختيار الصورة</div>
                  <div style={{fontSize:".68vw",color:"rgba(255,255,255,.65)"}}>الصورة تُضغط تلقائياً حتى تحفظ بشكل أخف.</div>
                </div>
                <button className="control-btn" onClick={() => setProductForm((f) => ({...f, image:""}))}>حذف</button>
              </div>
            )}
            <div className="product-editor-grid">
              <label>اسم المنتج
                <input value={productForm.name} onChange={(e) => setProductForm((f) => ({...f, name:e.target.value}))} placeholder="مثال: إسمنت / מלט" />
              </label>
              <label>السعر
                <input value={productForm.price} onChange={(e) => setProductForm((f) => ({...f, price:e.target.value}))} placeholder="مثال: 29" />
              </label>
            </div>
            <div className="product-editor-actions">
              <button type="button" className="product-editor-btn" onClick={saveProductToDraft}>{productForm.editIndex >= 0 ? "حفظ التعديل مؤقتاً" : "إضافة مؤقتاً"}</button>
              <button type="button" className="product-editor-btn secondary" onClick={resetProductForm}>تفريغ الحقول</button>
              <button type="button" className="product-editor-btn save-products-now" onClick={saveProductAndPublish}>{productForm.editIndex >= 0 ? "حفظ التعديل ونشره فوراً" : "إضافة ونشر فوراً"}</button>
            </div>
            <div className="product-editor-note">
              الأسهل: ارفع الصورة، اكتب اسم المنتج والسعر، ثم اضغط <b>إضافة ونشر فوراً</b>. إذا استخدمت إضافة مؤقتاً، اضغط زر <b>حفظ وتشغيل</b> أسفل الإعدادات.
            </div>

            <div className="product-admin-list">
              {(draft.prices || []).map((p, i) => (
                <div className="product-admin-row" key={`${p.nameHe || p.nameAr || "product"}-${i}`}>
                  <img className="product-admin-thumb" src={getProductImage(p)} alt="" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                  <div className="product-admin-name">{p.nameHe || p.nameAr}</div>
                  <div className="product-admin-price">₪{p.price}</div>
                  <button type="button" className="mini-action-btn" onClick={() => editProductFromDraft(i)}>تعديل</button>
                  <button type="button" className="mini-action-btn delete" onClick={() => deleteProductFromDraft(i)}>حذف</button>
                </div>
              ))}
            </div>
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
