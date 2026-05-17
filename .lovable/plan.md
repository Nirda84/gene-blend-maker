
## סקירה כללית

נוסיף דף נחיתה (`/`) חדש שמציג את המוצר לפני שהמשתמש ניגש לכלי היצירה, נעביר את הכלי הקיים ל-`/create`, ונוסיף מערכת מעקב משתתפים מאוחסנת ב-Lovable Cloud עם דף אדמין מוגן בסיסמה ב-`/admin`.

---

## 1. הפעלת Lovable Cloud

נפעיל את Lovable Cloud כדי לקבל מסד נתונים לאחסון:
- כניסות לדף הנחיתה
- יצירות מוצלחות (כולל מצב: יחיד/משפחה/תאומים והשם שניתן)
- שם אופציונלי שהמשתמש מזין לפני יצירה

---

## 2. סכמת מסד נתונים

שתי טבלאות פשוטות:

**`page_views`** — לכל כניסה לדף הנחיתה
- `id` (uuid)
- `created_at` (timestamp)
- `user_agent` (text, אופציונלי)

**`generations`** — לכל יצירה מוצלחת
- `id` (uuid)
- `created_at` (timestamp)
- `mode` (text: 'solo' | 'family' | 'twins')
- `child_names` (text[])
- `participant_name` (text, אופציונלי — מה שהמשתמש הזין)

RLS: הכנסה פתוחה לכולם (INSERT לכל anon), קריאה רק דרך service role (לדף האדמין).

---

## 3. דף נחיתה חדש (`/`)

קובץ חדש: `src/routes/index.tsx` (נחליף את התוכן הקיים).

מבנה (לפי הבחירה שלך — הירו + הסבר קצר + CTA):

```
[Hero]
- כותרת גדולה: "ראו איך ייראו הילדים שלכם בעתיד"
- תת-כותרת קצרה
- כפתור CTA ראשי → /create
- ויזואל (תמונה לדוגמה / before-after)

[איך זה עובד - 3 שלבים]
1. העלו תמונות הורים
2. בחרו מצב (יחיד/משפחה/תאומים)
3. קבלו תוצאה תוך שניות

[CTA תחתון]
כפתור נוסף → /create
```

בעת טעינת הדף — INSERT אוטומטי לטבלת `page_views` דרך server function.

עיצוב יתאים לטוקנים הקיימים ב-`src/styles.css`.

---

## 4. העברת כלי היצירה ל-`/create`

- ניצור `src/routes/create.tsx` עם התוכן הנוכחי של `src/routes/index.tsx`.
- לפני שלב היצירה — נוסיף שדה אופציונלי "השם שלך" (שמירה ב-localStorage לשימוש חוזר).
- בעת יצירה מוצלחת — INSERT לטבלת `generations` עם המצב, השמות והשם של המשתתף.
- כפתור "חזרה" → `/`.

---

## 5. דף אדמין (`/admin`) מוגן בסיסמה

קובץ חדש: `src/routes/admin.tsx`.

- מסך כניסה עם שדה סיסמה אחד. הסיסמה נשמרת כ-secret ב-Lovable Cloud (`ADMIN_PASSWORD`).
- אימות דרך server function שמשווה לסיסמה ומחזיר flag (לא חושף את הסיסמה ללקוח).
- לאחר אימות — מציג:
  - **סך כניסות לדף** (כולל היום/השבוע/החודש)
  - **סך יצירות** (כולל פילוח לפי מצב)
  - **רשימת יצירות אחרונות** עם תאריך, מצב, שמות וה-participant name
  - גרף פשוט (אופציונלי) של יצירות לפי יום

---

## 6. עדכוני ניווט

- כותרת אתר עם לוגו → לחיצה חוזרת ל-`/`
- ב-`/create`: כפתור חזרה לדף הבית
- `/admin` לא מקושר משום מקום ציבורי (URL ישיר בלבד)

---

## פרטים טכניים

- **Routing**: TanStack Start file-based: `index.tsx` (landing), `create.tsx` (tool), `admin.tsx` (dashboard).
- **Server functions** ב-`src/lib/`:
  - `analytics.functions.ts` — `trackPageView()`, `trackGeneration()` (משתמשים ב-`supabaseAdmin` ל-INSERT)
  - `admin.functions.ts` — `verifyAdminPassword(password)`, `getAdminStats()` (האחרון מוגן ע"י בדיקת token פשוט/session)
- **Secret**: `ADMIN_PASSWORD` ב-Cloud secrets.
- **SEO**: כל route עם `head()` ייחודי (title + description + og).
- **קיים**: לא נשבור את `/api/generate-child` הקיים ולא את הלוגיקה של ה-history המקומית.

---

## מה לא נכלל (אפשר בהמשך)

- ניתוח דמוגרפי מתקדם
- ייצוא CSV
- ניהול משתמשים מרובים לאדמין
- A/B testing
