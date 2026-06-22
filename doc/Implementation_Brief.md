# Engineering Implementation & Technical Blueprint (Fighter Styles Edition)

## 1. Directory Structure Blueprint
Ensure all tactical asset dependencies are localized. External fetch calls are strictly prohibited.

boxing-countdown-pwa/
├── assets/
│   ├── bell.mp3            # Native round bell trigger
│   ├── countdown.mp3       # Final 10-second warning tick
│   ├── minute.mp3          # 60-second structural interval notifier
│   └── icon.png            # PWA Home screen installation asset
├── doc/
│   ├── PRD.md
│   ├── design.md
│   └── Implementation_Brief.md
├── index.html              # Core layout unified with Tailwind CSS CDN
├── style.css               # Dynamic root color states & glassmorphic system
├── script.js               # Synchronous state machine & operational code
├── manifest.json           # Native standalone app environment flags
└── sw.js                   # Service Worker handling aggressive local caching

## 2. Core Data Models & Routine Specifications
The training engine utilizes strict deterministic mapping. Random interval processing algorithms are discarded.

const FIGHTER_ROUTINES = {
  TYSON: {
    name: "Mike Tyson",
    roundFocus: [
      "חימום מובנה לשמירת טווח ומציאת מרחק",
      "כניסה לטווח ושינוי גובה",
      "דגש אפרקטים (Peek-a-boo Style)",
      "לחץ והתחמקות מתוזמנת",
      "עבודה גוף-ראש ועוצמה מתפרצת",
      "שיא העומס (Volume Power)",
      "סיבוב אליפות (עייפות קיצונית וכוח רצון)"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בלבד לשמירת טווח" },
      { combo: "2", desc: "קרוס בלבד למציאת מרחק" },
      { combo: "1-2", desc: "שילוב בסיסי" },
      { combo: "1 ▲ 1", desc: "ג'אב, ירידה להגנה, ג'אב" },
      { combo: "1-2-7-2", desc: "סגירת החימום עם כניסה ראשונה" },
      { combo: "1 ▲ 3", desc: "ג'אב, ירידה (Slip), הוק שמאלי חזק" },
      { combo: "2-4", desc: "קרוס, הוק ימני עוצמתי" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאלה, ג'אב-קרוס מהיר" },
      { combo: "1-2 ▲ 3", desc: "ג'אב-קרוס, ירידה, הוק שמאלי לגוף/ראש" },
      { combo: "3-4-3-4", desc: "רצף הוקים קרוב ומהיר" },
      { combo: "1-7-3", desc: "ג'אב, אפרקט ימני, הוק שמאלי (קלאסי טייסון)" },
      { combo: "2-7-4", desc: "קרוס, אפרקט שמאלי, הוק ימני" },
      { combo: "1 ▲ 1-2-7-2", desc: "ג'אב, ירידה, ג'אב-קרוס-אפרקט-קרוס" },
      { combo: "1-2-7-4-2", desc: "קומבינציית כוח מתגלגלת" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות בטווח אפס" },
      { combo: "1 ► 2-2", desc: "צעד ימינה, קרוס כפול" },
      { combo: "1 ▲ 3-3", desc: "ג'אב, ירידה, הוק שמאלי כפול (גוף-ראש)" },
      { combo: "2 ▲ 4-4", desc: "קרוס, ירידה, הוק ימני כפול" },
      { combo: "1-2-7-3", desc: "ג'אב-קרוס, אפרקט, הוק מסיים" },
      { combo: "1-3-7-3", desc: "רצף כוח שמאלי-ימני לסירוגין" },
      { combo: "2-4-7-2-4", desc: "רצף כוח ארוך להרס הגנות" },
      { combo: "1 ▲ 1", desc: "הטעיה למטה, כניסה WITH ג'אב" },
      { combo: "1-2-3-7-2", desc: "קומבינציה שלמה מטווח בינוני לקרוב" },
      { combo: "1-2-7-2", desc: "פיניש מהיר" },
      { combo: "3-4-3-4", desc: "רצף כוח מתיש" },
      { combo: "1-2-1-2-1-2", desc: "מטר ג'אב-קרוס רציף להסחת דעת" },
      { combo: "1-2-7-4-2", desc: "מעבר מיידי למכות כוח" },
      { combo: "1-3-7-3", desc: "לחץ מתמיד" },
      { combo: "2-4-7-4", desc: "סיומת חזקה WITH הוק ימני" },
      { combo: "1 ▲ 3-3", desc: "כניסה מתחת למכות של היריב" },
      { combo: "1-2-3", desc: "קומבינציה קלאסית ויציבה" },
      { combo: "1-7-3", desc: "כניסה אחרונה לאפרקט-הוק" },
      { combo: "2-4-7-2-4", desc: "פירוק הגנות אחרון" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועה ועוצמה משולבים" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: התפוצצות מהירות וכוח עד הבאזר" }
    ]
  },
  MAYWEATHER: {
    name: "Floyd Mayweather",
    roundFocus: [
      "חימום מובנה - שילוב ישרים ותנועה בסיסית",
      "מהירות ותנועה היקפית",
      "קומבינציות ארוכות ומטעות",
      "הגנה חכמה והתקפות נגד (Counter-Punching)",
      "שליטה בקצב (Ring Generalship)",
      "נפח ועייפות מנטלית",
      "סיבוב הגנה מוחלטת ויציאה קדימה"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בודד מהיר (Flicker Jab)" },
      { combo: "2", desc: "קרוס מהיר לטווח ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1 ► 2-4", desc: "תנועה הצידה ויציאה עם קומבינציה" },
      { combo: "1 ◄ 1-2", desc: "צעד שמאלה עם ג'אב כפול וקרוס" },
      { combo: "1-1-2", desc: "ג'אב כפול מהיר, קרוס ישיר" },
      { combo: "1 ► 2-2", desc: "צעד ימינה, קרוס מהיר כפול לטווח" },
      { combo: "1-2 ► 4", desc: "ג'אב-קרוס, צעד ימינה, הוק חטוף" },
      { combo: "1-2-3", desc: "שלשה קלאסית ומהירה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד ימינה, ג'אב-הוק מהיר" },
      { combo: "1-2-1-2-1-2", desc: "שש מכות ישרות ומהירות (עבודת נפח)" },
      { combo: "1-2-3-7-2", desc: "קומבינציה ארוכה: ישרים, הוק, אפרקט, קרוס מסיים" },
      { combo: "1 ◄ 1-2", desc: "תנועת רגליים מתמדת שמאלה" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט מהיר, הוק מציק" },
      { combo: "2-4-7-4", desc: "מענה מהיר מהיד האחורית" },
      { combo: "1 ▲ 1", desc: "ג'אב, התחמקות לאחור/למטה, ג'אב חוזר" },
      { combo: "1-2 ▲ 3", desc: "ישרים, משיכת גוף לאחור (Pull), הוק שמאלי מהיר" },
      { combo: "2-4-7-2-4", desc: "רצף מכות קלות ומהירות להצפת היריב" },
      { combo: "1 ► 2-4", desc: "יציאה מהקו, קרוס, הוק ימני" },
      { combo: "1-1-2", desc: "חזרה לג'אב כפול וקרוס" },
      { combo: "1-3-7-3", desc: "קומבינציה משתנה: ג'אב, הוק, אפרקט, הוק" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, יציאה WITH ג'אב-הוק" },
      { combo: "1-2-7-4-2", desc: "קומבינציה ארוכה ומורכבת לחיתוך זוויות" },
      { combo: "1 ▲ 1-2-7-2", desc: "תנועת ראש מרובה תוך כדי התקפה" },
      { combo: "3-4-3-4-3-4", desc: "רצף מכות קלות ומהירות לגוף ולראש" },
      { combo: "1-2-1-2-1-2", desc: "שמירה על ידיים עסוקות ללא הפסקה" },
      { combo: "1-2 ► 4", desc: "ג'אב קרוס ויציאה מהזווית של היריב" },
      { combo: "1-2-3-7-2", desc: "החלפת הילוכים לקומבינציה ארוכה" },
      { combo: "1 ◄ 1-2", desc: "הגנה דרך תנועת רגליים" },
      { combo: "2-4", desc: "קרוס-הוק חטופים ומהירים" },
      { combo: "1 ▲ 1", desc: "ניהול מרחק פסיבי-אקטיבי" },
      { combo: "1-2-7-2", desc: "ארבע מכות ישרות ומהירות למרכז" },
      { combo: "2-4-7-2-4", desc: "שבירת קצב אחרונה" },
      { combo: "1 ► 2-4", desc: "צעד אחרון החוצה מהטווח" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט מהירות מוחלט וקל עד הבאזר" }
    ]
  },
  ALI: {
    name: "Muhammad Ali",
    roundFocus: [
      "חימום מובנה - עבודת ישרים וניהול טווח ארוך",
      "ריקוד זירה ותנועה היקפית (The Ali Shuffle)",
      "שינוי קצב וג'אב מציק (The Flicker Jab)",
      "לחימה בנסיגה (Fighting on the Backfoot)",
      "התקפות מתפרצות (Showboating & Speed)",
      "לחץ בסיבובים המאוחרים",
      "סיבוב אליפות (עייפות ומהירות מנטלית)"
    ],
    plan: [
      { combo: "1", desc: "ג'אב בודד מהיר (Flicker)" },
      { combo: "2", desc: "קרוס ישיר ארוך" },
      { combo: "1-2", desc: "שילוב ישרים בסיסי" },
      { combo: "1-1-2", desc: "ג'אב כפול וקרוס" },
      { combo: "1 ▲ 1", desc: "ג'אב, הטיית ראש לאחור, ג'אב חוזר" },
      { combo: "1 ◄ 1-2", desc: "ג'אב, צעד שמאלה, ג'אב-קרוס מהיר" },
      { combo: "1 ► 2-2", desc: "ג'אב, צעד ימינה, קרוס כפול לטווח" },
      { combo: "1-2-1-2", desc: "ארבע מכות ישרות ומהירות מהמקום" },
      { combo: "1-2 ► 4", desc: "ישרים, צעד ימינה ויציאה עם הוק חטוף" },
      { combo: "3-4-3-4", desc: "רצף הוקים מהיר בגובה הראש" },
      { combo: "1-1-1", desc: "ג'אב משולש מהיר להסחת דעת ומרחק" },
      { combo: "1-2-3", desc: "שלשה קלאסית וחלקה" },
      { combo: "2-4-7-4", desc: "מעבר מהיר למכות כוח מטווח ארוך" },
      { combo: "1 ▲ 1-2-7-2", desc: "ג'אב, הטיית גוף, קומבינציה זורמת" },
      { combo: "1-2-1-2-1-2", desc: "ספרינט מכות ישרות (נפח גבוה)" },
      { combo: "1 ▲ 1", desc: "משיכת הראש לאחור (Lean back) וג'אב תוך כדי צעד אחורה" },
      { combo: "2 ► 1-3", desc: "קרוס, צעד הצידה, ג'אב-הוק מהיר" },
      { combo: "1-2-7-3", desc: "ישרים, אפרקט מפתיע, הוק מסיים" },
      { combo: "1 ◄ 1-2", desc: "תנועה שמאלה לשבירת קו ההתקפה" },
      { combo: "1-3-7-3", desc: "שילוב ידיים מהיר ומורכב" },
      { combo: "1-2-1-2-1-2", desc: "מטר מכות מהירות לפנים" },
      { combo: "2-4", desc: "קרוס והוק מהיר ויציאה החוצה" },
      { combo: "1-2-3-7-2", desc: "קומבינציה שלמה שמתחילה מרחוק ומסתיימת קרוב" },
      { combo: "1 ► 2-4", desc: "צעד ימינה, קרוס, הוק ימני" },
      { combo: "3-4-3-4-3-4", desc: "התפוצצות הוקים קצרים" },
      { combo: "1-1-2", desc: "חזרה לבסיס: ג'אב כפול אגרסיבי וקרוס" },
      { combo: "1-2-7-4-2", desc: "רצף מכות ארוך שיוצר לחץ מנטלי" },
      { combo: "1 ▲ 3", desc: "ג'אב, חמיקה הצידה, הוק שמאלי מהיר" },
      { combo: "2-4-7-2-4", desc: "חילופי מהלכים מהירים" },
      { combo: "1 ◄ 1-2", desc: "יציאה מהירה מהטווח של היריב" },
      { combo: "1-1-1", desc: "שימוש בג'אב כדי להחזיק את המרחק" },
      { combo: "1-2-3", desc: "קומבינציה נקייה וחדה" },
      { combo: "1-2-7-2", desc: "ארבע מכות מהירות למרכז" },
      { combo: "1 ► 2-4", desc: "צעד אחרון הצידה ושילוב מכות נגד" },
      { combo: "1-2-1-2-1-2", desc: "דקה אחרונה: ספרינט ישרים מוחלט עד הבאזר האחרון" }
    ]
  }
};

## 3. Layout & UI Component Architecture Spec
The active screen viewport targets id `currentPattern` inside index.html for injecting compiled HTML rows.