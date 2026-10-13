// Fixed order: five minutes per stage, building skills across seven rounds.
// All contact drills target the reflex ball; the sole uppercut is optional shadowboxing.
const FIGHTER_ROUTINES = {
  TYSON: {
    name: 'Mike Tyson',
    roundFocus: [
      'בסיס רגוע: ישרים קצרים וחזרה להגנה',
      'הוספת הוקים קצרים במגע קל',
      'חמיקה והתקפת נגד מטווח קרוב',
      'שינוי זווית וכניסה עם הוק',
      'חיבור ארבע מכות והגנה בסיום',
      'לחץ מבוקר: חמיקה ורצף משולב',
      'שילוב מלא: תנועת ראש, זוויות וקצב'
    ],
    plan: [
      // Round 1 — one punch, then short straight combinations. Stay relaxed.
      { combo: '1', desc: "ג'אב רגוע; חזרה להגנה אחרי כל מכה" },
      { combo: '2', desc: 'קרוס קל ומדויק; איפוס בין המכות' },
      { combo: '1-1', desc: "ג'אב כפול בקצב רגוע" },
      { combo: '1-2', desc: "ג'אב וקרוס קצרים; בלי למהר" },
      { combo: '1-1-2', desc: "ג'אב כפול וקרוס; מגע קל" },
      // Round 2 — introduce compact hooks, without body targets.
      { combo: '2-3', desc: 'קרוס והוק שמאל קצר לכדור' },
      { combo: '1-3', desc: "ג'אב והוק שמאל; מרפקים קרובים" },
      { combo: '1-2-3', desc: "ג'אב, קרוס והוק שמאל קצר" },
      { combo: '1-2-4', desc: "ג'אב, קרוס והוק ימין קצר" },
      { combo: '1-3-2', desc: "ג'אב, הוק שמאל וקרוס; חזרה להגנה" },
      // Round 3 — head movement before the counter.
      { combo: '1 ▲ 2', desc: "ג'אב, חמיקה קטנה וקרוס" },
      { combo: '1-2 ▲ 3', desc: 'ישרים, חמיקה והוק שמאל קצר' },
      { combo: '1 ▲ 3-2', desc: "ג'אב, חמיקה, הוק שמאל וקרוס" },
      { combo: '2 ▲ 3-2', desc: 'קרוס, חמיקה, הוק שמאל וקרוס חוזר' },
      { combo: '1-3 ▲ 2', desc: "ג'אב והוק שמאל, חמיקה וקרוס" },
      // Round 4 — small angle changes; never chase the moving ball.
      { combo: '1 ◄ 2-3', desc: "ג'אב, צעד קטן שמאלה, קרוס והוק שמאל" },
      { combo: '1 ► 2-4', desc: "ג'אב, צעד קטן ימינה, קרוס והוק ימין" },
      { combo: '1-2 ◄ 3-2', desc: 'ישרים, צעד שמאלה, הוק שמאל וקרוס' },
      { combo: '1-2 ► 4-3', desc: 'ישרים, צעד ימינה ושני הוקים קצרים' },
      { combo: '1-3-2 ◄ 3', desc: "ג'אב, הוק, קרוס; צעד שמאלה והוק" },
      // Round 5 — four-punch chains and a defensive finish.
      { combo: '1-2-3-2 ▲', desc: 'ישרים, הוק שמאל, קרוס וחמיקה בסיום' },
      { combo: '1-3-2-3 ▲', desc: "ג'אב, הוק, קרוס, הוק וחמיקה בסיום" },
      { combo: '1-2-5-2', desc: 'ישרים, אפרקט שמאל באוויר, קרוס; אפשר 3 במקום 5' },
      { combo: '1-2-3-4 ▲', desc: 'ישרים ושני הוקים קצרים; חמיקה בסיום' },
      { combo: '2-3-2-3 ▲', desc: 'קרוס והוק לסירוגין; חמיקה וחזרה להגנה' },
      // Round 6 — link pressure with movement, keeping contact controlled.
      { combo: '1 ▲ 2-3-2', desc: "ג'אב, חמיקה, קרוס־הוק־קרוס" },
      { combo: '1-2 ▲ 3-2-3', desc: 'ישרים, חמיקה, הוק־קרוס־הוק' },
      { combo: '1 ◄ 2-3-2-3', desc: "ג'אב, צעד שמאלה, קרוס־הוק פעמיים" },
      { combo: '1-3 ▲ 2-3-2', desc: "ג'אב והוק, חמיקה, קרוס־הוק־קרוס" },
      { combo: '1-2-3 ▲ 2-3', desc: 'ישרים והוק, חמיקה, קרוס והוק חוזר' },
      // Round 7 — complete chains. Speed only while the technique stays clean.
      { combo: '1-2-3-2-3', desc: 'ישרים, הוק־קרוס־הוק; לחץ בקצב מבוקר' },
      { combo: '1 ▲ 2-3-2-3-2', desc: "ג'אב וחמיקה; רצף קרוס והוקים קצרים" },
      { combo: '1-2 ◄ 3-2-3-2', desc: 'ישרים, צעד שמאלה, הוק־קרוס פעמיים' },
      { combo: '1-2-3 ▲ 2-3-2', desc: 'שלוש מכות, חמיקה, קרוס־הוק־קרוס' },
      { combo: '1-2-3-2-3-2', desc: 'רצף סיום קצר ומדויק; מגע קל עד הפעמון' }
    ]
  },
  MAYWEATHER: {
    name: 'Floyd Mayweather',
    roundFocus: [
      'בסיס רגוע: דיוק וחזרה להגנה',
      'משיכת ראש והחזרת מכה בודדת',
      'הגנה לפני רצף התקפת נגד קצר',
      'התקפת נגד ויציאה בזווית',
      'חיבור ארבע מכות אחרי התחמקות',
      'דיוק בתנועה: רצף והחלפת זווית',
      'שליטה מלאה: הגנה, תגובה ויציאה'
    ],
    plan: [
      // Round 1 — place each punch and reset the guard.
      { combo: '1', desc: "ג'אב רגוע; חזרה להגנה אחרי כל מכה" },
      { combo: '2', desc: 'קרוס מדויק; איפוס מלא בין המכות' },
      { combo: '1-2', desc: "ג'אב וקרוס קלים; הגנה בסיום" },
      { combo: '1-1', desc: "ג'אב כפול; לא לרדוף אחרי הכדור" },
      { combo: '2-1', desc: "קרוס וג'אב; שליטה במרחק" },
      // Round 2 — simulated defense, followed by one or two punches.
      { combo: '1 ▲ 2', desc: "ג'אב, משיכת ראש קטנה וקרוס נגד" },
      { combo: '1 ▲ 1', desc: "ג'אב, משיכה לאחור וג'אב חוזר" },
      { combo: '2 ▲ 2', desc: 'קרוס, התחמקות לאחור וקרוס חוזר' },
      { combo: '1-2 ▲', desc: 'ישרים ויציאה עם הראש מקו ההתקפה' },
      { combo: '2-1 ▲', desc: "קרוס וג'אב; משיכה לאחור בסיום" },
      // Round 3 — lengthen the counter without sacrificing the reset.
      { combo: '1 ▲ 2-1', desc: "ג'אב, משיכה, קרוס וג'אב חוזר" },
      { combo: '1 ▲ 2-3', desc: "ג'אב, משיכה, קרוס והוק שמאל" },
      { combo: '1-2 ▲ 2', desc: 'ישרים, התחמקות וקרוס נגד מדויק' },
      { combo: '2 ▲ 1-2', desc: "קרוס, התחמקות וג'אב־קרוס" },
      { combo: '1-1 ▲ 2', desc: "ג'אב כפול, משיכה לאחור וקרוס" },
      // Round 4 — counter from a small lateral angle.
      { combo: '1 ◄ 2-1', desc: "ג'אב, צעד שמאלה, קרוס וג'אב" },
      { combo: '1 ► 2-3', desc: "ג'אב, צעד ימינה, קרוס והוק שמאל" },
      { combo: '1-2 ► 1', desc: "ישרים, יציאה ימינה וג'אב לשמירת טווח" },
      { combo: '2 ◄ 1-2', desc: "קרוס, יציאה שמאלה וג'אב־קרוס" },
      { combo: '1-1 ► 2', desc: "ג'אב כפול, צעד ימינה וקרוס מזווית" },
      // Round 5 — four precise punches, with defense integrated.
      { combo: '1 ▲ 2-3-2', desc: "ג'אב ומשיכה; קרוס־הוק־קרוס מדויק" },
      { combo: '1-2 ▲ 3-2', desc: 'ישרים, התחמקות, הוק שמאל וקרוס' },
      { combo: '1-1 ▲ 2-1', desc: "ג'אב כפול, משיכה, קרוס וג'אב" },
      { combo: '2 ▲ 1-2-3', desc: "קרוס, התחמקות, ג'אב־קרוס־הוק" },
      { combo: '1 ► 2-1-2', desc: "ג'אב וצעד ימינה; קרוס־ג'אב־קרוס" },
      // Round 6 — longer counters, still separated by deliberate resets.
      { combo: '1-2 ▲ 2-3-2', desc: 'ישרים ומשיכה; קרוס־הוק־קרוס נגד' },
      { combo: '1 ▲ 2-1-2-3', desc: "ג'אב, משיכה וארבע מכות נגד מדויקות" },
      { combo: '1-1 ► 2-3-2', desc: "ג'אב כפול, צעד ימינה, קרוס־הוק־קרוס" },
      { combo: '2 ◄ 1-2-3-2', desc: 'קרוס וצעד שמאלה; רצף ישרים והוק' },
      { combo: '1-2 ► 1-2-3', desc: 'ישרים, יציאה ימינה ושלשה מדויקת' },
      // Round 7 — combine defensive timing, counters and angle changes.
      { combo: '1 ▲ 2-3-2-1', desc: "ג'אב ומשיכה; רצף נגד וסיום בג'אב" },
      { combo: '1-1 ▲ 2-3-2', desc: "ג'אב כפול, משיכה, קרוס־הוק־קרוס" },
      { combo: '1-2 ▲ 3-2-1', desc: "ישרים, התחמקות, הוק־קרוס־ג'אב" },
      { combo: '1 ► 2-1-2-3-2', desc: "ג'אב וצעד ימינה; רצף נגד של חמש מכות" },
      { combo: '1-2 ◄ 1-2-3-2', desc: 'ישרים, יציאה שמאלה ורצף סיום מדויק' }
    ]
  },
  ALI: {
    name: 'Muhammad Ali',
    roundFocus: [
      "בסיס רגוע: ג'אב וניהול מרחק",
      "ג'אב עם תנועת רגליים קלה",
      'שלוש מכות תוך שינוי זווית',
      'הארכת רצף ישרים ושינוי קצב',
      'ארבע מכות עם יציאה בתנועה',
      "ג'אבים חוזרים ורצפים מהירים בתנועה",
      'שילוב מלא: ישרים, זוויות ומהירות'
    ],
    plan: [
      // Round 1 — loose shoulders, light jabs, then short straights.
      { combo: '1', desc: "ג'אב קל ורגוע; כתפיים משוחררות" },
      { combo: '1-1', desc: "ג'אב כפול קל; איפוס בין הרצפים" },
      { combo: '1-2', desc: "ג'אב וקרוס ארוכים במגע קל" },
      { combo: '2-1', desc: "קרוס וג'אב; שמירת מרחק מהכדור" },
      { combo: '1-1-2', desc: "ג'אב כפול וקרוס; עדיין בקצב רגוע" },
      // Round 2 — introduce small lateral steps, with short punches.
      { combo: '1 ◄ 1', desc: "ג'אב, צעד קטן שמאלה וג'אב חוזר" },
      { combo: '1 ► 1', desc: "ג'אב, צעד קטן ימינה וג'אב חוזר" },
      { combo: '1 ◄ 2', desc: "ג'אב, צעד שמאלה וקרוס מזווית" },
      { combo: '1 ► 2', desc: "ג'אב, צעד ימינה וקרוס קל" },
      { combo: '1-2 ◄', desc: 'ישרים ויציאה קטנה שמאלה' },
      // Round 3 — three-punch entries and exits.
      { combo: '1-1 ◄ 2', desc: "ג'אב כפול, צעד שמאלה וקרוס" },
      { combo: '1-1 ► 2', desc: "ג'אב כפול, צעד ימינה וקרוס" },
      { combo: '1 ◄ 1-2', desc: "ג'אב, צעד שמאלה וג'אב־קרוס" },
      { combo: '1 ► 1-2', desc: "ג'אב, צעד ימינה וג'אב־קרוס" },
      { combo: '1-2 ► 1', desc: "ישרים, צעד ימינה וג'אב לשמירת טווח" },
      // Round 4 — four-punch straight chains; vary rhythm, not impact.
      { combo: '1-2-1-2', desc: 'ארבע מכות ישרות; קצב זורם ומגע קל' },
      { combo: '1-1-2-1', desc: "ג'אב כפול, קרוס וג'אב ביציאה" },
      { combo: '1-2-1-1', desc: "ג'אב־קרוס וג'אב כפול; שינוי קצב" },
      { combo: '1-1-1-2', desc: "שלושה ג'אבים וקרוס; בלי להקשיח כתפיים" },
      { combo: '1-1-2-2', desc: "ג'אב כפול וקרוס כפול; איפוס בסיום" },
      // Round 5 — link the longer straights to footwork.
      { combo: '1 ◄ 1-2-1', desc: "ג'אב וצעד שמאלה; ג'אב־קרוס־ג'אב" },
      { combo: '1 ► 1-1-2', desc: "ג'אב וצעד ימינה; ג'אב כפול וקרוס" },
      { combo: '1-1 ◄ 2-1', desc: "ג'אב כפול, צעד שמאלה, קרוס וג'אב" },
      { combo: '1-2 ► 1-2', desc: "ג'אב־קרוס, צעד ימינה וג'אב־קרוס חוזר" },
      { combo: '1-1-2 ◄ 1', desc: "ג'אב כפול וקרוס; צעד שמאלה וג'אב" },
      // Round 6 — five punches, with smooth changes of rhythm and angle.
      { combo: '1-1-2-1-2', desc: "ג'אב כפול, קרוס וג'אב־קרוס; קצב עולה" },
      { combo: '1-2-1-1-2', desc: "ג'אב־קרוס, ג'אב כפול וקרוס מסיים" },
      { combo: '1-1-1-2-1', desc: "שלושה ג'אבים, קרוס וג'אב ביציאה" },
      { combo: '1 ◄ 1-2-1-2', desc: "ג'אב, צעד שמאלה ושני צמדי ישרים" },
      { combo: '1-2 ► 1-1-2', desc: "ישרים, צעד ימינה, ג'אב כפול וקרוס" },
      // Round 7 — light flurries with footwork, rather than power hooks.
      { combo: '1-1-2 ◄ 1-2', desc: "ג'אב כפול וקרוס; צעד שמאלה וישרים" },
      { combo: '1 ◄ 1-2-1-1-2', desc: "ג'אב וצעד שמאלה; רצף ישרים מהיר וקל" },
      { combo: '1-1 ► 2-1-1-2', desc: "ג'אב כפול וצעד ימינה; רצף ישרים קל" },
      { combo: '1-1-2-1-1-2', desc: "ג'אב כפול וקרוס פעמיים; תנועה בין הרצפים" },
      { combo: '1-2-1-2-1-2', desc: 'שישה ישרים קלים; מהירות ודיוק עד הפעמון' }
    ]
  }
};

// Extra rounds alternate the two advanced stages, never restart the opening drills.
function getRoutineRoundIndex(round) {
  return round <= 7 ? Math.max(0, round - 1) : 5 + (round - 8) % 2;
}
function getRoutineDrill(routine, round, minute = 0) {
  return routine.plan[getRoutineRoundIndex(round) * 5 + minute];
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FIGHTER_ROUTINES, getRoutineRoundIndex, getRoutineDrill };
}
