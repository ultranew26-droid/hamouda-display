import React, { useEffect, useMemo, useState } from "react";
import { Settings, X, Plus, Trash2, Save, ImagePlus, Languages, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "./firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

const STORAGE_KEY = "hamouda-display-settings-v4";
const NL = String.fromCharCode(10);

const FALLBACK_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#05070b'/><stop offset='1' stop-color='#1f2937'/></linearGradient></defs>
  <rect width='1600' height='900' fill='url(#g)'/>
  <path d='M0 740 C320 620 520 780 820 660 S1240 500 1600 650 V900 H0Z' fill='#f5b21a' opacity='.18'/>
  <text x='800' y='410' text-anchor='middle' fill='#f5b21a' font-size='78' font-family='Arial' font-weight='800'>HAMOUDI</text>
  <text x='800' y='500' text-anchor='middle' fill='white' font-size='48' font-family='Arial'>Building Materials Display</text>
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
  slideSeconds: 30,
  tickerSpeed: 24,
  heroImageUrl: "",
  tickerText: "",
  logoText: "ח",
  heroSlides: [
    {
      titleHe: "חומרי בניין ברמה אחרת",
      titleAr: "مواد بناء بمستوى مختلف",
      subtitleHe: "מחירים, מבצעים ומוצרים מתעדכנים על המסך בזמן אמת",
      subtitleAr: "أسعار، عروض ومنتجات تظهر على الشاشة بشكل احترافي",
      image: FALLBACK_IMAGE,
      images: [FALLBACK_IMAGE],
      imageNames: [],
      media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }],
      tagHe: "תצוגה ראשית",
      tagAr: "العرض الرئيسي"
    },
    {
      titleHe: "כל מה שהקבלן צריך במקום אחד",
      titleAr: "كل ما يحتاجه المقاول في مكان واحد",
      subtitleHe: "ברזל • מלט • צבעים • גבס • כלי עבודה • חומרי איטום",
      subtitleAr: "حديد • إسمنت • دهانات • جبص • أدوات • عزل",
      image: FALLBACK_IMAGE,
      images: [FALLBACK_IMAGE],
      imageNames: [],
      media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }],
      tagHe: "מחלקות",
      tagAr: "الأقسام"
    }
  ],
  prices: [
    { nameHe: "מלט", nameAr: "إسمنت", price: "29", unitHe: "שק", unitAr: "كيس", change: "+1", direction: "up" },
    { nameHe: "ברזל 8 מ״מ", nameAr: "حديد 8 ملم", price: "32", unitHe: "מ׳", unitAr: "متر", change: "0", direction: "flat" },
    { nameHe: "ברזל 10 מ״מ", nameAr: "حديد 10 ملم", price: "38", unitHe: "מ׳", unitAr: "متر", change: "-1", direction: "down" },
    { nameHe: "ברזל 12 מ״מ", nameAr: "حديد 12 ملم", price: "43", unitHe: "מ׳", unitAr: "متر", change: "+2", direction: "up" },
    { nameHe: "גבס לבן", nameAr: "جبص أبيض", price: "45", unitHe: "לוח", unitAr: "لوح", change: "0", direction: "flat" },
    { nameHe: "צבע פנים", nameAr: "دهان داخلي", price: "120", unitHe: "גלון", unitAr: "غالون", change: "-5", direction: "down" },
    { nameHe: "חול דק", nameAr: "رمل ناعم", price: "180", unitHe: "קוב", unitAr: "كوب", change: "+5", direction: "up" },
    { nameHe: "חומר איטום", nameAr: "مادة عزل", price: "65", unitHe: "יח׳", unitAr: "قطعة", change: "0", direction: "flat" }
  ],
  topProductsHe: ["מלט", "ברזל 12 מ״מ", "גבס לבן", "צבע פנים", "חומרי איטום", "כלי עבודה"],
  topProductsAr: ["إسمنت", "حديد 12 ملم", "جبص أبيض", "دهان داخلي", "مواد عزل", "أدوات عمل"],
  offerTitleHe: "מבצע השבוע",
  offerTitleAr: "عرض الأسبوع",
  offerTextHe: "הנחה מיוחדת על צבעים וחומרי איטום",
  offerTextAr: "خصم خاص على الدهانات ومواد العزل",
  offerPercent: "10%",
  tickerHe: ["🔥 מבצעים יומיים על חומרי בניין", "🚚 אספקה מהירה להזמנות גדולות", "🏗️ ציוד מלא לקבלנים ופרויקטים", "📞 להזמנות ושירות: 054-7285036"],
  tickerAr: ["🔥 عروض يومية على مواد البناء", "🚚 توصيل سريع للطلبات الكبيرة", "🏗️ تجهيز كامل للمقاولين والمشاريع", "📞 للطلب والاستفسار: 054-7285036"]
};

function removeLargeImagesFromData(data) {
  return {
    ...data,
    heroSlides: (data.heroSlides || []).map((slide) => ({
      ...slide,
      image: FALLBACK_IMAGE,
      images: [FALLBACK_IMAGE],
      media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }],
      imageNames: slide.imageNames || slide.media?.map((m) => m.name).filter(Boolean) || []
    }))
  };
}

function normalizeData(input) {
  const merged = { ...DEFAULT_DATA, ...(input || {}) };
  return {
    ...merged,
    heroSlides: (merged.heroSlides || DEFAULT_DATA.heroSlides).map((slide) => {
      const oldImages = slide.images && slide.images.length ? slide.images : [slide.image || FALLBACK_IMAGE];
      let media = slide.media && slide.media.length
        ? slide.media
        : oldImages.map((src, i) => ({ type: "image", src, name: slide.imageNames?.[i] || `image-${i + 1}` }));

      // Blob links break after refresh, so never restore them from storage.
      media = media.filter((m) => m?.src && !String(m.src).startsWith("blob:"));
      if (!media.length) media = [{ type: "image", src: FALLBACK_IMAGE, name: "default" }];

      return {
        ...slide,
        image: media[0]?.src || FALLBACK_IMAGE,
        images: media.filter((m) => m.type === "image").map((m) => m.src),
        media,
        imageNames: slide.imageNames || media.map((m) => m.name).filter(Boolean)
      };
    })
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeData(JSON.parse(saved)) : DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

function safeSaveSettings(data) {
  const compact = removeLargeImagesFromData(data);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
    return { ok: true, message: "تم حفظ الإعدادات. الصور تبقى للجلسة الحالية فقط لتجنب امتلاء ذاكرة المتصفح." };
  } catch (error) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(removeLargeImagesFromData(DEFAULT_DATA)));
    } catch {}
    return { ok: false, message: "لم يتم الحفظ بسبب امتلاء ذاكرة المتصفح. تم منع حفظ الصور الكبيرة داخل localStorage." };
  }
}

function runSmallTests() {
  const sample = normalizeData({ heroSlides: [{ titleHe: "t", titleAr: "ع" }] });
  console.assert(sample.heroSlides[0].images.length === 1, "normalizeData should add fallback image array");
  const cleaned = removeLargeImagesFromData({ heroSlides: [{ media: [{ type: "video", src: "blob:test", name: "a.mp4" }], images: ["data:image/png;base64,AAA"], image: "data:image/png;base64,AAA", imageNames: ["a.png"] }] });
  console.assert(cleaned.heroSlides[0].images[0] === FALLBACK_IMAGE, "removeLargeImagesFromData should remove large media");
  console.assert(cleaned.heroSlides[0].media[0].src === FALLBACK_IMAGE, "removeLargeImagesFromData should reset media to fallback");
}

if (typeof window !== "undefined") runSmallTests();

const t = (data, heKey, arKey) => (data.language === "ar" ? data[arKey] : data[heKey]);
const itemT = (data, item, heKey, arKey) => (data.language === "ar" ? item?.[arKey] : item?.[heKey]);

function applyFirebaseSettings(base, remote) {
  if (!remote) return base;

  const next = { ...base };

  // اللغة من Firebase: اكتب ar للعربي أو he للعبري
  if (remote.language === "ar" || remote.language === "he") {
    next.language = remote.language;
  }

  // أسماء المحل منفصلة حسب اللغة
  // storeNameAr يظهر فقط عند اللغة العربية
  // storeNameHe يظهر فقط عند اللغة العبرية
  if (remote.storeNameAr) next.businessNameAr = remote.storeNameAr;
  if (remote.storeNameHe) next.businessNameHe = remote.storeNameHe;

  // توافق مع الحقل القديم storeName: نعتبره عربي فقط حتى لا يظهر العربي عند اختيار العبرية
  if (remote.storeName && !remote.storeNameAr) {
    next.businessNameAr = remote.storeName;
  }

  // وصف المحل منفصل حسب اللغة
  if (remote.sloganAr) next.sloganAr = remote.sloganAr;
  if (remote.sloganHe) next.sloganHe = remote.sloganHe;

  if (remote.phone) next.phone = remote.phone;
  if (remote.primaryColor) next.primaryColor = remote.primaryColor;
  if (remote.secondaryColor) next.backgroundColor = remote.secondaryColor;

  // العروض منفصلة حسب اللغة
  if (remote.offerTitleAr) next.offerTitleAr = remote.offerTitleAr;
  if (remote.offerTitleHe) next.offerTitleHe = remote.offerTitleHe;
  if (remote.offerTextAr) next.offerTextAr = remote.offerTextAr;
  if (remote.offerTextHe) next.offerTextHe = remote.offerTextHe;

  // توافق مع الحقول القديمة: نعتبرها عربية فقط حتى لا تظهر عند اختيار العبرية
  if (remote.offerTitle && !remote.offerTitleAr) {
    next.offerTitleAr = remote.offerTitle;
  }

  if (remote.offerText && !remote.offerTextAr) {
    next.offerTextAr = remote.offerText;
  }

  if (remote.offerPercent !== undefined) {
    next.offerPercent = String(remote.offerPercent).includes("%")
      ? String(remote.offerPercent)
      : `${remote.offerPercent}%`;
  }

  // صور متعددة من Firebase
  if (
    remote.heroImages &&
    Array.isArray(remote.heroImages) &&
    remote.heroImages.length > 0
  ) {
    const images = remote.heroImages.filter(Boolean);

    const firstSlide =
      next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];

    next.heroSlides = [
      {
        ...firstSlide,
        image: images[0],
        images: images,
        media: images.map((img, index) => ({
          type: "image",
          src: img,
          name: `firebase-image-${index}`
        }))
      }
    ];
  }
  else if (remote.heroImageUrl) {
    next.heroImageUrl = remote.heroImageUrl;

    const firstSlide =
      next.heroSlides?.[0] || DEFAULT_DATA.heroSlides[0];

    next.heroSlides = [
      {
        ...firstSlide,
        image: remote.heroImageUrl,
        images: [remote.heroImageUrl],
        media: [
          {
            type: "image",
            src: remote.heroImageUrl,
            name: "firebase-image"
          }
        ]
      }
    ];
  }

  // شريط الأخبار منفصل حسب اللغة
  if (remote.tickerTextAr) {
    next.tickerText = remote.tickerTextAr;
    next.tickerAr = [remote.tickerTextAr];
  }

  if (remote.tickerTextHe) {
    next.tickerHe = [remote.tickerTextHe];
  }

  // توافق مع الحقل القديم tickerText: نعتبره عربي فقط
  if (remote.tickerText && !remote.tickerTextAr) {
    next.tickerText = remote.tickerText;
    next.tickerAr = [remote.tickerText];
  }

  // أسعار المنتجات من Firebase
  if (remote.prices && Array.isArray(remote.prices) && remote.prices.length > 0) {
    next.prices = remote.prices.map((p) => ({
      nameHe: p.nameHe || "",
      nameAr: p.nameAr || "",
      price: String(p.price ?? "0"),
      unitHe: p.unitHe || "",
      unitAr: p.unitAr || "",
      change: p.change || "0",
      direction: p.direction || "flat"
    }));
  }

  // أسعار صرف اختيارية من Firebase بدل API إذا بدك تتحكم يدويًا
  if (remote.exchangeUSD !== undefined) next.exchangeUSD = remote.exchangeUSD;
  if (remote.exchangeEUR !== undefined) next.exchangeEUR = remote.exchangeEUR;

  return next;
}
function toFirebaseSettings(data) {
  return {
    // حقول قديمة للتوافق مع النسخ السابقة
    storeName: data.businessNameAr || "",
    offerTitle: data.offerTitleAr || "",
    offerText: data.offerTextAr || "",
    tickerText: data.tickerText || data.tickerAr?.[0] || "",

    // حقول جديدة منفصلة حسب اللغة
    language: data.language || "ar",
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
    heroImageUrl: data.heroImageUrl || data.heroSlides?.[0]?.image || "",
    tickerTextAr: data.tickerAr?.[0] || data.tickerText || "",
    tickerTextHe: data.tickerHe?.[0] || "",
    prices: (data.prices || []).map((p) => ({
      nameHe: p.nameHe || "",
      nameAr: p.nameAr || "",
      price: String(p.price ?? "0"),
      unitHe: p.unitHe || "",
      unitAr: p.unitAr || "",
      change: p.change || "0",
      direction: p.direction || "flat"
    })),
    currency: "ILS",
    updatedAt: new Date().toISOString()
  };
}
export default function HamoudaPremiumDisplay() {
  const [data, setData] = useState(loadData);
  const [draft, setDraft] = useState(data);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [fx, setFx] = useState({ loading: true, usdIls: "--", eurIls: "--", eurUsd: "--" });
  const [notice, setNotice] = useState("");
  const [firebaseSettingsId, setFirebaseSettingsId] = useState(null);

  const isAr = data.language === "ar";
  const dir = "rtl";
  const langClass = isAr ? "font-['Aref_Ruqaa',serif]" : "font-['Heebo',Arial,sans-serif]";
  const scale = Number(data.textScale || 1);
  const currentSlide = data.heroSlides[slideIndex % Math.max(1, data.heroSlides.length)] || data.heroSlides[0];
  const slideMedia = currentSlide?.media?.length
    ? currentSlide.media
    : (currentSlide?.images?.length ? currentSlide.images : [currentSlide?.image || FALLBACK_IMAGE]).map((src) => ({ type: "image", src, name: "image" }));
  const currentMedia = slideMedia[imageIndex % slideMedia.length] || { type: "image", src: FALLBACK_IMAGE, name: "fallback" };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "settings"), (snapshot) => {
      if (snapshot.empty) return;
      const firstDoc = snapshot.docs[0];
      setFirebaseSettingsId(firstDoc.id);
      const remote = firstDoc.data();
      setData((current) => applyFirebaseSettings(current, remote));
      setDraft((current) => applyFirebaseSettings(current, remote));
    }, (error) => {
      console.error("Firebase settings error:", error);
      setNotice("تعذر الاتصال بـ Firebase. تأكد من قواعد Firestore والإنترنت.");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    setSlideIndex(0);
  }, []);

  useEffect(() => {
    const mediaCount = slideMedia.length || 1;
    const i = setInterval(() => setImageIndex((v) => (v + 1) % mediaCount), 8000);
    return () => clearInterval(i);
  }, [slideIndex, slideMedia.length]);

  useEffect(() => {
    async function getRates() {
      try {
        const r = await fetch("https://open.er-api.com/v6/latest/USD");
        const j = await r.json();
        const usdIls = j?.rates?.ILS;
        const eur = j?.rates?.EUR;
        setFx({
          loading: false,
          usdIls: usdIls ? usdIls.toFixed(3) : "--",
          eurIls: usdIls && eur ? (usdIls / eur).toFixed(3) : "--",
          eurUsd: eur ? (1 / eur).toFixed(3) : "--"
        });
      } catch {
        setFx({ loading: false, usdIls: "--", eurIls: "--", eurUsd: "--" });
      }
    }
    getRates();
    const i = setInterval(getRates, 1000 * 60 * 60);
    return () => clearInterval(i);
  }, []);

  const tickerText = useMemo(() => (isAr ? data.tickerAr : data.tickerHe).join("     •     "), [data, isAr]);

  const saveSettings = async () => {
    const result = safeSaveSettings(draft);
    setData(draft);
    setSettingsOpen(false);
    try {
      const targetId = firebaseSettingsId || "main";
      await setDoc(doc(db, "settings", targetId), toFirebaseSettings(draft), { merge: true });
      setFirebaseSettingsId(targetId);
      setNotice("تم حفظ الإعدادات على Firebase وستظهر على شاشة التلفزيون تلقائيًا.");
    } catch (error) {
      console.error("Firebase save error:", error);
      setNotice(result.message + " لكن لم يتم الحفظ على Firebase. افحص قواعد Firestore.");
    }
    setTimeout(() => setNotice(""), 6500);
  };

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const toggleLanguage = () => {
    setData((d) => {
      const next = { ...d, language: d.language === "he" ? "ar" : "he" };
      safeSaveSettings(next);
      const targetId = firebaseSettingsId || "main";
      setDoc(doc(db, "settings", targetId), toFirebaseSettings(next), { merge: true }).catch(console.error);
      setFirebaseSettingsId(targetId);
      return next;
    });
  };

  return (
    <div dir={dir} className={`min-h-screen overflow-hidden text-white ${langClass}`} style={{ background: data.backgroundColor, fontSize: `${16 * scale}px` }}>
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 20% 20%, ${data.primaryColor}33, transparent 30%), radial-gradient(circle at 80% 40%, #38bdf833, transparent 28%)` }} />
      {notice && (
        <div className="fixed bottom-4 left-4 z-[120] max-w-md rounded-2xl border border-amber-300/40 bg-black/80 p-4 text-sm text-white  ">
          <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" /><span>{notice}</span></div>
        </div>
      )}

      <div className="fixed left-4 top-4 z-50 flex gap-2">
        <Button onClick={toggleLanguage} className="rounded-2xl bg-white/15   hover:bg-white/25">
          <Languages className="ml-2 h-4 w-4" /> {data.language === "he" ? "עברית" : "عربي"}
        </Button>
        <Button onClick={() => { setDraft(data); setSettingsOpen(true); }} className="rounded-2xl " style={{ background: data.primaryColor, color: "#111827" }}>
          <Settings className="ml-2 h-4 w-4" /> {isAr ? "الإعدادات" : "הגדרות"}
        </Button>
      </div>

      <main className="relative z-10 flex h-screen flex-col gap-2.5 p-4">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-2.5  ">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl text-2xl font-black " style={{ background: `linear-gradient(135deg, ${data.primaryColor}, #fff1a8)`, color: "#08111f" }}>{data.logoText}</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{t(data, "businessNameHe", "businessNameAr")}</h1>
              <p className="mt-0.5 text-sm text-white/75">{t(data, "sloganHe", "sloganAr")}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <InfoPill label={isAr ? "هاتف" : "טלפון"} value={`📞 ${data.phone}`} color={data.primaryColor} />
            <InfoPill label={isAr ? "دولار" : "דולר"} value={`$ ${data.exchangeUSD ?? fx.usdIls}`} color={data.primaryColor} />
            <InfoPill label={isAr ? "يورو" : "אירו"} value={`€ ${data.exchangeEUR ?? fx.eurIls}`} color={data.primaryColor} />
          </div>

          <div className="text-left">
            <div className="text-2xl font-black" style={{ color: data.primaryColor }}>{now.toLocaleTimeString(isAr ? "ar" : "he", { hour: "2-digit", minute: "2-digit" })}</div>
            <div className="text-xs text-white/70">{now.toLocaleDateString(isAr ? "ar" : "he", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </header>

        <section className="grid flex-1 grid-cols-[1.45fr_.95fr] gap-2.5 min-h-0">
          <Card className="relative overflow-hidden rounded-[1.7rem] border-white/10 bg-black/30  ">
            <div key={`${slideIndex}-${imageIndex}-${data.language}`} className="absolute inset-0">
              {currentMedia.type === "video" ? (
                <video src={currentMedia.src} className="h-full w-full object-contain" autoPlay muted loop playsInline />
              ) : (
                <img src={currentMedia.src || FALLBACK_IMAGE} className="h-full w-full object-contain" alt="slide" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
              )}
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
              <div className="absolute right-5 top-5 rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: data.primaryColor, color: "#0b1220" }}>{itemT(data, currentSlide, "tagHe", "tagAr")}</div>
              <div className="absolute bottom-6 right-6 max-w-3xl rounded-3xl bg-black/70 p-5">
                <h2 className="text-4xl font-black leading-tight">{itemT(data, currentSlide, "titleHe", "titleAr")}</h2>
                <p className="mt-2 text-lg text-white/85">{itemT(data, currentSlide, "subtitleHe", "subtitleAr")}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-rows-[1fr_auto] gap-2.5 min-h-0">
            <Card className="rounded-[1.5rem] border-white/10 bg-white/10   min-h-0 overflow-hidden">
              <CardContent className="h-full p-3">
                <h3 className="mb-2 text-xl font-black" style={{ color: data.primaryColor }}>{isAr ? "الأسعار المباشرة" : "מחירים חיים"}</h3>
                <div className="grid max-h-[calc(100%-2.2rem)] grid-cols-2 gap-2 overflow-hidden">
                  {data.prices.map((p, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-black/25 p-2.5 ">
                      <div className="text-sm font-bold text-white/85 truncate">{itemT(data, p, "nameHe", "nameAr")}</div>
                      <div className="mt-1 text-2xl font-black">₪{p.price}</div>
                      <div className="mt-0.5 flex items-center justify-between text-[11px] text-white/55">
                        <span>{itemT(data, p, "unitHe", "unitAr")}</span>
                        <span className={p.direction === "up" ? "text-green-400" : p.direction === "down" ? "text-red-400" : "text-white/50"}>{p.direction === "up" ? "↑" : p.direction === "down" ? "↓" : "—"} {p.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-white/10 bg-white/10  ">
              <CardContent className="grid grid-cols-[1fr_auto] items-center gap-3 p-3">
                <div>
                  <div className="text-sm font-bold text-white/65">{t(data, "offerTitleHe", "offerTitleAr")}</div>
                  <div className="mt-1 text-xl font-black">{t(data, "offerTextHe", "offerTextAr")}</div>
                </div>
                <div className="rounded-2xl px-4 py-2 text-3xl font-black " style={{ background: data.primaryColor, color: "#08111f" }}>{data.offerPercent}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-[1.4rem] border border-white/10 bg-white/10 p-2.5  ">
          <div className="flex items-center gap-2 overflow-hidden">
            <h3 className="shrink-0 px-2 text-base font-black" style={{ color: data.primaryColor }}>{isAr ? "الأكثر طلباً" : "הכי מבוקש"}</h3>
            <div className="grid flex-1 grid-cols-6 gap-2">
              {(isAr ? data.topProductsAr : data.topProductsHe).slice(0, 6).map((item, i) => <div key={i} className="truncate rounded-xl bg-black/25 px-3 py-2 text-center text-sm font-bold">{i + 1}. {item}</div>)}
            </div>
          </div>
        </section>

        <footer className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/35 py-2  ">
          <div className="whitespace-nowrap text-lg font-bold">
            {tickerText}
          </div>
        </footer>
      </main>

      {settingsOpen && (
          <aside className="fixed left-0 top-0 z-[100] h-screen w-[540px] overflow-y-auto border-r border-white/10 bg-slate-950 p-5 text-white" dir="rtl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-3xl font-black">لوحة الإعدادات</h2>
              <Button variant="ghost" onClick={() => setSettingsOpen(false)}><X /></Button>
            </div>

            <SettingsSection title="اللغة والبيانات العامة">
              <label className="mb-3 block"><span className="mb-1 block text-sm text-white/65">لغة الشاشة</span><select className="w-full rounded-xl bg-slate-900 p-3" value={draft.language} onChange={(e) => updateDraft("language", e.target.value)}><option value="he">עברית</option><option value="ar">العربية</option></select></label>
              <Input label="اسم المحل عبري" value={draft.businessNameHe} onChange={(v) => updateDraft("businessNameHe", v)} />
              <Input label="اسم المحل عربي" value={draft.businessNameAr} onChange={(v) => updateDraft("businessNameAr", v)} />
              <Input label="الشعار النصي" value={draft.logoText} onChange={(v) => updateDraft("logoText", v)} />
              <Input label="وصف عبري" value={draft.sloganHe} onChange={(v) => updateDraft("sloganHe", v)} />
              <Input label="وصف عربي" value={draft.sloganAr} onChange={(v) => updateDraft("sloganAr", v)} />
              <Input label="رقم الهاتف" value={draft.phone} onChange={(v) => updateDraft("phone", v)} />
            </SettingsSection>

            <SettingsSection title="الألوان والأحجام">
              <Input type="color" label="اللون الرئيسي" value={draft.primaryColor} onChange={(v) => updateDraft("primaryColor", v)} />
              <Input type="color" label="لون الخلفية" value={draft.backgroundColor} onChange={(v) => updateDraft("backgroundColor", v)} />
              <Input type="number" step="0.05" label="حجم الخط العام" value={draft.textScale} onChange={(v) => updateDraft("textScale", Number(v))} />
              <Input type="number" label="مدة تغيير السلايد بالثواني" value={draft.slideSeconds} onChange={(v) => updateDraft("slideSeconds", Number(v))} />
              <Input type="number" label="سرعة شريط الأخبار" value={draft.tickerSpeed} onChange={(v) => updateDraft("tickerSpeed", Number(v))} />
            </SettingsSection>

            <SettingsSection title="السلايدات والوسائط - صور وفيديوهات">
              <Input label="رابط الصورة الرئيسية من Firebase / الإنترنت" value={draft.heroImageUrl || ""} onChange={(v) => updateDraft("heroImageUrl", v)} />
              <div className="mb-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">ملاحظة مهمة: لتجنب خطأ QuotaExceededError، النصوص والأسعار والألوان تُحفظ الآن على Firebase وتظهر على شاشة التلفزيون مباشرة. الصور والفيديوهات تحتاج روابط خارجية أو رفع مؤقت من نفس الجهاز لأن Storage غير مفعل.</div>
              {draft.heroSlides.map((s, i) => <div key={i} className="mb-4 rounded-2xl bg-white/5 p-3">
                <Input label="العنوان عبري" value={s.titleHe} onChange={(v) => updateArray("heroSlides", i, "titleHe", v, setDraft)} />
                <Input label="العنوان عربي" value={s.titleAr} onChange={(v) => updateArray("heroSlides", i, "titleAr", v, setDraft)} />
                <Input label="الوصف عبري" value={s.subtitleHe} onChange={(v) => updateArray("heroSlides", i, "subtitleHe", v, setDraft)} />
                <Input label="الوصف عربي" value={s.subtitleAr} onChange={(v) => updateArray("heroSlides", i, "subtitleAr", v, setDraft)} />
                <Input label="التصنيف عبري" value={s.tagHe} onChange={(v) => updateArray("heroSlides", i, "tagHe", v, setDraft)} />
                <Input label="التصنيف عربي" value={s.tagAr} onChange={(v) => updateArray("heroSlides", i, "tagAr", v, setDraft)} />
                <MultiImageUploader label="اختر عدة صور أو فيديوهات من جهازك" onChange={(media, names) => updateSlideImages(i, media, names, setDraft)} />
                <div className="mt-2 text-xs text-white/55">عدد الوسائط داخل هذا السلايد: {(s.media || s.images || [s.image]).length}</div>
                {!!s.imageNames?.length && <div className="mt-1 text-xs text-white/45">{s.imageNames.join(" • ")}</div>}
                <Button variant="destructive" className="mt-2 w-full" onClick={() => removeItem("heroSlides", i, setDraft)}><Trash2 className="ml-2 h-4 w-4" /> حذف السلايد</Button>
              </div>)}
              <Button className="w-full" onClick={() => addItem("heroSlides", { titleHe: "כותרת חדשה", titleAr: "عنوان جديد", subtitleHe: "תיאור קצר", subtitleAr: "وصف مختصر", image: FALLBACK_IMAGE, images: [FALLBACK_IMAGE], media: [{ type: "image", src: FALLBACK_IMAGE, name: "default" }], imageNames: [], tagHe: "חדש", tagAr: "جديد" }, setDraft)}><ImagePlus className="ml-2 h-4 w-4" /> إضافة سلايد</Button>
            </SettingsSection>

            <SettingsSection title="الأسعار بلغتين">
              {draft.prices.map((p, i) => <div key={i} className="mb-4 rounded-2xl bg-white/5 p-3">
                <Input label="اسم المنتج عبري" value={p.nameHe} onChange={(v) => updateArray("prices", i, "nameHe", v, setDraft)} />
                <Input label="اسم المنتج عربي" value={p.nameAr} onChange={(v) => updateArray("prices", i, "nameAr", v, setDraft)} />
                <Input label="السعر" value={p.price} onChange={(v) => updateArray("prices", i, "price", v, setDraft)} />
                <Input label="الوحدة عبري" value={p.unitHe} onChange={(v) => updateArray("prices", i, "unitHe", v, setDraft)} />
                <Input label="الوحدة عربي" value={p.unitAr} onChange={(v) => updateArray("prices", i, "unitAr", v, setDraft)} />
                <Input label="التغير" value={p.change} onChange={(v) => updateArray("prices", i, "change", v, setDraft)} />
                <label className="mt-2 block text-sm text-white/60">اتجاه السعر</label>
                <select className="mt-1 w-full rounded-xl bg-slate-900 p-3" value={p.direction} onChange={(e) => updateArray("prices", i, "direction", e.target.value, setDraft)}>
                  <option value="up">ارتفاع</option><option value="down">انخفاض</option><option value="flat">ثابت</option>
                </select>
                <Button variant="destructive" className="mt-2 w-full" onClick={() => removeItem("prices", i, setDraft)}><Trash2 className="ml-2 h-4 w-4" /> حذف السعر</Button>
              </div>)}
              <Button className="w-full" onClick={() => addItem("prices", { nameHe: "מוצר חדש", nameAr: "منتج جديد", price: "0", unitHe: "יח׳", unitAr: "قطعة", change: "0", direction: "flat" }, setDraft)}><Plus className="ml-2 h-4 w-4" /> إضافة منتج</Button>
            </SettingsSection>

            <SettingsSection title="العروض وشريط الأخبار بلغتين">
              <Input label="عنوان العرض عبري" value={draft.offerTitleHe} onChange={(v) => updateDraft("offerTitleHe", v)} />
              <Input label="عنوان العرض عربي" value={draft.offerTitleAr} onChange={(v) => updateDraft("offerTitleAr", v)} />
              <Input label="نص العرض عبري" value={draft.offerTextHe} onChange={(v) => updateDraft("offerTextHe", v)} />
              <Input label="نص العرض عربي" value={draft.offerTextAr} onChange={(v) => updateDraft("offerTextAr", v)} />
              <Input label="نسبة الخصم" value={draft.offerPercent} onChange={(v) => updateDraft("offerPercent", v)} />
              <Input label="شريط أخبار Firebase سطر واحد" value={draft.tickerText || ""} onChange={(v) => updateDraft("tickerText", v)} />
              <Textarea label="شريط الأخبار عبري - كل سطر إعلان" value={draft.tickerHe.join(NL)} onChange={(v) => updateDraft("tickerHe", v.split(NL).filter(Boolean))} />
              <Textarea label="شريط الأخبار عربي - كل سطر إعلان" value={draft.tickerAr.join(NL)} onChange={(v) => updateDraft("tickerAr", v.split(NL).filter(Boolean))} />
              <Textarea label="الأكثر طلباً عبري" value={draft.topProductsHe.join(NL)} onChange={(v) => updateDraft("topProductsHe", v.split(NL).filter(Boolean))} />
              <Textarea label="الأكثر طلباً عربي" value={draft.topProductsAr.join(NL)} onChange={(v) => updateDraft("topProductsAr", v.split(NL).filter(Boolean))} />
            </SettingsSection>

            <Button onClick={saveSettings} className="sticky bottom-4 mt-6 h-14 w-full rounded-2xl text-xl font-black " style={{ background: draft.primaryColor, color: "#08111f" }}><Save className="ml-2 h-5 w-5" /> حفظ وتشغيل على الشاشة</Button>
          </aside>
        )}
    </div>
  );
}

function InfoPill({ label, value, color }) {
  return <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-1.5 text-center  min-w-[110px]"><div className="text-[10px] text-white/55">{label}</div><div className="text-sm font-black" style={{ color }}>{value}</div></div>;
}

function SettingsSection({ title, children }) {
  return <section className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4"><h3 className="mb-3 text-xl font-black text-amber-300">{title}</h3>{children}</section>;
}

function Input({ label, value, onChange, type = "text", step }) {
  return <label className="mb-3 block"><span className="mb-1 block text-sm text-white/65">{label}</span><input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 outline-none focus:border-amber-300" /></label>;
}

function Textarea({ label, value, onChange }) {
  return <label className="mb-3 block"><span className="mb-1 block text-sm text-white/65">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 outline-none focus:border-amber-300" /></label>;
}

function MultiImageUploader({ label, onChange }) {
  return <label className="mb-3 block cursor-pointer rounded-xl border border-dashed border-amber-300/40 bg-amber-300/10 p-4 text-center hover:bg-amber-300/15">
    <Upload className="mx-auto mb-2 h-6 w-6 text-amber-300" />
    <span className="text-sm text-white/80">{label}</span>
    <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const media = await Promise.all(files.map(async (file) => ({
        type: file.type.startsWith("video/") ? "video" : "image",
        src: await readFileAsDataUrl(file),
        name: file.name
      })));
      const names = files.map((file) => file.name);
      onChange(media, names);
      e.target.value = "";
    }} />
  </label>;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateArray(key, index, field, value, setDraft) {
  setDraft((d) => ({ ...d, [key]: d[key].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
}

function updateSlideImages(index, media, names, setDraft) {
  const normalizedMedia = (media || []).map((item) => typeof item === "string" ? { type: "image", src: item, name: "image" } : item);
  const first = normalizedMedia[0] || { type: "image", src: FALLBACK_IMAGE, name: "default" };
  setDraft((d) => ({
    ...d,
    heroSlides: d.heroSlides.map((item, i) => i === index ? {
      ...item,
      image: first.src || FALLBACK_IMAGE,
      images: normalizedMedia.filter((m) => m.type === "image").map((m) => m.src),
      media: normalizedMedia.length ? normalizedMedia : [{ type: "image", src: FALLBACK_IMAGE, name: "default" }],
      imageNames: names || normalizedMedia.map((m) => m.name).filter(Boolean)
    } : item)
  }));
}

function addItem(key, item, setDraft) {
  setDraft((d) => ({ ...d, [key]: [...d[key], item] }));
}

function removeItem(key, index, setDraft) {
  setDraft((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
}
