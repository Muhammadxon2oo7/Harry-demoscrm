# AI AGENT UCHUN PROMPT - XODIMLAR DAVOMAT UI TAKOMILLASHTIRISH

## VAZIFA

Xodimlar davomat kalendari UI'ni kreativ va funksional qilish. Har bir kun uchun ko'p darslar bo'lishi mumkinligini hisobga olgan holda, admin uchun qulay va vizual jihatdan chiroyli interfeys yaratish.

---

## HOZIRGI MUAMMO

✗ Kalendarda faqat nuqtalar ko'rsatiladi (green, red, blue dots)  
✗ Bir kunda bir nechta dars bo'lsa, nuqtalar yetarli emas  
✗ Vizual jihatdan oddiy va ma'lumot berish qobiliyati past  
✗ Admin uchun tez navigatsiya qiyin

---

## TALAB VA MAQSADLAR

### 1. VIZUAL TALAB
- ✅ Har bir kun uchun BARCHA darslarni ko'rsatish
- ✅ Rang kodlash: 
  - **🟢 Yashil** - O'z darsini o'tgan
  - **🔴 Qizil** - Darsga kelmagan  
  - **🔵 Ko'k** - Boshqa xodimning darsini o'rniga o'tgan
- ✅ Bir kunda 3-4 ta dars bo'lsa ham, barchasi ko'rinishi kerak
- ✅ Mobil va desktop uchun responsive

### 2. FUNKSIONAL TALAB
- ✅ Kalendar kunini bosganda - o'sha kunning BARCHA darslari chiqishi kerak
- ✅ Har bir dars uchun: vaqt, guruh nomi, status ko'rsatilishi
- ✅ Filtr qilish: faqat "kelmagan" kunlarni ko'rsatish, faqat "o'rnini bosgan" darslarni ko'rsatish
- ✅ Oylik statistika: jami nechta dars, nechta yo'q qilgan, nechta o'rnini bosgan

### 3. UX TALAB
- ✅ Kalendarda kunni bosish oson bo'lishi kerak
- ✅ Tez navigatsiya: oldingi/keyingi oy
- ✅ Hover effektlari - kun ustiga kelganda tooltip ko'rsatish
- ✅ Animatsiyalar - smooth transitions

```markdown
I need to redesign the staff attendance calendar UI in a Next.js/React/TypeScript 
application with shadcn/ui components.

CURRENT PROBLEM:
- Calendar only shows dots for each day
- Can't see all classes when a staff has multiple classes per day
- Not visually informative enough

REQUIREMENTS:
1. Desktop: Split view with calendar on left, selected day details on right
2. Mobile: Tabs with calendar and list view
3. Each calendar day shows:
   - Number badge with total classes
   - Color-coded breakdown below: 
     - 🟢 Green = attended own class
     - 🔴 Red = absent from class
     - 🔵 Blue = substituted for another teacher
4. Selected day panel shows all classes with:
   - Time, group name, status badge
   - If absent: who substituted
   - If substituted: whose class they covered
5. Monthly stats at top:
   - Total attended, total absent, total substitutions
6. Filters: show all / only absences / only substitutions
7. Smooth animations and hover effects

EXAMPLE DATA STRUCTURE:
```typescript
interface ClassSession {
  id: string;
  staffId: string;
  staffName: string;
  groupName: string;
  date: string;
  time: string;
  status: "attended" | "absent" | "replaced";
  replacedBy?: string;
  replacedByName?: string;
}
```

DESIGN INSPIRATION:
- Google Calendar's clean day view
- GitHub's contribution graph for monthly overview
- Notion's calendar with rich tooltips

TECH STACK:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui (Dialog, Card, Badge, Calendar, Tabs)
- lucide-react icons
- date-fns for date handling

DELIVERABLE:
A complete, production-ready React component that is:
- Fully responsive (mobile-first)
- Accessible (keyboard navigation, ARIA labels)
- Performant (memoization for large datasets)
- Beautiful (smooth animations, professional colors)

Please provide the complete code with all necessary subcomponents.
```

---

## QOSHIMCHA FEATURES (OPTIONAL)

### 1. Export to PDF/Excel
```tsx
<Button onClick={exportToExcel}>
  📊 Excel yuklash
</Button>
```

### 2. Print View
```tsx
<Button onClick={handlePrint}>
  🖨️ Print
</Button>
```

### 3. Quick Stats Cards
```tsx
┌──────────────────┐
│  ENG YAXSHi OY   │
│  Yanvar 2026     │
│  95% davomat     │
└──────────────────┘

┌──────────────────┐
│  ENG YOMON OY    │
│  Dekabr 2025     │
│  78% davomat     │
└──────────────────┘
```

### 4. Trend Chart
```tsx
<LineChart data={monthlyAttendance} />
```

---

## NATIJA

Yuqoridagi **HYBRID APPROACH** yechimi:
✅ Professional ko'rinish  
✅ Barcha ma'lumotlarni ko'rsatadi  
✅ Mobile va desktop responsive  
✅ Admin uchun qulay navigatsiya  
✅ Vizual jihatdan boy va ma'lumot beruvchi  

Bu yechim bilan admin:
- Bir qarashda oylik holatni ko'radi
- Muammoli kunlarni darhol aniqlaydi
- Har bir kunning tafsilotini oson tekshiradi
- Mobilda ham qulay foydalanadi

---

**AI Agent uchun oxirgi tavsiya:**
Bu promptni AI'ga berganingizda, to'liq kod bilan birga component yaratadi. 
Kod tayyor bo'lgandan keyin, styling va animatsiyalarni o'zingiz istagan 
ranglar bilan customize qilishingiz mumkin.
