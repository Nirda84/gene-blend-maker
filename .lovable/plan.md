# תוכנית: צילומי מסך + סרטון Demo

## חלק 1 — צילומי מסך מקצועיים (ל-README)

אנווט באפליקציה ואצלם desktop + mobile של המסכים העיקריים:
- דף הבית
- מסך Create (ריק)
- מסך Create עם 2 התמונות שהעלית (Subject + Style)
- מסך תוצאה
- Lightbox במסך מלא
- גלריית היסטוריה

כל צילום ייעטף ב-mockup macOS עם רקע gradient (preset `aurora` — מתאים ל-AI יצירתי).
פלט: `/mnt/documents/screenshots/01-hero.png`, `02-create.png` וכו'.

## חלק 2 — סרטון Demo (~22 שניות MP4, 1920x1080)

נבנה ב-Remotion. אשתמש ב-**2 התמונות שהעלית** כדמויות בסצנת ה-Upload, וגם בצילומי מסך מחלק 1.

**Storyboard:**

| זמן | סצנה | תוכן |
|-----|------|------|
| 0-3 שנ׳ | Title | שם האפליקציה + tagline ("Blend any two characters with AI") |
| 3-8 שנ׳ | Upload | 2 התמונות שלך נכנסות עם תוויות "Subject" + "Style" |
| 8-13 שנ׳ | Generate | progress bar + reveal של תמונת תוצאה (screenshot מחלק 1) |
| 13-18 שנ׳ | Features | 3 פיצ׳רים: Lightbox · History · One-click share |
| 18-22 שנ׳ | CTA | לוגו + URL: gene-blend-maker.lovable.app |

**כיוון ויזואלי:**
- רקע כהה `#0a0a1a` + accent indigo `#6366f1`
- טיפוגרפיה: Space Grotesk (כותרות) + Inter (גוף)
- אנימציות spring חלקות, transitions של slide/fade
- ללא מוזיקה (תוכל להוסיף בעריכה חיצונית אם תרצה)

פלט: `/mnt/documents/demo.mp4`

## הערות
- לא נוגע בקוד האפליקציה — רק יוצר חומרים חיצוניים.
- כל הקבצים יוצגו כ-artifacts להורדה.
- סדר ביצוע: צילומי מסך → סרטון (משתמש בצילומים בתוכו).
