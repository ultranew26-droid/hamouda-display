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
  Fuel,
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
  heroImageUrl: "",
  tickerText: "",
  alertText: "",
  fuel95: "--",
  diesel: "--",
  goldPrice: "--",
  newsApiKey: "",
  constructionNews: [],
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
      width: 100vw; height: 100vh; color: #fff; overflow: hidden;
      background:
        radial-gradient(circle at 50% 0%, rgba(245,178,26,.13), transparent 30%),
        radial-gradient(circle at 90% 70%, rgba(245,178,26,.10), transparent 35%),
        linear-gradient(180deg, #03060b 0%, #06101e 54%, #03060b 100%);
      font-family: Heebo, Arial, sans-serif;
    }
    .pixel-shell { height: 100%; padding: .85vw; display:flex; flex-direction:column; gap:.8vw; }
    .glass-panel {
      border: 1px solid rgba(245,178,26,.38);
      background: linear-gradient(180deg, rgba(12,20,33,.92), rgba(4,9,15,.94));
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
    .fuel-row {
      position:relative;
      width:100%;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:.55vw;
      margin-top:1vw;
    }
    .fuel-box {
      border:1px solid rgba(245,178,26,.35);
      border-radius:.65vw;
      padding:.55vw .45vw;
      background:rgba(0,0,0,.32);
      box-shadow:inset 0 0 18px rgba(245,178,26,.05);
    }
    .fuel-label { font-size:.72vw; color:rgba(255,255,255,.70); font-weight:900; }
    .fuel-value { margin-top:.15vw; font-size:1.05vw; color:var(--gold2); font-weight:1000; text-shadow:0 0 10px rgba(245,178,26,.45); }
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

    @media (max-aspect-ratio: 14/9) {
      .topbar { grid-template-columns: 1.6fr 2.2fr 1.5fr; }
      .main-grid { grid-template-columns: 24.5vw 1fr 24vw; }
    }
  `;
  document.head.appendChild(style);
}

function normalizeData(input) {
  const merged = { ...DEFAULT_DATA, ...(input || {}) };
  const slides = (merged.heroSlides || DEFAULT_DATA.heroSlides).map((slide) => {
    const oldImages = slide.images && slide.images.length ? slide.images : [slide.image || FALLBACK_IMAGE];
    let media = slide.media && slide.media.length
      ? slide.media
      : oldImages.map((src, i) => ({ type: "image", src, name: slide.imageNames?.[i] || `image-${i + 1}` }));
    media = media.filter((m) => m?.src && !String(m.src).startsWith("blob:"));
    if (!media.length) media = [{ type: "image", src: FALLBACK_IMAGE, name: "default" }];
    return { ...slide, image: media[0]?.src || FALLBACK_IMAGE, images: media.filter((m) => m.type === "image").map((m) => m.src), media };
  });
  return { ...merged, heroSlides: slides };
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
    }))
  };
}

function saveLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactForStorage(data)));
  } catch {}
}

const t = (data, heKey, arKey) => (data.language === "ar" ? data[arKey] : data[heKey]);
const itemT = (data, item, heKey, arKey) => (data.language === "ar" ? item?.[arKey] : item?.[heKey]);

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
  if (remote.fuel95 !== undefined) next.fuel95 = String(remote.fuel95 || "--");
  if (remote.diesel !== undefined) next.diesel = String(remote.diesel || "--");
  if (remote.goldPrice !== undefined) next.goldPrice = String(remote.goldPrice || "--");
  if (remote.newsApiKey !== undefined) next.newsApiKey = String(remote.newsApiKey || "");
  if (remote.constructionNews !== undefined) {
    next.constructionNews = Array.isArray(remote.constructionNews)
      ? remote.constructionNews.filter(Boolean).map(String)
      : String(remote.constructionNews || "").split("|").map((x) => x.trim()).filter(Boolean);
  }

  if (remote.heroImages && Array.isArray(remote.heroImages) && remote.heroImages.length > 0) {
    const images = remote.heroImages.filter(Boolean);
    const firstSlide = next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
    next.heroSlides = [{
      ...firstSlide,
      image: images[0],
      images,
      media: images.map((img, index) => ({ type: "image", src: img, name: `firebase-image-${index}` }))
    }];
  } else if (remote.heroImageUrl) {
    const firstSlide = next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
    next.heroSlides = [{
      ...firstSlide,
      image: remote.heroImageUrl,
      images: [remote.heroImageUrl],
      media: [{ type: "image", src: remote.heroImageUrl, name: "firebase-image" }]
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
    alertText: data.alertText || "",
    fuel95: data.fuel95 || "--",
    diesel: data.diesel || "--",
    goldPrice: data.goldPrice || "--",
    newsApiKey: data.newsApiKey || "",
    constructionNews: data.constructionNews || [],
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
  const [now, setNow] = useState(new Date());
  const [fx, setFx] = useState({ loading: true, usdIls: "--", eurIls: "--", eurUsd: "--", jodIls: "--" });
  const [weather, setWeather] = useState({ loading: true, temp: "--", labelAr: "الطقس", labelHe: "מזג אוויר" });
  const [gold, setGold] = useState({ loading: true, price: "--" });
  const [constructionNews, setConstructionNews] = useState([]);
  const [firebaseSettingsId, setFirebaseSettingsId] = useState(null);

  const isAr = data.language === "ar";
  const locale = isAr ? "ar" : "he";
  const currentSlide = data.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];
  const slideMedia = currentSlide?.media?.length ? currentSlide.media : [{ type: "image", src: FALLBACK_IMAGE, name: "fallback" }];
  const currentMedia = slideMedia[imageIndex % Math.max(1, slideMedia.length)] || { type: "image", src: FALLBACK_IMAGE };

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
    const fuelItems = [
      data.fuel95 && data.fuel95 !== "--" ? `${isAr ? "بنزين 95" : "בנזין 95"}: ₪${data.fuel95}` : "",
      data.diesel && data.diesel !== "--" ? `${isAr ? "سولار" : "סולר"}: ₪${data.diesel}` : ""
    ].filter(Boolean);
    return [...base, ...fuelItems, ...newsItems.map((n) => `🏗️ ${n}`)].join("     •     ");
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

  return (
    <div dir="rtl" className="tv-root">
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
          </main>

          <aside className="offer-card glass-panel">
            <div className="offer-title">{t(data, "offerTitleHe", "offerTitleAr")} 🔥</div>
            <div className="offer-percent">{data.offerPercent}</div>
            <div className="offer-word">{isAr ? "خصم" : "הנחה"}</div>
            <div className="offer-text">{t(data, "offerTextHe", "offerTextAr")}</div>
            <div className="offer-button">{isAr ? "لفترة محدودة!" : "לתקופה מוגבלת!"}</div>
            <div className="fuel-row">
              <div className="fuel-box">
                <div className="fuel-label"><Fuel size={16} /> {isAr ? "بنزين 95" : "בנזין 95"}</div>
                <div className="fuel-value">₪{data.fuel95 || "--"}</div>
              </div>
              <div className="fuel-box">
                <div className="fuel-label"><Fuel size={16} /> {isAr ? "سولار" : "סולר"}</div>
                <div className="fuel-value">₪{data.diesel || "--"}</div>
              </div>
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
            <label>عنوان العرض عبري <input value={draft.offerTitleHe} onChange={(e) => updateDraft("offerTitleHe", e.target.value)} /></label>
            <label>عنوان العرض عربي <input value={draft.offerTitleAr} onChange={(e) => updateDraft("offerTitleAr", e.target.value)} /></label>
            <label>نص العرض عبري <input value={draft.offerTextHe} onChange={(e) => updateDraft("offerTextHe", e.target.value)} /></label>
            <label>نص العرض عربي <input value={draft.offerTextAr} onChange={(e) => updateDraft("offerTextAr", e.target.value)} /></label>
            <label>نسبة الخصم <input value={draft.offerPercent} onChange={(e) => updateDraft("offerPercent", e.target.value)} /></label>
            <label>سرعة شريط الأخبار <input type="number" value={draft.tickerSpeed} onChange={(e) => updateDraft("tickerSpeed", Number(e.target.value))} /></label>
            <label>تنبيه فوري <input value={draft.alertText || ""} onChange={(e) => updateDraft("alertText", e.target.value)} /></label>
            <label>بنزين 95 <input value={draft.fuel95 || ""} onChange={(e) => updateDraft("fuel95", e.target.value)} /></label>
            <label>سولار <input value={draft.diesel || ""} onChange={(e) => updateDraft("diesel", e.target.value)} /></label>
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
