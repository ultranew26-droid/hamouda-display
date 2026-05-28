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
  Sparkles,
  ScanSearch,
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

const AI_PRODUCTS = [
  {
    id: "cement",
    icon: "cement",
    nameHe: "מלט 50 ק״ג",
    nameAr: "إسمنت 50 كغم",
    price: "₪29",
    unitHe: "שק",
    unitAr: "كيس",
    titleHe: "HAMOODI AI מזהה ביקוש גבוה למלט",
    titleAr: "HAMOODI AI اكتشف طلب عالي على الإسمنت",
    noteHe: "מומלץ ליציקות ועבודות בנייה.",
    noteAr: "مناسب للصب وأعمال البناء.",
    color: "#f5b21a",
    img: "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "steel",
    icon: "steel",
    nameHe: "ברזל 12 מ״מ",
    nameAr: "حديد 12 ملم",
    price: "₪43",
    unitHe: "מ׳",
    unitAr: "متر",
    titleHe: "HAMOODI AI פותח מצב ברזל",
    titleAr: "HAMOODI AI يفتح مشهد الحديد",
    noteHe: "מתאים לשלד, עמודים ותקרות.",
    noteAr: "مناسب للهيكل والأعمدة والأسقف.",
    color: "#38bdf8",
    img: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "paint",
    icon: "paint",
    nameHe: "צבע פנים",
    nameAr: "دهان داخلي",
    price: "₪120",
    unitHe: "גלון",
    unitAr: "غالون",
    titleHe: "מבצע צבעים פעיל עכשיו",
    titleAr: "عرض الدهانات فعال الآن",
    noteHe: "צבעים איכותיים לגימור נקי.",
    noteAr: "دهانات عالية الجودة لتشطيب أنيق.",
    color: "#f472b6",
    img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "sand",
    icon: "sand",
    nameHe: "חול דק",
    nameAr: "رمل ناعم",
    price: "₪180",
    unitHe: "קוב",
    unitAr: "كوب",
    titleHe: "HAMOODI AI מציג חומרי בסיס",
    titleAr: "HAMOODI AI يعرض مواد الأساس",
    noteHe: "חול לעבודות טיח ובנייה.",
    noteAr: "رمل لأعمال الطوب واللياسة.",
    color: "#f59e0b",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "wood",
    icon: "wood",
    nameHe: "עץ לבנייה",
    nameAr: "خشب للبناء",
    price: "₪28",
    unitHe: "מ׳",
    unitAr: "متر",
    titleHe: "עץ לפרויקטים ועבודות תבנית",
    titleAr: "خشب للمشاريع وأعمال الصب",
    noteHe: "לוחות ועצים זמינים לפי כמות.",
    noteAr: "ألواح وأخشاب متوفرة حسب الكمية.",
    color: "#fbbf24",
    img: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "electric",
    icon: "electric",
    nameHe: "חומרי חשמל",
    nameAr: "مواد كهرباء",
    price: "₪25",
    unitHe: "יח׳",
    unitAr: "قطعة",
    titleHe: "מצב חשמל וניאון פעיל",
    titleAr: "وضع الكهرباء والنيون فعال",
    noteHe: "כבלים, מפסקים ותאורה.",
    noteAr: "أسلاك ومفاتيح وإنارة.",
    color: "#22d3ee",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80"
  }
];

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


    /* HAMOODI AI LIVE CINEMATIC SHOWCASE */
    .ai-live-stage {
      position:absolute;
      inset:0;
      overflow:hidden;
      background:
        radial-gradient(circle at 50% 50%, rgba(34,211,238,.16), transparent 34%),
        radial-gradient(circle at 50% 92%, rgba(245,178,26,.18), transparent 32%),
        linear-gradient(180deg, rgba(2,6,12,.96), rgba(3,7,12,.98));
    }
    .ai-live-bg {
      position:absolute; inset:-8%; opacity:.34; transform:scale(1.08);
      background-size:cover; background-position:center;
      filter:blur(8px) saturate(1.3) brightness(.62);
      animation: aiBgMove 8s ease-in-out infinite;
    }
    .ai-live-fog {
      position:absolute; inset:-20%; pointer-events:none; opacity:.48;
      background:
        radial-gradient(circle at 12% 84%, rgba(255,255,255,.18), transparent 16%),
        radial-gradient(circle at 85% 72%, rgba(255,255,255,.12), transparent 20%),
        radial-gradient(circle at 50% 82%, rgba(245,178,26,.16), transparent 28%);
      filter:blur(20px);
      animation: fogDrift 9s ease-in-out infinite alternate;
    }
    .ai-grid-overlay {
      position:absolute; inset:0; opacity:.22;
      background-image:linear-gradient(rgba(34,211,238,.25) 1px, transparent 1px),linear-gradient(90deg, rgba(34,211,238,.25) 1px, transparent 1px);
      background-size:2.1vw 2.1vw;
      mask-image:radial-gradient(circle at center, black 45%, transparent 86%);
    }
    .ai-scan-line {
      position:absolute; left:0; right:0; height:.18vw; top:-10%; z-index:6;
      background:linear-gradient(90deg, transparent, rgba(34,211,238,.2), #7dd3fc, rgba(245,178,26,.75), transparent);
      box-shadow:0 0 24px rgba(34,211,238,.95), 0 0 42px rgba(245,178,26,.45);
      animation: aiScan 4.6s ease-in-out infinite;
    }
    .ai-light-sweep {
      position:absolute; inset:-30% -10%; z-index:4; pointer-events:none;
      background:linear-gradient(105deg, transparent 36%, rgba(255,255,255,.16) 48%, rgba(245,178,26,.20) 52%, transparent 65%);
      animation: lightSweep 6.2s ease-in-out infinite;
    }
    .ai-hud-panel {
      position:absolute; top:1.15vw; left:2vw; right:2vw; z-index:8;
      border:1px solid rgba(34,211,238,.55); border-radius:1vw;
      background:linear-gradient(180deg, rgba(3,12,22,.72), rgba(5,8,14,.60));
      box-shadow:0 0 28px rgba(34,211,238,.24), inset 0 0 28px rgba(34,211,238,.06);
      padding:.72vw 1vw; display:grid; grid-template-columns:4.2vw 1fr 8vw; gap:.9vw; align-items:center;
      backdrop-filter:blur(8px);
    }
    .ai-orb {
      width:3.55vw; height:3.55vw; border-radius:50%; display:grid; place-items:center;
      color:#06111c; background:radial-gradient(circle at 35% 30%, #fff, #67e8f9 35%, #0891b2 72%);
      box-shadow:0 0 24px rgba(34,211,238,.9), inset 0 0 18px rgba(255,255,255,.5);
      animation: orbPulse 2.2s ease-in-out infinite;
    }
    .ai-hud-title { color:#67e8f9; font-size:.95vw; font-weight:1000; letter-spacing:.02em; }
    .ai-hud-text { font-size:1.45vw; line-height:1.25; font-weight:1000; text-shadow:0 0 12px rgba(0,0,0,.85); }
    .voice-bars { height:1.2vw; display:flex; justify-content:center; align-items:end; gap:.12vw; direction:ltr; }
    .voice-bars span { width:.12vw; border-radius:1vw; background:linear-gradient(180deg,#67e8f9,#f5b21a); animation: voiceBeat .8s ease-in-out infinite; box-shadow:0 0 8px rgba(34,211,238,.7); }
    .voice-bars span:nth-child(odd){ animation-delay:.16s; }
    .voice-bars span:nth-child(3n){ animation-delay:.32s; }
    .ai-product-world { position:absolute; inset:5.8vw 1.2vw 6.3vw; z-index:5; display:grid; grid-template-columns:1fr 13vw; gap:.9vw; align-items:end; }
    .cinema-product-zone { position:relative; height:100%; overflow:hidden; border-radius:1vw; border:1px solid rgba(245,178,26,.38); background:rgba(0,0,0,.18); }
    .holo-rings { position:absolute; left:50%; bottom:8%; width:28vw; height:8vw; transform:translateX(-50%); border-radius:50%; border:.12vw solid rgba(245,178,26,.65); box-shadow:0 0 32px rgba(245,178,26,.45), inset 0 0 30px rgba(245,178,26,.15); animation:ringPulse 2.4s ease-in-out infinite; }
    .holo-rings:before,.holo-rings:after{ content:""; position:absolute; inset:18% 9%; border-radius:50%; border:1px solid rgba(34,211,238,.45); animation:ringSpin 5s linear infinite; }
    .holo-rings:after{ inset:33% 18%; border-color:rgba(245,178,26,.45); animation-duration:3.5s; animation-direction:reverse; }
    .real-product-img {
      position:absolute; left:50%; bottom:12%; z-index:3; width:min(30vw, 58vh); height:min(24vw, 46vh); transform:translateX(-50%);
      object-fit:contain; filter:drop-shadow(0 1vw 1.2vw rgba(0,0,0,.75)) drop-shadow(0 0 1.2vw rgba(245,178,26,.35));
      animation: productEnter 5.6s cubic-bezier(.2,.9,.2,1) infinite;
    }
    .product-cement .real-product-img { animation-name: cementRise; }
    .product-steel .real-product-img { animation-name: steelRise; }
    .product-paint .real-product-img { animation-name: paintPop; }
    .product-sand .real-product-img { animation-name: sandFloat; }
    .product-wood .real-product-img { animation-name: woodSlide; }
    .product-electric .real-product-img { animation-name: electricPulse; }
    .dust-cloud { position:absolute; left:50%; bottom:9%; width:30vw; height:8vw; transform:translateX(-50%); z-index:2; opacity:.65; filter:blur(10px); background:radial-gradient(ellipse at center, rgba(255,238,190,.36), transparent 68%); animation:dustBreath 3.8s ease-in-out infinite; }
    .spark-field { position:absolute; inset:0; z-index:4; pointer-events:none; overflow:hidden; }
    .spark-field span { position:absolute; width:.22vw; height:.22vw; border-radius:50%; background:#ffd166; box-shadow:0 0 12px #ffd166; animation:sparkFly 1.9s linear infinite; }
    .paint-pour { position:absolute; top:-12%; left:45%; width:5vw; height:18vw; z-index:4; border-radius:0 0 2vw 2vw; background:linear-gradient(180deg,#f0f,#ff2b72,#f5b21a); opacity:0; filter:drop-shadow(0 0 18px rgba(244,114,182,.9)); animation:paintPour 5.6s ease-in-out infinite; }
    .electric-bolt { position:absolute; top:18%; left:58%; width:.45vw; height:14vw; background:#67e8f9; opacity:0; z-index:4; box-shadow:0 0 22px #67e8f9; clip-path:polygon(45% 0,100% 38%,62% 38%,100% 100%,10% 46%,48% 46%); animation:electricBolt 5.6s ease-in-out infinite; }
    .steel-rods { position:absolute; left:52%; bottom:8%; z-index:2; display:flex; gap:.55vw; transform:translateX(-50%); }
    .steel-rods span { display:block; width:.42vw; height:18vw; border-radius:.3vw; background:linear-gradient(90deg,#555,#f3f4f6,#333); box-shadow:0 0 16px rgba(125,211,252,.28); animation:rodRise 5.6s ease-in-out infinite; }
    .product-details-card { align-self:stretch; border:1px solid rgba(34,211,238,.42); border-radius:1vw; background:linear-gradient(180deg,rgba(2,10,18,.82),rgba(2,6,12,.88)); padding:1vw; display:flex; flex-direction:column; justify-content:center; box-shadow:0 0 26px rgba(34,211,238,.18); }
    .scan-label { color:#67e8f9; font-size:.9vw; font-weight:1000; margin-bottom:.55vw; }
    .scan-name { font-size:1.35vw; font-weight:1000; line-height:1.05; margin-bottom:.75vw; }
    .scan-price { border-radius:.75vw; padding:.7vw .6vw; color:#07111f; background:linear-gradient(135deg,#fff1a8,#f5b21a); font-size:2vw; font-weight:1000; text-align:center; box-shadow:0 0 20px rgba(245,178,26,.55); }
    .scan-note { margin-top:.8vw; color:rgba(255,255,255,.78); font-size:.78vw; font-weight:800; line-height:1.4; }
    .ai-product-strip { position:absolute; left:1.2vw; right:1.2vw; bottom:1vw; height:4.5vw; z-index:7; display:grid; grid-template-columns:repeat(6,1fr); gap:.45vw; }
    .ai-product-tab { border:1px solid rgba(255,255,255,.12); border-radius:.75vw; background:rgba(0,0,0,.52); display:flex; align-items:center; justify-content:center; gap:.35vw; font-size:.82vw; font-weight:1000; color:#fff; box-shadow:inset 0 0 16px rgba(255,255,255,.025); }
    .ai-product-tab.active { border-color:rgba(245,178,26,.9); color:#ffdc63; background:rgba(245,178,26,.10); box-shadow:0 0 22px rgba(245,178,26,.42), inset 0 0 18px rgba(245,178,26,.08); }
    .ai-live-stage:after { content:""; position:absolute; inset:0; pointer-events:none; z-index:9; background:linear-gradient(180deg, rgba(255,255,255,.03), transparent 10%, transparent 90%, rgba(0,0,0,.28)); }
    @keyframes aiBgMove { 0%,100%{ transform:scale(1.08) translateX(0); } 50%{ transform:scale(1.16) translateX(1.5vw); } }
    @keyframes fogDrift { from{ transform:translateX(-3vw) translateY(1vw); } to{ transform:translateX(3vw) translateY(-1vw); } }
    @keyframes aiScan { 0%{ top:-8%; opacity:0; } 12%{ opacity:1; } 58%{ top:92%; opacity:1; } 72%,100%{ top:110%; opacity:0; } }
    @keyframes lightSweep { 0%,35%{ transform:translateX(70%) skewX(-10deg); opacity:0; } 52%{ opacity:1; } 85%,100%{ transform:translateX(-70%) skewX(-10deg); opacity:0; } }
    @keyframes orbPulse { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.08); } }
    @keyframes voiceBeat { 0%,100%{ height:.25vw; } 50%{ height:1.1vw; } }
    @keyframes ringPulse { 0%,100%{ transform:translateX(-50%) scale(.96); opacity:.8; } 50%{ transform:translateX(-50%) scale(1.05); opacity:1; } }
    @keyframes ringSpin { from{ transform:rotate(0); } to{ transform:rotate(360deg); } }
    @keyframes cementRise { 0%{ transform:translateX(-50%) translateY(9vw) scale(.78) rotateY(-14deg); opacity:0; } 18%{ opacity:1; } 45%{ transform:translateX(-50%) translateY(0) scale(1) rotateY(8deg); } 75%{ transform:translateX(-50%) translateY(-.6vw) scale(1.04) rotateY(-8deg); } 100%{ transform:translateX(-50%) translateY(9vw) scale(.88) rotateY(14deg); opacity:0; } }
    @keyframes steelRise { 0%{ transform:translateX(-50%) translateY(12vw) scale(.85); opacity:0; } 22%{ opacity:1; transform:translateX(-50%) translateY(0) scale(1); } 76%{ transform:translateX(-50%) translateY(-.8vw) scale(1.05); opacity:1; } 100%{ transform:translateX(-50%) translateY(12vw) scale(.9); opacity:0; } }
    @keyframes paintPop { 0%{ transform:translateX(-50%) translateY(10vw) scale(.76) rotate(-4deg); opacity:0; } 20%{ transform:translateX(-50%) translateY(0) scale(1) rotate(2deg); opacity:1; } 72%{ transform:translateX(-50%) translateY(-.5vw) scale(1.04) rotate(-2deg); opacity:1; } 100%{ transform:translateX(-50%) translateY(10vw) scale(.84) rotate(4deg); opacity:0; } }
    @keyframes sandFloat { 0%{ transform:translateX(-50%) translateY(9vw) scale(.8); opacity:0; } 22%{ opacity:1; transform:translateX(-50%) translateY(0) scale(1); } 72%{ transform:translateX(-50%) translateY(-.4vw) scale(1.03); } 100%{ transform:translateX(-50%) translateY(9vw) scale(.84); opacity:0; } }
    @keyframes woodSlide { 0%{ transform:translateX(55%) translateY(2vw) scale(.85); opacity:0; } 22%{ transform:translateX(-50%) translateY(0) scale(1); opacity:1; } 72%{ transform:translateX(-52%) translateY(-.5vw) scale(1.03); opacity:1; } 100%{ transform:translateX(-150%) translateY(2vw) scale(.9); opacity:0; } }
    @keyframes electricPulse { 0%{ transform:translateX(-50%) translateY(9vw) scale(.76); opacity:0; filter:drop-shadow(0 0 0 #67e8f9); } 20%{ opacity:1; transform:translateX(-50%) translateY(0) scale(1); } 50%{ filter:drop-shadow(0 0 2vw #67e8f9) drop-shadow(0 0 1vw #f5b21a); } 78%{ opacity:1; transform:translateX(-50%) translateY(-.4vw) scale(1.05); } 100%{ opacity:0; transform:translateX(-50%) translateY(9vw) scale(.82); } }
    @keyframes dustBreath { 0%,100%{ opacity:.25; transform:translateX(-50%) scale(.75); } 45%{ opacity:.78; transform:translateX(-50%) scale(1.1); } }
    @keyframes sparkFly { 0%{ transform:translateY(0) scale(.4); opacity:0; } 22%{ opacity:1; } 100%{ transform:translateY(-12vw) translateX(3vw) scale(0); opacity:0; } }
    @keyframes paintPour { 0%,15%{ opacity:0; transform:translateY(-7vw) scaleY(.2); } 28%,62%{ opacity:1; transform:translateY(0) scaleY(1); } 82%,100%{ opacity:0; transform:translateY(6vw) scaleY(.3); } }
    @keyframes electricBolt { 0%,28%,100%{ opacity:0; transform:scaleY(.6); } 34%,38%,46%{ opacity:1; transform:scaleY(1); } 42%,52%{ opacity:.25; } }
    @keyframes rodRise { 0%{ transform:translateY(10vw); opacity:0; } 20%,78%{ transform:translateY(0); opacity:.9; } 100%{ transform:translateY(10vw); opacity:0; } }

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

function VoiceBars() {
  return (
    <div className="voice-bars" aria-hidden="true">
      {Array.from({ length: 34 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${(i % 9) * 0.07}s` }} />
      ))}
    </div>
  );
}

function SparkField({ show }) {
  if (!show) return null;
  return (
    <div className="spark-field" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${12 + ((i * 37) % 72)}%`,
            bottom: `${12 + ((i * 19) % 34)}%`,
            animationDelay: `${(i % 8) * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

function CinematicAIShowcase({ data, isAr, product, index }) {
  const name = isAr ? product.nameAr : product.nameHe;
  const unit = isAr ? product.unitAr : product.unitHe;
  const title = isAr ? product.titleAr : product.titleHe;
  const note = isAr ? product.noteAr : product.noteHe;

  return (
    <main className="hero-card glass-panel">
      <div className={`ai-live-stage product-${product.id}`}>
        <div className="ai-live-bg" style={{ backgroundImage: `url(${product.img})` }} />
        <div className="ai-live-fog" />
        <div className="ai-grid-overlay" />
        <div className="ai-scan-line" />
        <div className="ai-light-sweep" />

        <div className="ai-hud-panel">
          <div className="ai-orb"><Bot size={30} /></div>
          <div>
            <div className="ai-hud-title">HAMOODI AI  <Sparkles size={15} style={{verticalAlign:'middle'}} /></div>
            <div className="ai-hud-text">{title}</div>
            <VoiceBars />
          </div>
          <div style={{textAlign:'center', color:'#ffdc63', fontWeight:1000, fontSize:'.78vw'}}>
            LIVE SCAN<br />{String(index + 1).padStart(2, '0')}/06
          </div>
        </div>

        <div className="ai-product-world">
          <div className="cinema-product-zone">
            <div className="holo-rings" />
            {product.id === 'paint' && <div className="paint-pour" />}
            {product.id === 'electric' && <div className="electric-bolt" />}
            {product.id === 'steel' && (
              <div className="steel-rods" aria-hidden="true">
                <span /><span /><span /><span /><span /><span />
              </div>
            )}
            <div className="dust-cloud" />
            <SparkField show={product.id === 'steel' || product.id === 'wood' || product.id === 'cement'} />
            <img key={product.id} className="real-product-img" src={product.img} alt={name} />
          </div>

          <div className="product-details-card">
            <div className="scan-label">AI PRODUCT SCAN</div>
            <div className="scan-name">{name}</div>
            <div className="scan-price">{product.price} / {unit}</div>
            <div className="scan-note">{note}</div>
            <div className="scan-note" style={{color:'#67e8f9'}}>✓ {isAr ? 'متوفر الآن' : 'זמין עכשיו'} &nbsp; ✓ {isAr ? 'موصى به' : 'מומלץ'}</div>
          </div>
        </div>

        <div className="ai-product-strip">
          {AI_PRODUCTS.map((item, i) => {
            const Icon = item.icon === 'paint' ? PaintBucket : item.icon === 'steel' ? Layers : item.icon === 'wood' ? Hammer : item.icon === 'electric' ? Zap : item.icon === 'sand' ? Building2 : Package;
            return (
              <div key={item.id} className={`ai-product-tab ${i === index ? 'active' : ''}`}>
                <Icon size={20} /> {isAr ? item.nameAr : item.nameHe}
              </div>
            );
          })}
        </div>
      </div>
    </main>
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
  const [aiIndex, setAiIndex] = useState(0);

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
  const aiProduct = AI_PRODUCTS[aiIndex % AI_PRODUCTS.length];

  useEffect(() => {
    const timer = setInterval(() => {
      setAiIndex((v) => (v + 1) % AI_PRODUCTS.length);
    }, 5600);
    return () => clearInterval(timer);
  }, []);

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

          <CinematicAIShowcase
            data={data}
            isAr={isAr}
            product={aiProduct}
            index={aiIndex % AI_PRODUCTS.length}
          />

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
