
"use client"
import { analyzeOffer, AnalysisOutput } from "@/lib/analyzer"
import Tesseract from "tesseract.js"
import { useEffect, useRef, useState } from "react"
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  AlertTriangle,
  BarChart3,
  BookOpen,
  TrendingUp,
  Percent,
  AlertCircle,
  Eye,
  Loader2,
  Timer,
  ChevronDown,
  Trash2,
  ArrowRight,
  GraduationCap,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Globe,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"

/* ───────────────────────────── TRANSLATIONS ──────────────────────────────── */

type Lang = "ru" | "en" | "kz"

const T = {
  ru: {
    tagline: "Умный выбор",
    nav: {
      dashboard: "Дашборд",
      analysis: "Анализ предложений",
      triggers: "Детектор триггеров",
      radar: "Ценовой радар",
      history: "История",
      learning: "Learning Hub",
    },
    sidebar: {
      checkedToday: "Проверено сегодня",
      live: "live",
    },
    dashboard: {
      greeting: "Привет, Аналитик!",
      subtitle: "Делаем рациональный выбор сегодня — с математикой, не с эмоциями.",
      inputLabel: "Вставьте URL страницы продаж или описание продукта",
      inputPlaceholder: "https://example.com/sales или вставьте текст...",
      analyzeBtn: "Анализ за 3 мин",
      poweredBy: "Использует CVF · IMP · Байесовскую модель качества",
      recentTitle: "Последние анализы",
      seeAll: "Все",
    },
    market: [
      { value: "$3.2B", label: "Региональный рынок инфоцыганства" },
      { value: "15–40%", label: "Потенциальная экономия на пользователя/год" },
      { value: "60%", label: "Онлайн-курсов не дают обещанных результатов" },
      { value: "34%", label: "Пользователей проверяют отзывы перед покупкой" },
    ],
    risk: { safe: "Безопасно", moderate: "Умеренный риск", critical: "Критический риск" },
    dates: { hoursAgo: "2 часа назад", yesterday: "Вчера", daysAgo: "3 дня назад" },
    analysis: {
      label: "Анализ предложения",
      price: "₽149,000 · Financial coaching / Саморазвитие",
      tab: { cvf: "CVF", imp: "IMP", bayes: "Байесовский" },
      cvfFormula: "CVF = w₁·Q(q) - w₂·P(p) - w₃·R(r) - w₄·A(a)",
      cvfNegative: "Отрицательный CVF = предложение уничтожает ценность",
      impFormula: "IMP = Σ αᵢ · Tᵢ · (1 + γ · Cᵢ)",
      impPressure: "Критическое давление",
      impSynergy: "Коэффициент синергии γ = 1.34 — триггеры усиливают друг друга",
      bayesFormula: "P(Quality=High | evidence) = P(e|H)·P(H) / P(e)",
      bayesPosterior: "Апостериорная вероятность высокого качества:",
      bayesRec: "Рекомендация: Не покупать",
      bayesAlt: "Найдена лучшая альтернатива",
      idpLabel: "Критический риск — высокая вероятность манипулятивного предложения",
      idpFormula: "IDP = 100 · σ(CVF · (1 - IMP/10) · B(q))",
    },
    loading: [
      "Парсинг структуры предложения...",
      "Вычисление CVF...",
      "Сканирование IMP...",
      "Байесовское обновление...",
      "Готово.",
    ],
    triggers: {
      title: "Детектор триггеров",
      subtitle: "Психологические паттерны манипуляции, найденные в анализируемом предложении",
      summary: "6 триггеров обнаружено · Давление: Критическое · Уверенность: 94%",
    },
    radar: {
      title: "Ценовой радар",
      subtitle: "Где это предложение находится в рыночном распределении?",
      median: "Медиана рынка",
      productPrice: "Цена продукта",
      zscore: "Z-оценка",
      percentile: "Перцентиль",
      percentileValue: "Топ 0.07% самых дорогих",
      anomaly: "ОБНАРУЖЕНА ЦЕНОВАЯ АНОМАЛИЯ",
      distTitle: "Рыночное распределение цен",
      medianLabel: "Медиана ₽14,200",
      formula: "Price_z = (₽149,000 - ₽14,200) / ₽42,300 = 3.19σ",
      altsTitle: "Альтернативы с высокой ценностью (IDP > 70)",
    },
    history: {
      title: "История анализов",
      subtitle: "3 анализа за сессию",
      cols: ["Продукт", "Категория", "Цена", "CVF", "IMP", "IDP", "Дата", ""],
      avgIdp: "Средний IDP",
      savings: "Выявлена потенциальная экономия",
      highRisk: "Высокорисковых предложений",
      view: "Смотреть",
    },
    learning: {
      title: "Learning Hub",
      subtitle: "Финансовая устойчивость · Защита от манипуляций",
      progress: "4 / 12 пройдено",
      streak: "3-дневная серия — продолжай учиться",
      filters: ["Все", "Видео", "Статьи", "Упражнения", "Психология", "Фин. грамотность"],
      featuredBadge: "YouTube · 18 мин",
      featuredTitle: "Как работает эффект якоря: почему мы переплачиваем всегда",
      featuredMeta: "Связано с вашим анализом IDP 28",
      exerciseModal: {
        title: "24-часовое правило",
        questions: [
          "Я думаю об этом больше 24 часов?",
          "Это входит в мой бюджет без кредита?",
          "Я проверил отзывы на независимых площадках?",
          "Есть ли у меня аналогичный продукт, которым я не пользуюсь?",
          "Я куплю это без скидки по полной цене?",
          "Через месяц я всё ещё буду рад этой покупке?",
          "Wise Choice IDP выше 60?",
        ],
        yes: "Да",
        no: "Нет",
        results: [
          "Стоп. Импульсная покупка.",
          "Подожди день.",
          "Можно покупать.",
        ],
        close: "Закрыть",
      },
      miniTest: {
        label: "Мини-тест · Закрепление знаний",
        next: "Далее",
        finish: "Завершить",
        result: "Результат: 3/3 — Отлично! Ты распознаёшь манипуляции",
        nextModule: "Следующий модуль →",
        questions: [
          {
            q: "Вы видите ₽90,000 → ₽45,000. Какой механизм активирован?",
            options: [
              "FOMO — страх упустить скидку",
              "Эффект якоря — первая цена искажает восприятие",
              "Социальное доказательство",
            ],
            correct: 1,
            explanation: "Эффект якоря: зачёркнутая цена устанавливает психологическую точку отсчёта. Именно это лежит в основе IDP-формулы компоненты P(p).",
          },
          {
            q: "Таймер «Осталось 02:14:33» перезапускается каждые 24 часа. Это:",
            options: [
              "Законная маркетинговая практика",
              "Dark Pattern — искусственный дефицит",
              "Техника социального доказательства",
            ],
            correct: 1,
            explanation: "Dark Pattern (Brignull, 2010): таймеры, которые перезапускаются — это не реальный дефицит, а manufactured urgency.",
          },
          {
            q: "λ=2.25 в теории перспектив означает:",
            options: [
              "Скидка 25% воспринимается как честная",
              "Потери бол����т в 2.25 раза сильнее, чем равный выигрыш радует",
              "Вероятность мошенничества составляет 22.5%",
            ],
            correct: 1,
            explanation: "Kahneman & Tversky (1979): коэффициент неприятия потерь λ≈2.25 объясняет, почему «не потерять» важнее, чем «выиграть».",
          },
        ],
      },
      cards: [
        {
          type: "Видео",
          typeColor: "#ef4444",
          level: "Начинающий",
          title: "Система 1 vs Система 2: двойной процесс мышления",
          desc: "Почему быстрое мышление проигрывает маркетологам",
          time: "12 мин",
          href: "https://youtu.be/UoAycSxS3q4?si=bHpJw0PAt9w3zEWh",
          done: true,
          exercise: false,
        },
        {
          type: "Статья",
          typeColor: "#14b8a6",
          level: "Средний",
          title: "FOMO: нейробиология страха упущенной выгоды",
          desc: "Как дофамин превращает дефицитные оферы в эмоциональные решения",
          time: "8 мин",
          href: "https://habr.com/ru/articles/925512/",
          done: true,
          exercise: false,
        },
        {
          type: "Упражнение",
          typeColor: "#f59e0b",
          level: "Практика",
          title: "24-часовое правило: тренажёр паузы перед покупкой",
          desc: "Интерактивный чеклист из 7 вопросов для проверки импульсивного желания",
          time: "5 мин",
          href: null,
          done: false,
          exercise: true,
        },
        {
          type: "Исследование",
          typeColor: "#a855f7",
          level: "Продвинутый",
          title: "Теория перспектив: Канеман-Тверски (Econometrica 1979)",
          desc: "Математика неприятия потерь λ≈2.25, перевод ключевых выводов",
          time: "25 мин",
          href: "https://www.jstor.org/stable/1914185",
          done: false,
          exercise: false,
        },
      ],
    },
  },
  en: {
    tagline: "Smart Choice",
    nav: {
      dashboard: "Dashboard",
      analysis: "Offer Analysis",
      triggers: "Trigger Detector",
      radar: "Price Radar",
      history: "History",
      learning: "Learning Hub",
    },
    sidebar: {
      checkedToday: "IDP Checked Today",
      live: "live",
    },
    dashboard: {
      greeting: "Hi, Analyst!",
      subtitle: "Let's make a rational choice today — powered by math, not emotion.",
      inputLabel: "Paste sales page URL or product description",
      inputPlaceholder: "https://example.com/sales or paste text here...",
      analyzeBtn: "Analyze in 3 min",
      poweredBy: "Uses CVF · IMP · Bayesian Quality Model",
      recentTitle: "Recently Analyzed",
      seeAll: "See all",
    },
    market: [
      { value: "$3.2B", label: "Regional infocyganism market" },
      { value: "15–40%", label: "Potential savings per user/year" },
      { value: "60%", label: "Online courses miss promised results" },
      { value: "34%", label: "Users verify reviews before buying" },
    ],
    risk: { safe: "Safe", moderate: "Moderate Risk", critical: "Critical Risk" },
    dates: { hoursAgo: "2 hours ago", yesterday: "Yesterday", daysAgo: "3 days ago" },
    analysis: {
      label: "Offer Analysis",
      price: "₽149,000 · Financial coaching / Self-development",
      tab: { cvf: "CVF", imp: "IMP", bayes: "Bayesian" },
      cvfFormula: "CVF = w₁·Q(q) - w₂·P(p) - w₃·R(r) - w₄·A(a)",
      cvfNegative: "Negative CVF = offer destroys value",
      impFormula: "IMP = Σ αᵢ · Tᵢ · (1 + γ · Cᵢ)",
      impPressure: "Critical Pressure",
      impSynergy: "Synergy coefficient γ = 1.34 — triggers amplify each other",
      bayesFormula: "P(Quality=High | evidence) = P(e|H)·P(H) / P(e)",
      bayesPosterior: "Posterior probability of high quality:",
      bayesRec: "Recommendation: Do not purchase",
      bayesAlt: "Best alternative found",
      idpLabel: "Critical Risk — High probability of manipulative offer",
      idpFormula: "IDP = 100 · σ(CVF · (1 - IMP/10) · B(q))",
    },
    loading: [
      "Parsing offer structure...",
      "Calculating CVF...",
      "Running IMP scan...",
      "Bayesian update...",
      "Done.",
    ],
    triggers: {
      title: "Trigger Detector",
      subtitle: "Psychological manipulation patterns found in analyzed offer",
      summary: "6 triggers detected · Manipulation pressure: Critical · Confidence: 94%",
    },
    radar: {
      title: "Price Radar",
      subtitle: "Where does this offer stand in the market distribution?",
      median: "Market median",
      productPrice: "Product price",
      zscore: "Z-score",
      percentile: "Percentile",
      percentileValue: "Top 0.07% most expensive",
      anomaly: "PRICE ANOMALY DETECTED",
      distTitle: "Market price distribution",
      medianLabel: "Median ₽14,200",
      formula: "Price_z = (₽149,000 - ₽14,200) / ₽42,300 = 3.19σ",
      altsTitle: "Better value alternatives (IDP > 70)",
    },
    history: {
      title: "Analysis History",
      subtitle: "3 analyses this session",
      cols: ["Product", "Category", "Price", "CVF", "IMP", "IDP", "Date", ""],
      avgIdp: "Average IDP analyzed",
      savings: "Total potential savings identified",
      highRisk: "High-risk offers detected",
      view: "View",
    },
    learning: {
      title: "Learning Hub",
      subtitle: "Financial Resilience · Protection from Manipulation",
      progress: "4 / 12 completed",
      streak: "3-day streak — keep learning",
      filters: ["All", "Video", "Articles", "Exercises", "Psychology", "Fin. Literacy"],
      featuredBadge: "YouTube · 18 min",
      featuredTitle: "How the Anchoring Effect Works: Why We Always Overpay",
      featuredMeta: "Related to your IDP 28 analysis",
      exerciseModal: {
        title: "24-Hour Rule",
        questions: [
          "Have I been thinking about this for more than 24 hours?",
          "Does it fit my budget without credit?",
          "Have I checked reviews on independent platforms?",
          "Do I already own a similar product I don't use?",
          "Would I buy this at full price without a discount?",
          "Will I still be happy with this purchase in a month?",
          "Is Wise Choice IDP above 60?",
        ],
        yes: "Yes",
        no: "No",
        results: [
          "Stop. Impulse purchase.",
          "Wait a day.",
          "Safe to buy.",
        ],
        close: "Close",
      },
      miniTest: {
        label: "Mini-Test · Knowledge Check",
        next: "Next",
        finish: "Finish",
        result: "Result: 3/3 — Excellent! You recognize manipulation",
        nextModule: "Next Module →",
        questions: [
          {
            q: "You see ₽90,000 → ₽45,000. Which mechanism is activated?",
            options: [
              "FOMO — fear of missing the discount",
              "Anchoring Effect — the first price distorts perception",
              "Social proof",
            ],
            correct: 1,
            explanation: "Anchoring: the crossed-out price sets a psychological reference point — the core of the IDP P(p) component.",
          },
          {
            q: "A timer showing '02:14:33 remaining' resets every 24 hours. This is:",
            options: [
              "A legitimate marketing practice",
              "Dark Pattern — artificial scarcity",
              "A social proof technique",
            ],
            correct: 1,
            explanation: "Dark Pattern (Brignull, 2010): timers that reset are not real scarcity — they are manufactured urgency.",
          },
          {
            q: "λ=2.25 in Prospect Theory means:",
            options: [
              "A 25% discount feels fair",
              "Losses feel 2.25× more painful than equivalent gains feel good",
              "The probability of fraud is 22.5%",
            ],
            correct: 1,
            explanation: "Kahneman & Tversky (1979): loss aversion coefficient λ≈2.25 explains why 'not losing' matters more than 'winning'.",
          },
        ],
      },
      cards: [
        {
          type: "Video",
          typeColor: "#ef4444",
          level: "Beginner",
          title: "System 1 vs System 2: Dual-Process Thinking",
          desc: "Why fast thinking loses to marketers",
          time: "12 min",
          href: "https://youtu.be/UoAycSxS3q4?si=bHpJw0PAt9w3zEWh",
          done: true,
          exercise: false,
        },
        {
          type: "Article",
          typeColor: "#14b8a6",
          level: "Intermediate",
          title: "FOMO: The Neuroscience of Fear of Missing Out",
          desc: "How dopamine turns scarcity offers into emotional decisions",
          time: "8 min",
          href: "https://habr.com/ru/articles/925512/",
          done: true,
          exercise: false,
        },
        {
          type: "Exercise",
          typeColor: "#f59e0b",
          level: "Practice",
          title: "24-Hour Rule: Pause Trainer Before Buying",
          desc: "Interactive 7-question checklist to test impulse desire",
          time: "5 min",
          href: null,
          done: false,
          exercise: true,
        },
        {
          type: "Research",
          typeColor: "#a855f7",
          level: "Advanced",
          title: "Prospect Theory: Kahneman-Tversky (Econometrica 1979)",
          desc: "Math of loss aversion λ≈2.25, translation of key findings",
          time: "25 min",
          href: "http://www.r-5.org/files/books/ethology/human-mind/thinking/Daniel_Kahneman-Thinking_Fast_and_Slow-RU.pdf",
          done: false,
          exercise: false,
        },
      ],
    },
  },
  kz: {
    tagline: "Ақылды таңдау",
    nav: {
      dashboard: "Басты бет",
      analysis: "Ұсыныс талдауы",
      triggers: "Триггер детекторы",
      radar: "Баға радары",
      history: "Тарих",
      learning: "Білім орталығы",
    },
    sidebar: {
      checkedToday: "Бүгін тексерілді",
      live: "тікелей",
    },
    dashboard: {
      greeting: "Сәлем, Аналитик!",
      subtitle: "Бүгін рационалды таңдау жасайық — математикамен, эмоциямен емес.",
      inputLabel: "Сату бетінің URL мекенжайын немесе өнім сипаттамасын қойыңыз",
      inputPlaceholder: "https://example.com/sales немесе мәтінді қойыңыз...",
      analyzeBtn: "3 минутта талдау",
      poweredBy: "CVF · IMP · Байес сапа моделін пайдаланады",
      recentTitle: "Соңғы талдаулар",
      seeAll: "Барлығы",
    },
    market: [
      { value: "$3.2B", label: "Өңірлік инфоцыганшылық нарығы" },
      { value: "15–40%", label: "Пайдаланушыға жылдық үнем мүмкіндігі" },
      { value: "60%", label: "Онлайн курстар уәделерін орындамайды" },
      { value: "34%", label: "Пайдаланушылар сатып алмас бұрын пікірлерді тексереді" },
    ],
    risk: { safe: "Қауіпсіз", moderate: "Орташа тәуекел", critical: "Сыни тәуекел" },
    dates: { hoursAgo: "2 сағат бұрын", yesterday: "Кеше", daysAgo: "3 күн бұрын" },
    analysis: {
      label: "Ұсыныс талдауы",
      price: "₽149,000 · Қаржылық коучинг / Өзін-өзі дамыту",
      tab: { cvf: "CVF", imp: "IMP", bayes: "Байестік" },
      cvfFormula: "CVF = w₁·Q(q) - w₂·P(p) - w₃·R(r) - w₄·A(a)",
      cvfNegative: "Теріс CVF = ұсыныс құнды жояды",
      impFormula: "IMP = Σ αᵢ · Tᵢ · (1 + γ · Cᵢ)",
      impPressure: "Сыни қысым",
      impSynergy: "Синергия коэффициенті γ = 1.34 — триггерлер бір-бірін күшейтеді",
      bayesFormula: "P(Quality=High | evidence) = P(e|H)·P(H) / P(e)",
      bayesPosterior: "Жоғары сапаның апостериорлық ықтималдығы:",
      bayesRec: "Ұсыным: Сатып алмаңыз",
      bayesAlt: "Ең жақсы балама табылды",
      idpLabel: "Сыни тәуекел — манипуляциялық ұсыныстың жоғары ықтималдығы",
      idpFormula: "IDP = 100 · σ(CVF · (1 - IMP/10) · B(q))",
    },
    loading: [
      "Ұсыныс құрылымын талдау...",
      "CVF есептеу...",
      "IMP сканерлеу...",
      "Байес жаңартуы...",
      "Дайын.",
    ],
    triggers: {
      title: "Триггер детекторы",
      subtitle: "Талданған ұсыныста табылған психологиялық манипуляция үлгілері",
      summary: "6 триггер анықталды · Манипуляция қысымы: Сыни · Сенімділік: 94%",
    },
    radar: {
      title: "��аға радары",
      subtitle: "Бұл ұсыныс нарықтық таралуда қай жерде тұр?",
      median: "Нарық медианасы",
      productPrice: "Өнім бағасы",
      zscore: "Z-балл",
      percentile: "Перцентиль",
      percentileValue: "Ең қымбаттың үздік 0.07%",
      anomaly: "БАҒАлық АНОМАЛИЯ АНЫҚТАЛДЫ",
      distTitle: "Нарықтық баға таралуы",
      medianLabel: "Медиана ₽14,200",
      formula: "Price_z = (₽149,000 - ₽14,200) / ₽42,300 = 3.19σ",
      altsTitle: "Жоғары мәнді баламалар (IDP > 70)",
    },
    history: {
      title: "Талдау тарихы",
      subtitle: "Осы сеанстағы 3 талдау",
      cols: ["Өнім", "Санат", "Баға", "CVF", "IMP", "IDP", "Күні", ""],
      avgIdp: "Орташа IDP",
      savings: "Анықталған ықтималды үнем",
      highRisk: "Жоғары тәуекелді ұсыныстар",
      view: "Қарау",
    },
    learning: {
      title: "Білім орталығы",
      subtitle: "Қаржылық тұрақтылық · Манипуляциядан қорғану",
      progress: "4 / 12 аяқталды",
      streak: "3 күндік серия — оқуды жалғастыр",
      filters: ["Барлығы", "Бейне", "Мақалалар", "Жаттығулар", "Психология", "Қаржы сауаты"],
      featuredBadge: "YouTube · 18 мин",
      featuredTitle: "Зәкір әсері қалай жұмыс істейді: неге біз әрқашан артық төлейміз",
      featuredMeta: "IDP 28 талдауыңызға қатысты",
      exerciseModal: {
        title: "24 сағат ережесі",
        questions: [
          "Мен бұл туралы 24 сағаттан астам уақыт ойландым ба?",
          "Бұл несіеге тәуелсіз бюджетіме сай ма?",
          "Мен тәуелсіз платформалардағы пікірлерді тексердім бе?",
          "Менде ұқсас, пайдаланбайтын өнімім бар ма?",
          "Мен бұны жеңілдіксіз толық бағасымен сатып алар ма едім?",
          "Бір айдан кейін де мен бұл сатып алуға қуанышты боламын ба?",
          "Wise Choice IDP 60-тан жоғары ма?",
        ],
        yes: "Иә",
        no: "Жоқ",
        results: [
          "Тоқта. Импульсивті сатып алу.",
          "Бір күн күте тұр.",
          "Сатып алуға болады.",
        ],
        close: "Жабу",
      },
      miniTest: {
        label: "Мини-тест · Білімді бекіту",
        next: "Келесі",
        finish: "Аяқтау",
        result: "Нәтиже: 3/3 — Тамаша! Сіз манипуляцияны таниды",
        nextModule: "Келесі модуль →",
        questions: [
          {
            q: "₽90,000 → ₽45,000 көресіз. Қандай механизм іске қосылды?",
            options: [
              "FOMO — жеңілдікті жіберіп алу қорқынышы",
              "Зәкір әсері — бірінші баға қабылдауды бұрмалайды",
              "Әлеуметтік дәлел",
            ],
            correct: 1,
            explanation: "Зәкір әсері: сызылған баға психологиялық бастапқы нүкте орнатады — бұл IDP P(p) компонентінің негізі.",
          },
          {
            q: "«Қалды 02:14:33» таймері әр 24 сағатта қайта іске қосылады. Бұл:",
            options: [
              "Заңды маркетингтік тәжірибе",
              "Dark Pattern — жасанды тапшылық",
              "Әлеуметтік дәлел техникасы",
            ],
            correct: 1,
            explanation: "Dark Pattern (Brignull, 2010): қайта іске қосылатын таймерлер шынайы тапшылық емес — бұл жасалған шұғылдық.",
          },
          {
            q: "Перспектива теориясындағы λ=2.25 дегеніміз:",
            options: [
              "25% жеңілдік әділ деп қабылданады",
              "Шығындар тең пайдаға қарағанда 2.25 есе күшті ауырады",
              "Алаяқтық ықтималдығы 22.5%",
            ],
            correct: 1,
            explanation: "Kahneman & Tversky (1979): шығынды жек көру коэффициенті λ≈2.25 неге «жоғалтпау» «ұтудан» маңыздырақ екенін түсіндіреді.",
          },
        ],
      },
      cards: [
        {
          type: "Бейне",
          typeColor: "#ef4444",
          level: "Бастаушы",
          title: "1-жүйе мен 2-жүйе: қос процесті ойлау",
          desc: "Неге жылдам ойлау маркетологтарға жеңіліп қалады",
          time: "12 мин",
          href: "https://youtu.be/UoAycSxS3q4?si=bHpJw0PAt9w3zEWh",
          done: true,
          exercise: false,
        },
        {
          type: "Мақала",
          typeColor: "#14b8a6",
          level: "Орташа",
          title: "FOMO: жіберіп алу қорқынышының нейробиологиясы",
          desc: "Дофамин тапшылық ұсыныстарды эмоционалды шешімдерге қалай айналдырады",
          time: "8 мин",
          href: "https://habr.com/ru/articles/925512/",
          done: true,
          exercise: false,
        },
        {
          type: "Жаттығу",
          typeColor: "#f59e0b",
          level: "Тәжірибе",
          title: "24 сағат ережесі: сатып алмас бұрын кідіріс тренажері",
          desc: "Импульсивті тілекті тексеруге арналған 7 сұрақтан тұратын интерактивті тізім",
          time: "5 мин",
          href: null,
          done: false,
          exercise: true,
        },
        {
          type: "Зерттеу",
          typeColor: "#a855f7",
          level: "Жетілдірілген",
          title: "Перспектива теориясы: Канеман-Тверски (Econometrica 1979)",
          desc: "Шығынды жек көрудің математикасы λ≈2.25, негізгі тұжырымдардың аудармасы",
          time: "25 мин",
          href: "http://www.r-5.org/files/books/ethology/human-mind/thinking/Daniel_Kahneman-Thinking_Fast_and_Slow-RU.pdf",
          done: false,
          exercise: false,
        },
      ],
    },
  },
} as const

/* ───────────────────────────── DATA (static) ─────────────────────────────── */

const RISK_COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  teal: "#14b8a6",
  cyan: "#06b6d4",
}

const cvfBars = [
  { label: "Q (Quality)", value: 18, color: RISK_COLORS.red, note: "No verifiable credentials, no refund policy" },
  { label: "P (Price Anomaly)", value: 91, color: RISK_COLORS.red, note: "Z-score: +3.2σ above category median" },
  { label: "R (Risk)", value: 87, color: RISK_COLORS.red, note: "High: no legal entity, anonymous author" },
  { label: "A (Alt. Cost)", value: 74, color: RISK_COLORS.orange, note: "Better alternatives exist at ₽8,000–15,000" },
]

const impTriggers = [
  { name: "Scarcity", alpha: 0.22, intensity: 9, note: "«Только 3 места по старой цене»" },
  { name: "Anchoring", alpha: 0.19, intensity: 10, note: "Зачёркнутая цена ₽298,000 → ₽149,000" },
  { name: "Loss Aversion", alpha: 0.21, intensity: 8, note: "«Не упустите последний шанс»" },
  { name: "Social Proof", alpha: 0.18, intensity: 7, note: "«Уже 12,847 участников»" },
  { name: "Authority", alpha: 0.2, intensity: 8, note: "Lifestyle photos without credentials" },
]

const bayesianData = [
  { step: "Prior", value: 45 },
  { step: "No refund", value: 31 },
  { step: "Anon author", value: 19 },
  { step: "Price +3.2σ", value: 14 },
  { step: "Countdown", value: 9 },
]

const triggerCards = [
  {
    severity: "CRITICAL",
    color: RISK_COLORS.red,
    icon: AlertTriangle,
    title: "Scarcity + FOMO",
    phrase: "Только 3 места осталось по специальной цене! Таймер: 02:14:33",
    weight: "α = 0.22 · intensity 9/10 = contribution 1.98",
    sectionTitle: "Psychological Mechanism (Kahneman & Tversky, 1979)",
    body: "Scarcity triggers Loss Aversion — losses feel ~2.25× more painful than equivalent gains (λ coefficient in Prospect Theory). The countdown timer activates System 1 thinking, bypassing analytical evaluation. Your brain treats 'missing out' as a real loss even before any purchase decision.",
    math: "π(p_loss) = p^0.69 / (p^0.69 + (1-p)^0.69)^(1/0.69)",
    mathNote: "Probability weighting distortion",
    cialdini: "Principle #6: Scarcity — Influence (1984), Chapter 7",
  },
  {
    severity: "HIGH",
    color: RISK_COLORS.orange,
    icon: AlertTriangle,
    title: "Price Anchoring",
    phrase: "₽298,000 → Сегодня только ₽149,000 (скидка 50%)",
    strike: "₽298,000",
    weight: "α = 0.19 · intensity 10/10 = 1.90",
    sectionTitle: "Anchoring Effect (Tversky & Kahneman, 1974)",
    body: "The crossed-out price creates a psychological anchor. Tversky & Kahneman (1974) demonstrated that any initial number — even arbitrary — shifts all subsequent estimates. The '50% off' feels like a gain, but the anchor ₽298,000 was likely never a real price. Market median for this category: ₽14,200.",
  },
  {
    severity: "HIGH",
    color: RISK_COLORS.orange,
    icon: AlertTriangle,
    title: "Loss Aversion Language",
    phrase: "Каждый день промедления = ₽5,000 упущенного дохода. Вы теряете деньги прямо сейчас.",
    weight: "α = 0.21 · intensity 8/10 = 1.68",
    sectionTitle: "Loss Aversion (Kahneman, λ≈2.25)",
    body: "Direct exploitation of loss aversion (λ≈2.25 in Kahneman's model). Framing inaction as an active loss is more persuasive than framing action as a gain of equal size. This is the most powerful manipulation technique in the detected set.",
  },
  {
    severity: "MODERATE",
    color: RISK_COLORS.yellow,
    icon: AlertCircle,
    title: "Unverified Social Proof",
    phrase: "12,847 участников уже изменили свою жизнь ⭐⭐⭐⭐⭐",
    weight: "α = 0.18 · intensity 7/10 = 1.26",
    sectionTitle: "Fake Social Proof",
    body: "Review analysis: no verifiable platform (Trustpilot, Otzovik, etc.). Round numbers and emoji stars are statistical markers of fabricated social proof. Cialdini Principle #3: Social Proof. Detection confidence: 89%.",
  },
  {
    severity: "MODERATE",
    color: RISK_COLORS.yellow,
    icon: AlertCircle,
    title: "Authority Signal without Credentials",
    phrase: "Роман Волков — эксперт с 15-летним опытом, обучил 50,000+ человек",
    weight: "α = 0.20 · intensity 8/10 = 1.60",
    sectionTitle: "False Authority / Halo Effect",
    body: "No verifiable credentials found: no LinkedIn, no legal entity registration, no co-authored publications. Halo Effect (Thorndike, 1920) — lifestyle imagery (luxury cars, travel) substitutes for actual expertise. Persuasion Knowledge Model (Friestad & Wright, 1994): awareness of persuasion attempt significantly reduces compliance.",
  },
  {
    severity: "CRITICAL",
    color: RISK_COLORS.red,
    icon: Timer,
    title: "UI Dark Pattern",
    phrase: "Countdown timer resetting every 24 hours (detected via simulated behavior analysis)",
    weight: "Dark Pattern — deceptive UI",
    sectionTitle: "Forced Urgency (Brignull, 2010)",
    body: "This is a Dark Pattern (Brignull, 2010) — a deliberate UI deception. Timers that reset are not real scarcity; they are manufactured urgency. This practice is considered deceptive under FTC guidelines and ФАС Russia's advertising law Article 5.",
  },
]

const loadingStepsKey = ["loading.0", "loading.1", "loading.2", "loading.3", "loading.4"] as const

/* ─────────────────────────── ANALYSIS ENGINE ────────────────────────────── */

export interface AnalysisResult {
  idp: number
  cvf: number
  imp: number
  bayesian: number
  cvfBars: { label: string; value: number; color: string; note: string }[]
  detectedTriggers: { name: string; badge: string; color: string; phrase: string }[]
  verdictKz: string
  priceStats?: {
    extractedPrice: number | null
    currency: "KZT" | "RUB" | "USD" | "EUR" | null
    medianPrice: number | null
    zScore: number | null
    isAnomaly: boolean | null
    comparisons: {
      name: string
      provider: string
      amount: number
      currency: "KZT" | "RUB" | "USD" | "EUR"
      url?: string
    }[]
    sources: { title: string; url: string }[]
    searchError?: string | null
    searchedAt: string | null
  }
}

interface HistoryEntry {
  id: string
  name: string
  category: string
  price: number | null
  medianPrice: number | null
  currency: "KZT" | "RUB" | "USD" | "EUR" | null
  cvf: number
  imp: number
  idp: number
  createdAt: string
}

const HISTORY_STORAGE_KEY = "wise-choice-analysis-history"

const TRIGGER_PATTERNS = [
  {
    key: "scarcity",
    badge: "Scarcity",
    color: RISK_COLORS.red,
    patterns: [/только\s+\d+\s+мест/i, /осталось\s+\d+/i, /последн/i, /limited/i, /spots left/i, /қалды\s+\d+/i],
    weight: 2.2,
    note: (m: string) => `«${m.slice(0, 60)}»`,
  },
  {
    key: "anchoring",
    badge: "Anchoring",
    color: RISK_COLORS.orange,
    patterns: [/было\s+[\d,\s]+[₽$€]|[\d,\s]+[₽$€]\s*→|скидк[аиу]/i, /was\s+[\d,]+/i, /crossed.?out/i],
    weight: 1.9,
    note: () => "Price anchor / crossed-out price detected",
  },
  {
    key: "fomo",
    badge: "FOMO",
    color: RISK_COLORS.red,
    patterns: [/только сегодня/i, /завтра цена/i, /не упусти/i, /срочно/i, /таймер/i, /осталось \d+:\d+/i, /urgency/i, /today only/i, /timer/i],
    weight: 2.0,
    note: () => "Countdown / urgency language detected",
  },
  {
    key: "lossAversion",
    badge: "Loss Aversion",
    color: RISK_COLORS.orange,
    patterns: [/теряете деньги/i, /каждый день промедления/i, /упущенного дохода/i, /you.?re losing/i],
    weight: 1.8,
    note: () => "Loss-framing language detected",
  },
  {
    key: "fakeProof",
    badge: "Social Proof",
    color: RISK_COLORS.yellow,
    patterns: [/\d{3,}\s*(человек|участник|клиент|люд)/i, /гарантия\s*результат��/i, /100%\s*гарантия/i, /уже\s+\d+/i, /testimonial/i, /reviews/i],
    weight: 1.6,
    note: () => "Unverifiable social proof / guarantee claim",
  },
  {
    key: "haloEffect",
    badge: "Halo Effect",
    color: RISK_COLORS.yellow,
    patterns: [/эксперт/i, /\d+-летн/i, /обучил\s+\d+/i, /авторский/i, /expert/i, /trained\s+\d+/i],
    weight: 1.5,
    note: () => "Authority signal without verifiable credentials",
  },
]

function analyzeText(text: string): AnalysisResult {
  const lower = text.toLowerCase()

  // ── IMP triggers ──────────────────────────────────────────────────────────
  const detectedTriggers: AnalysisResult["detectedTriggers"] = []
  let impRaw = 0
  TRIGGER_PATTERNS.forEach((tp) => {
    const hit = tp.patterns.some((p) => p.test(lower))
    if (hit) {
      const match = text.slice(0, 120)
      detectedTriggers.push({ name: tp.badge, badge: tp.badge, color: tp.color, phrase: tp.note(match) })
      impRaw += tp.weight
    }
  })
  const imp = Math.min(10, Math.round(impRaw * 10) / 10)

  // ── CVF sub-scores ─────────────────────────────────────────────────────────
  const hasCredentials = /linkedin|диплом|сертифика|certified|accredited/i.test(lower)
  const hasRefund = /возврат|refund|money.?back|гарантия возврата/i.test(lower)
  const Q = hasCredentials ? 55 : hasRefund ? 40 : 18

  const priceAnchor = /[\d\s]{5,}/.test(lower)
  const P = priceAnchor ? 85 : 40

  const hasLegal = /ооо|ип |llc|ltd|юридическ/i.test(lower)
  const R = hasLegal ? 35 : 80

  const altKeywords = /бесплатно|free|₽0|coursera|udemy|skillbox/i.test(lower)
  const A = altKeywords ? 30 : 65

  const cvfRaw = 0.3 * (100 - Q) / 100 - 0.3 * P / 100 - 0.2 * R / 100 - 0.2 * A / 100
  const cvf = Math.round(cvfRaw * 100) / 100

  const cvfBarsResult = [
    { label: "Q (Quality)", value: Q, color: Q < 40 ? RISK_COLORS.red : Q < 65 ? RISK_COLORS.yellow : RISK_COLORS.green, note: hasCredentials ? "Credentials found" : "No verifiable credentials or refund policy" },
    { label: "P (Price Anomaly)", value: P, color: P > 70 ? RISK_COLORS.red : RISK_COLORS.yellow, note: P > 70 ? "Strong price anchor detected" : "Price seems within normal range" },
    { label: "R (Risk)", value: R, color: R > 65 ? RISK_COLORS.red : RISK_COLORS.yellow, note: hasLegal ? "Legal entity found" : "No legal entity / anonymous author" },
    { label: "A (Alt. Cost)", value: A, color: A > 55 ? RISK_COLORS.orange : RISK_COLORS.green, note: altKeywords ? "Free alternatives mentioned" : "Better alternatives likely exist" },
  ]

  // ── Bayesian trust ─────────────────────────────────────────────────────────
  let bayesian = 50
  if (!hasCredentials) bayesian -= 12
  if (!hasRefund) bayesian -= 8
  if (imp > 6) bayesian -= 15
  if (P > 70) bayesian -= 10
  if (!hasLegal) bayesian -= 8
  bayesian = Math.max(5, Math.min(95, bayesian))

  // ── IDP ───────────────────────────────────────────────────────────────────
  const impFactor = 1 - imp / 10
  const idpRaw = 100 / (1 + Math.exp(-10 * (cvfRaw * impFactor * (bayesian / 100) - 0.1)))
  const idp = Math.round(Math.max(5, Math.min(95, idpRaw)))

  // ── Verdict in Kazakh ─────────────────────────────────────────────────────
  let verdictKz: string
  if (idp < 30) verdictKz = "Бұл ұсыныс манипуляция белгілерін көрсетеді — сатып алудан бас тарту ұсынылады."
  else if (idp < 55) verdictKz = "Ұсыныс тәуекелді — шешім қабылдамас бұрын тәуелсіз пікірлерді тексеріңіз."
  else if (idp < 80) verdictKz = "Орташа тәуекел — баламаларды салыстырып, баға негізделгенін тексеріңіз."
  else verdictKz = "Ұсыныс сенімді болып көрінеді — салыстырмалы талдауды жалғастырыңыз."

  return { idp, cvf, imp, bayesian, cvfBars: cvfBarsResult, detectedTriggers, verdictKz }
}

const DEMO_TEXT =
  "Стань богатым за 90 дней! Авторский интенсив. Только 3 места осталось по специальной цене ₽149,000 (было ₽298,000). Таймер: осталось 02:14:33. Гарантия результата 100%. Запишись сейчас — завтра цена вырастет!"

/* ─────────────────────────── UI HELPERS ──────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-sm bg-white/5 border border-teal-500/20 rounded-2xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}

function Pill({ score, label, color }: { score: number | string; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
    >
      {score} — {label}
    </span>
  )
}

/* ─────────────────────────── GAUGE ───────────────────────────────────────── */

function IdpGauge({ score, label, formula }: { score: number; label: string; formula: string }) {
  const [angle, setAngle] = useState(-180)
  useEffect(() => {
    const t = setTimeout(() => setAngle(-180 + (score / 100) * 180), 100)
    return () => clearTimeout(t)
  }, [score])

  const cx = 150, cy = 150, r = 120
  const segments = [
    { from: 0, to: 29, color: RISK_COLORS.red },
    { from: 29, to: 54, color: RISK_COLORS.orange },
    { from: 54, to: 79, color: RISK_COLORS.yellow },
    { from: 79, to: 100, color: RISK_COLORS.green },
  ]
  const polar = (pct: number, radius: number) => {
    const a = (-180 + (pct / 100) * 180) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  }
  const arcPath = (from: number, to: number) => {
    const s = polar(from, r), e = polar(to, r)
    const large = to - from > 50 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 180" className="w-full max-w-md">
        {segments.map((seg, i) => (
          <path key={i} d={arcPath(seg.from, seg.to)} fill="none" stroke={seg.color} strokeWidth={20} strokeLinecap="round" opacity={0.85} />
        ))}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "transform 1.5s ease-out" }}>
          <line x1={cx} y1={cy} x2={cx + r - 18} y2={cy} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r={8} fill="#fff" />
      </svg>
      <div className="-mt-6 text-center">
        <div className="text-[56px] font-bold leading-none" style={{ color: RISK_COLORS.red }}>{score}</div>
        <p className="mt-2 text-sm font-medium text-red-400">{label}</p>
        <p className="mt-1 font-mono text-xs text-gray-500">{formula}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── CIRCULAR PROGRESS ──────────────────────────── */

function CircularProgress({ value, max }: { value: number; max: number }) {
  const r = 40, c = 2 * Math.PI * r, pct = value / max
  return (
    <div className="relative h-28 w-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ffffff15" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={RISK_COLORS.red} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-red-400">{value}</span>
        <span className="text-xs text-gray-500">/ {max}</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ APP ════════════════════════════════════════ */

const LOADING_STEPS_KZ = [
  "CVF есептелуде...",
  "IMP триггерлері анықталуда...",
  "IDP индексі есептелуде...",
  "Байес моделі жаңартылуда...",
  "Дайын.",
]

export default function WiseChoice() {
  const [lang, setLang] = useState<Lang>("ru")
  const t = T[lang]

  const [activePage, setActivePage] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [activeTab, setActiveTab] = useState<"cvf" | "imp" | "bayes">("cvf")
  const [expandedTrigger, setExpandedTrigger] = useState<number | null>(null)
  const [barsIn, setBarsIn] = useState(false)
  const [inputText, setInputText] = useState(DEMO_TEXT)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(() => analyzeText(DEMO_TEXT))
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY)
      if (saved) setHistoryEntries(JSON.parse(saved).slice(0, 10))
    } catch (error) {
      console.warn("Failed to load analysis history:", error)
    }
  }, [])

  const updateHistory = (updater: (current: HistoryEntry[]) => HistoryEntry[]) => {
    setHistoryEntries((current) => {
      const next = updater(current).slice(0, 10)
      try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.warn("Failed to save analysis history:", error)
      }
      return next
    })
  }

  useEffect(() => {
    if (activeTab === "cvf") {
      setBarsIn(false)
      const tt = setTimeout(() => setBarsIn(true), 50)
      return () => clearTimeout(tt)
    }
  }, [activeTab, activePage])

  const runAnalysis = async () => {
    if (!inputText.trim()) return
    setActivePage("analysis")
    setLoading(true)
    setLoadStep(0)
    setAnalysisError(null)

    // Animate loading steps while waiting for the API
    const stepInterval = setInterval(() => {
      setLoadStep((prev) => {
        const next = prev + 1
        if (next >= LOADING_STEPS_KZ.length - 1) clearInterval(stepInterval)
        return next
      })
    }, 900)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      })

      clearInterval(stepInterval)
      setLoadStep(LOADING_STEPS_KZ.length - 1)

      const data = await res.json()
      if (!res.ok) {
        const providerInfo = data.providerStatus
          ? ` (Gemini ${data.providerStatus}${data.providerMessage ? `: ${data.providerMessage}` : ""})`
          : ""
        throw new Error(`${data.error ?? `Server error ${res.status}`}${providerInfo}`)
      }

      const metrics = data.cvf_metrics ?? {}
      const quality = metrics.qQuality ?? data.quality ?? 0
      const priceAnomaly = metrics.pPriceAnomaly ?? data.price_anomaly ?? 0
      const risk = metrics.rRisk ?? data.risk ?? 0
      const altCost = metrics.aAltCost ?? data.alt_cost ?? 0

      // Map API response shape → AnalysisResult used by UI
      const mapped: AnalysisResult = {
        idp: data.idp ?? 50,
        cvf: data.cvf ?? 0,
        imp: data.imp ?? 5,
        bayesian: data.bayesian_trust ?? 50,
        verdictKz: data.verdict_kk ?? "",
        priceStats: data.price_stats,
        detectedTriggers: (data.triggers ?? []).map((tr: { name: string; level: string; quote: string }) => ({
          name: tr.name,
          badge: tr.name,
          color:
            tr.level === "CRITICAL" ? RISK_COLORS.red
            : tr.level === "HIGH" ? RISK_COLORS.orange
            : RISK_COLORS.yellow,
          phrase: tr.quote,
        })),
        cvfBars: [
          {
            label: "Q (Quality)",
            value: quality,
            color: quality < 40 ? RISK_COLORS.red : quality < 65 ? RISK_COLORS.yellow : RISK_COLORS.green,
            note: `Quality score: ${quality}/100`,
          },
          {
            label: "P (Price Anomaly)",
            value: priceAnomaly,
            color: priceAnomaly > 70 ? RISK_COLORS.red : RISK_COLORS.yellow,
            note: `Price anomaly: ${priceAnomaly}/100`,
          },
          {
            label: "R (Risk)",
            value: risk,
            color: risk > 65 ? RISK_COLORS.red : RISK_COLORS.orange,
            note: `Risk score: ${risk}/100`,
          },
          {
            label: "A (Alt. Cost)",
            value: altCost,
            color: altCost > 55 ? RISK_COLORS.orange : RISK_COLORS.green,
            note: `Alternative cost: ${altCost}/100`,
          },
        ],
      }

      setAnalysisResult(mapped)
      const firstLine = inputText.trim().split("\n")[0].slice(0, 90)
      updateHistory((current) => [{
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
        name: data.course_title || firstLine || "Online course",
        category: data.course_subject || "Online Course",
        price: data.price_stats?.extractedPrice ?? null,
        medianPrice: data.price_stats?.medianPrice ?? null,
        currency: data.price_stats?.currency ?? null,
        cvf: mapped.cvf,
        imp: mapped.imp,
        idp: mapped.idp,
        createdAt: new Date().toISOString(),
      }, ...current])
    } catch (err) {
      clearInterval(stepInterval)
      console.error("[runAnalysis] error:", err)
      setAnalysisError(err instanceof Error ? err.message : "Талдау қатесі. API байланысын тексеріңіз.")
    } finally {
      setTimeout(() => setLoading(false), 400)
    }
  }

  const navItems = [
    { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { id: "analysis", label: t.nav.analysis, icon: Search },
    { id: "triggers", label: t.nav.triggers, icon: AlertTriangle },
    { id: "radar", label: t.nav.radar, icon: BarChart3 },
    { id: "history", label: t.nav.history, icon: BookOpen },
    { id: "learning", label: t.nav.learning, icon: GraduationCap },
  ]

  const LANG_OPTIONS: { code: Lang; label: string }[] = [
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
    { code: "kz", label: "KZ" },
  ]

  return (
    <div className="min-h-screen text-gray-100" style={{ backgroundColor: "#0a0f1a" }}>
      {/* Sidebar — desktop */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r border-teal-500/15 bg-[#0b1220] md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${RISK_COLORS.teal}, ${RISK_COLORS.cyan})` }}>
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold leading-tight text-white">Wise Choice</p>
            <p className="text-xs text-teal-400">{t.tagline}</p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-1 px-5 pb-4">
          <Globe className="h-3.5 w-3.5 text-gray-500" />
          <div className="ml-1.5 flex gap-1">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all duration-200 ${
                  lang === opt.code
                    ? "bg-teal-500/20 text-teal-300"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-all duration-300 ${
                  active ? "border-teal-400 bg-teal-500/10 text-teal-300" : "border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-3">
          <Card className="p-4">
            <p className="text-xs text-gray-400">{t.sidebar.checkedToday}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-2xl font-bold text-white">3</span>
              <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-semibold text-teal-300">{t.sidebar.live}</span>
            </div>
          </Card>
        </div>
      </aside>

      {/* Main */}
      <main className="px-4 pb-24 pt-6 md:ml-60 md:px-8 md:pb-10">
        {activePage === "dashboard" && (
          <Dashboard
            t={t}
            onAnalyze={runAnalysis}
            goAnalysis={() => setActivePage("analysis")}
            inputText={inputText}
            setInputText={setInputText}
          />
        )}
        {activePage === "analysis" && (
          <OfferAnalysis
            t={t}
            loading={loading}
            loadStep={loadStep}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            barsIn={barsIn}
            result={analysisResult}
            error={analysisError}
          />
        )}
        {activePage === "triggers" && (
          <Triggers t={t} expanded={expandedTrigger} setExpanded={setExpandedTrigger} />
        )}
        {activePage === "radar" && <PriceRadar t={t} result={analysisResult} />}
        {activePage === "history" && (
          <History
            t={t}
            entries={historyEntries}
            onDelete={(id) => updateHistory((current) => current.filter((entry) => entry.id !== id))}
          />
        )}
        {activePage === "learning" && <LearningHub t={t} />}
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-teal-500/15 bg-[#0b1220] py-2 md:hidden">
        {navItems.map((item) => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              aria-label={item.label}
              className={`flex flex-col items-center gap-1 px-2 py-1 transition-all duration-300 ${active ? "text-teal-300" : "text-gray-500"}`}
            >
              <item.icon className="h-5 w-5" />
            </button>
          )
        })}
        {/* Mobile lang switcher */}
        <div className="flex gap-1 px-1">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLang(opt.code)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                lang === opt.code ? "text-teal-300" : "text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

/* ══════════════════════════ PAGE: Dashboard ══════════════════════════════════ */

function Dashboard({
  t,
  onAnalyze,
  goAnalysis,
  inputText,
  setInputText,
}: {
  t: typeof T["ru"]
  onAnalyze: () => void
  goAnalysis: () => void
  inputText: string
  setInputText: (v: string) => void
}) {
  const recentAnalyses = [
    { id: 1, name: "Маркетинг на миллион: курс Алексея Н.", category: "Online Course", price: "₽89,000", idp: 28, risk: t.risk.critical, color: RISK_COLORS.red, date: t.dates.hoursAgo },
    { id: 2, name: "Excel для финансистов — Нетология", category: "Professional Course", price: "₽12,500", idp: 74, risk: t.risk.moderate, color: RISK_COLORS.yellow, date: t.dates.yesterday },
    { id: 3, name: "English Speaking Club Pro", category: "Language Course", price: "₽3,900", idp: 88, risk: t.risk.safe, color: RISK_COLORS.green, date: t.dates.daysAgo },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-white">{t.dashboard.greeting}</h1>
        <p className="mt-1 text-gray-400">{t.dashboard.subtitle}</p>
      </header>

      <Card className="p-5 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
        <label className="text-sm font-medium text-gray-300">{t.dashboard.inputLabel}</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <textarea
            rows={3}
            className="flex-1 resize-none rounded-xl border border-teal-500/20 bg-black/30 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-teal-400"
            placeholder={t.dashboard.inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={onAnalyze}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
            style={{ background: `linear-gradient(135deg, ${RISK_COLORS.teal}, ${RISK_COLORS.cyan})` }}
          >
            {t.dashboard.analyzeBtn} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t.dashboard.poweredBy}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {t.market.map((s, i) => {
          const icons = [TrendingUp, Percent, AlertCircle, Eye]
          const Icon = icons[i]
          return (
            <Card key={i} className="p-4">
              <Icon className="h-5 w-5 text-teal-400" />
              <p className="mt-3 text-2xl font-bold text-teal-300">{s.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{s.label}</p>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-white">{t.dashboard.recentTitle}</h2>
          <button onClick={goAnalysis} className="text-sm text-teal-400 hover:text-teal-300">{t.dashboard.seeAll}</button>
        </div>
        <div className="divide-y divide-white/5">
          {recentAnalyses.map((r) => (
            <button
              key={r.id}
              onClick={goAnalysis}
              className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-all duration-300 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-100">{r.name}</p>
                <p className="text-xs text-gray-500">{r.category} · {r.price} · {r.date}</p>
              </div>
              <Pill score={r.idp} label={r.risk} color={r.color} />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════ PAGE: Offer Analysis ════════════════════════════ */

function OfferAnalysis({
  t,
  loading,
  loadStep,
  activeTab,
  setActiveTab,
  barsIn,
  result,
  error,
}: {
  t: typeof T["ru"]
  loading: boolean
  loadStep: number
  activeTab: "cvf" | "imp" | "bayes"
  setActiveTab: (v: "cvf" | "imp" | "bayes") => void
  barsIn: boolean
  result: AnalysisResult
  error: string | null
}) {
  const idpColor =
    result.idp < 30 ? RISK_COLORS.red
    : result.idp < 55 ? RISK_COLORS.orange
    : result.idp < 80 ? RISK_COLORS.yellow
    : RISK_COLORS.green

  const badgeClass =
    result.idp < 30
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : result.idp < 55
      ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
      : result.idp < 80
      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
      : "border-teal-500/30 bg-teal-500/10 text-teal-400"

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <div className="rounded-2xl border border-teal-500/20 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">AI талдауы жүргізілуде...</span>
          </div>
          <div className="space-y-3">
            {LOADING_STEPS_KZ.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 transition-opacity duration-400"
                style={{ opacity: i <= loadStep ? 1 : 0.2 }}
              >
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white transition-all duration-400"
                  style={{
                    backgroundColor:
                      i < loadStep ? RISK_COLORS.teal
                      : i === loadStep ? "#e8b84b"
                      : "#1a3a36",
                  }}
                >
                  {i < loadStep ? "✓" : i + 1}
                </div>
                <span
                  className="text-sm"
                  style={{
                    color:
                      i === loadStep ? RISK_COLORS.cyan
                      : i < loadStep ? "#4a7a76"
                      : "#2a4a48",
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${((loadStep + 1) / LOADING_STEPS_KZ.length) * 100}%`,
                background: `linear-gradient(90deg, ${RISK_COLORS.teal}, ${RISK_COLORS.cyan})`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error} — нәтиже жергілікті модель арқылы есептелді.
        </div>
      )}
      <header>
        <p className="text-xs uppercase tracking-wide text-teal-400">{t.analysis.label}</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Анализ предложения</h1>
        <p className="mt-1 text-sm text-gray-400">{t.analysis.price}</p>
      </header>

      <Card className="p-6">
        <IdpGauge score={result.idp} label={t.analysis.idpLabel} formula={t.analysis.idpFormula} />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className={`rounded-lg border px-4 py-2 text-sm font-semibold ${badgeClass}`}>CVF Score: {result.cvf}</span>
          <span className={`rounded-lg border px-4 py-2 text-sm font-semibold ${badgeClass}`}>IMP Index: {result.imp} / 10</span>
          <span className={`rounded-lg border px-4 py-2 text-sm font-semibold ${badgeClass}`}>Bayesian Trust: {result.bayesian}%</span>
        </div>
        {/* Verdict in Kazakh */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-center">
          <p className="text-sm italic text-gray-300">{result.verdictKz}</p>
        </div>
      </Card>

      {/* Trigger badges */}
      {result.detectedTriggers.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">Detected Manipulation Triggers</p>
          <div className="flex flex-wrap gap-2">
            {result.detectedTriggers.map((tr, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{ color: tr.color, backgroundColor: `${tr.color}1a`, border: `1px solid ${tr.color}40` }}
                title={tr.phrase}
              >
                {tr.badge}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap gap-2">
          {(["cvf", "imp", "bayes"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${activeTab === id ? "bg-teal-500/15 text-teal-300" : "text-gray-400 hover:bg-white/5"}`}
            >
              {t.analysis.tab[id]}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "cvf" && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-gray-500">{t.analysis.cvfFormula}</p>
              {result.cvfBars.map((b, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-200">{b.label}</span>
                    <span className="font-mono" style={{ color: b.color }}>{b.value}/100</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: barsIn ? `${b.value}%` : "0%", backgroundColor: b.color }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{b.note}</p>
                </div>
              ))}
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: `${idpColor}30`, backgroundColor: `${idpColor}08` }}
              >
                <p className="text-3xl font-bold" style={{ color: idpColor }}>{result.cvf}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {result.cvf < 0 ? t.analysis.cvfNegative : "CVF > 0 — предложение создаёт ценность"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "imp" && (
            <div className="space-y-5">
              <p className="font-mono text-xs text-gray-500">{t.analysis.impFormula}</p>
              <div className="flex items-center gap-5">
                <CircularProgress value={result.imp} max={10} />
                <div>
                  <p className="text-sm text-gray-400">
                    {result.imp >= 7 ? t.analysis.impPressure : result.imp >= 4 ? "Moderate Pressure" : "Low Pressure"}
                  </p>
                  <p className="text-xs text-gray-500">{t.analysis.impSynergy}</p>
                </div>
              </div>
              <div className="space-y-3">
                {result.detectedTriggers.length === 0 ? (
                  <p className="text-sm text-gray-500">No manipulation triggers detected in this text.</p>
                ) : (
                  result.detectedTriggers.map((tr, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium" style={{ color: tr.color }}>{tr.name}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ color: tr.color, backgroundColor: `${tr.color}1a` }}
                        >
                          {tr.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{tr.phrase}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "bayes" && (
            <div className="space-y-4">
              <p className="font-mono text-xs text-gray-500">{t.analysis.bayesFormula}</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bayesianData} margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="step" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 60]} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="value" stroke={RISK_COLORS.red} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-300">
                {t.analysis.bayesPosterior}{" "}
                <span className="font-bold" style={{ color: idpColor }}>{result.bayesian}%</span>
                {" — "}{result.bayesian < 40 ? t.analysis.bayesRec : "Умеренная степень доверия"}
              </p>
              <Card className="p-4">
                <p className="text-xs text-gray-400">{t.analysis.bayesAlt}</p>
                <p className="mt-1 text-sm font-medium text-teal-300">«Финансовая грамотность» by Тинькофф — ₽0, IDP: 91</p>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════ PAGE: Trigger Detector ══════════════════════════ */

function Triggers({
  t,
  expanded,
  setExpanded,
}: {
  t: typeof T["ru"]
  expanded: number | null
  setExpanded: (i: number | null) => void
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">{t.triggers.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{t.triggers.subtitle}</p>
      </header>

      <Card className="p-4">
        <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: t.triggers.summary.replace("Critical", `<span class="font-semibold text-red-400">Critical</span>`).replace("Сыни", `<span class="font-semibold text-red-400">Сыни</span>`).replace("Критическое", `<span class="font-semibold text-red-400">Критическое</span>`) }} />
      </Card>

      <div className="space-y-3">
        {triggerCards.map((tr, i) => {
          const open = expanded === i
          return (
            <Card key={i} className="overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ color: tr.color, backgroundColor: `${tr.color}1a` }}>{tr.severity}</span>
                  <tr.icon className="h-4 w-4 flex-shrink-0" style={{ color: tr.color }} />
                  <span className="truncate font-medium text-gray-100">{tr.title}</span>
                </div>
                <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
              </button>

              <div className="px-4 pb-4">
                <blockquote className="rounded-r-lg border-l-4 bg-black/20 px-4 py-3 text-sm italic text-gray-300" style={{ borderColor: tr.color }}>
                  {tr.strike ? (
                    <><span className="text-gray-500 line-through">{tr.strike}</span>{tr.phrase.replace(tr.strike, "")}</>
                  ) : (
                    <>{`"${tr.phrase}"`}</>
                  )}
                </blockquote>
                <p className="mt-2 inline-block rounded-md px-2 py-1 font-mono text-xs" style={{ color: tr.color, backgroundColor: `${tr.color}14` }}>{tr.weight}</p>

                {open && (
                  <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-sm">
                    <p className="font-semibold text-teal-300">{tr.sectionTitle}</p>
                    <p className="leading-relaxed text-gray-400">{tr.body}</p>
                    {tr.math && (
                      <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                        <p className="font-mono text-xs text-cyan-300">{tr.math}</p>
                        <p className="mt-1 text-xs text-gray-500">{tr.mathNote}</p>
                      </div>
                    )}
                    {tr.cialdini && <p className="text-xs text-gray-500">{tr.cialdini}</p>}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════ PAGE: Price Radar ═══════════════════════════════ */

function PriceRadar({ t, result }: { t: typeof T["ru"]; result: AnalysisResult }) {
  const stats = result.priceStats
  const comparisons = stats?.comparisons ?? []
  const currency = stats?.currency ?? comparisons[0]?.currency ?? "KZT"
  const currencySymbol = { KZT: "₸", RUB: "₽", USD: "$", EUR: "€" }[currency]
  const formatPrice = (value: number | null | undefined) =>
    value == null ? "—" : `${Math.round(value).toLocaleString()} ${currencySymbol}`

  const prices = comparisons.map((item) => item.amount)
  const chartMax = Math.max(stats?.extractedPrice ?? 0, ...prices, 1) * 1.12
  const bandwidth = Math.max((stats?.medianPrice ?? chartMax / 3) * 0.2, chartMax / 50, 1)
  const priceDistribution = prices.length
    ? Array.from({ length: 41 }, (_, index) => {
        const price = (chartMax * index) / 40
        const density = prices.reduce(
          (sum, sample) => sum + Math.exp(-0.5 * ((price - sample) / bandwidth) ** 2),
          0,
        ) / prices.length
        return { price: Math.round(price), density: Number(density.toFixed(4)) }
      })
    : []

  const percentile = stats?.zScore == null
    ? "—"
    : stats.zScore >= 3 ? "> 99%" : stats.zScore >= 2 ? "> 97%" : stats.zScore >= 1 ? "> 84%" : "< 84%"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">{t.radar.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{t.radar.subtitle}</p>
      </header>

      {stats?.searchError && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-300">{stats.searchError}</p>
        </Card>
      )}

      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><p className="text-xs text-gray-500">{t.radar.median}</p><p className="mt-1 text-lg font-semibold text-teal-300">{formatPrice(stats?.medianPrice)}</p></div>
          <div><p className="text-xs text-gray-500">{t.radar.productPrice}</p><p className="mt-1 text-lg font-semibold text-white">{formatPrice(stats?.extractedPrice)}</p></div>
          <div><p className="text-xs text-gray-500">{t.radar.zscore}</p><p className="mt-1 text-2xl font-bold text-red-400">{stats?.zScore == null ? "—" : `${stats.zScore > 0 ? "+" : ""}${stats.zScore}σ`}</p></div>
          <div><p className="text-xs text-gray-500">{t.radar.percentile}</p><p className="mt-1 text-sm font-medium text-gray-200">{percentile}</p></div>
        </div>
        {stats?.isAnomaly && <div className="mt-4">
          <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400">{t.radar.anomaly}</span>
        </div>}
      </Card>

      <Card className="p-5">
        <p className="mb-4 text-sm font-medium text-gray-300">{t.radar.distTitle}</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceDistribution} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <defs>
                <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RISK_COLORS.teal} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={RISK_COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="price" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 12 }} formatter={(v) => [Number(v ?? 0), "density"]} labelFormatter={(v) => formatPrice(Number(v))} />
              <Area type="monotone" dataKey="density" stroke={RISK_COLORS.teal} strokeWidth={2} fill="url(#tealFill)" />
              {stats?.medianPrice != null && <ReferenceLine x={stats.medianPrice} stroke={RISK_COLORS.teal} strokeDasharray="4 4" label={{ value: t.radar.medianLabel, fill: RISK_COLORS.teal, fontSize: 10, position: "insideTopLeft" }} />}
              {stats?.extractedPrice != null && <ReferenceLine x={stats.extractedPrice} stroke={RISK_COLORS.red} strokeWidth={2} label={{ value: formatPrice(stats.extractedPrice), fill: RISK_COLORS.red, fontSize: 10, position: "insideTopRight" }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 font-mono text-xs text-gray-500">{t.radar.formula}</p>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-semibold text-white">{t.radar.altsTitle}</h2>
        </div>
        <div className="divide-y divide-white/5">
          {comparisons.map((course, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                {course.url ? (
                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-gray-100 hover:text-teal-300">{course.name}</a>
                ) : (
                  <p className="truncate font-medium text-gray-100">{course.name}</p>
                )}
                <p className="text-xs text-gray-500">{course.provider}</p>
              </div>
              <span className="whitespace-nowrap font-semibold text-teal-300">{formatPrice(course.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════ PAGE: History ═══════════════════════════════════ */

function History({
  t,
  entries,
  onDelete,
}: {
  t: typeof T["ru"]
  entries: HistoryEntry[]
  onDelete: (id: string) => void
}) {
  const currencySymbol = (currency: HistoryEntry["currency"]) =>
    currency ? ({ KZT: "₸", RUB: "₽", USD: "$", EUR: "€" }[currency]) : ""
  const formatPrice = (price: number | null, currency: HistoryEntry["currency"]) =>
    price == null ? "—" : `${Math.round(price).toLocaleString()} ${currencySymbol(currency)}`
  const scoreColor = (idp: number) =>
    idp < 30 ? RISK_COLORS.red : idp < 55 ? RISK_COLORS.orange : idp < 80 ? RISK_COLORS.yellow : RISK_COLORS.green
  const averageIdp = entries.length
    ? (entries.reduce((sum, entry) => sum + entry.idp, 0) / entries.length).toFixed(1)
    : "—"
  const primaryCurrency = entries.find((entry) => entry.currency)?.currency ?? null
  const savings = entries
    .filter((entry) => entry.currency === primaryCurrency && entry.price != null && entry.medianPrice != null)
    .reduce((sum, entry) => sum + Math.max(0, (entry.price ?? 0) - (entry.medianPrice ?? 0)), 0)
  const highRiskCount = entries.filter((entry) => entry.idp < 30).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">{t.history.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{t.history.subtitle}</p>
      </header>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-gray-500">
              {t.history.cols.map((col, i) => <th key={i} className="px-4 py-3 font-medium">{col}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((r) => (
              <tr key={r.id} className="text-gray-300">
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-100">{r.name}</td>
                <td className="px-4 py-3 text-gray-400">{r.category}</td>
                <td className="px-4 py-3">{formatPrice(r.price, r.currency)}</td>
                <td className="px-4 py-3 font-mono">{r.cvf}</td>
                <td className="px-4 py-3 font-mono">{r.imp}</td>
                <td className="px-4 py-3"><span className="font-semibold" style={{ color: scoreColor(r.idp) }}>{r.idp}</span></td>
                <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-teal-400 hover:text-teal-300">{t.history.view}</button>
                    <button onClick={() => onDelete(r.id)} aria-label="Delete" className="text-gray-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-gray-500">{t.history.avgIdp}</p><p className="mt-1 text-2xl font-bold text-teal-300">{averageIdp}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">{t.history.savings}</p><p className="mt-1 text-2xl font-bold text-teal-300">{formatPrice(savings, primaryCurrency)}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500">{t.history.highRisk}</p><p className="mt-1 text-2xl font-bold text-red-400">{highRiskCount} / {entries.length}</p></Card>
      </div>
    </div>
  )
}

/* ══════════════════════════ PAGE: Learning Hub ═══════════════════════════════ */

function ExerciseModal({
  t,
  onClose,
}: {
  t: typeof T["ru"]["learning"]["exerciseModal"]
  onClose: () => void
}) {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(7).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const toggle = (i: number, val: boolean) => {
    setAnswers((prev) => { const a = [...prev]; a[i] = val; return a })
  }
  const yesCount = answers.filter(Boolean).length
  const allAnswered = answers.every((a) => a !== null)

  const resultText =
    yesCount <= 3
      ? t.results[0]
      : yesCount <= 5
      ? t.results[1]
      : t.results[2]

  const resultColor =
    yesCount <= 3 ? RISK_COLORS.red : yesCount <= 5 ? RISK_COLORS.yellow : RISK_COLORS.green

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-teal-500/25 bg-[#0d1627] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-5 text-lg font-bold text-white">{t.title}</h3>
        <div className="space-y-3">
          {t.questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-black/20 p-3">
              <p className="mb-2 text-sm text-gray-200">{i + 1}. {q}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(i, true)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${answers[i] === true ? "bg-teal-500/30 text-teal-200" : "bg-white/5 text-gray-400"}`}
                >
                  {t.yes}
                </button>
                <button
                  onClick={() => toggle(i, false)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${answers[i] === false ? "bg-red-500/25 text-red-300" : "bg-white/5 text-gray-400"}`}
                >
                  {t.no}
                </button>
              </div>
            </div>
          ))}
        </div>

        {allAnswered && (
          <div className="mt-5 rounded-xl border p-4 text-center" style={{ borderColor: `${resultColor}40`, backgroundColor: `${resultColor}10` }}>
            <p className="text-lg font-bold" style={{ color: resultColor }}>{yesCount}/7 — {resultText}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-white/10 py-2 text-sm text-gray-400 hover:bg-white/5"
        >
          {t.close}
        </button>
      </div>
    </div>
  )
}

function MiniTest({ t }: { t: typeof T["ru"]["learning"]["miniTest"] }) {
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = t.questions[qIdx]

  const choose = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.correct) setScore((s) => s + 1)
  }

  const next = () => {
    if (qIdx < t.questions.length - 1) {
      setQIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6 text-center">
        <div className="mb-3 text-4xl">🎉</div>
        <p className="text-lg font-bold text-teal-300">{t.result}</p>
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${RISK_COLORS.teal}, ${RISK_COLORS.cyan})` }}
        >
          {t.nextModule}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-teal-400">{t.label}</span>
        <span className="text-xs text-gray-500">{qIdx + 1} / {t.questions.length}</span>
      </div>

      <Card className="p-5">
        <p className="font-medium text-gray-100">{q.q}</p>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => {
            let cls = "border-white/10 bg-black/20 text-gray-300"
            if (answered) {
              if (i === q.correct) cls = "border-teal-500/50 bg-teal-500/10 text-teal-200"
              else if (i === selected) cls = "border-red-500/50 bg-red-500/10 text-red-300"
              else cls = "border-white/5 bg-black/10 text-gray-500"
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3">
            <p className="text-xs leading-relaxed text-gray-400">{q.explanation}</p>
          </div>
        )}

        {answered && (
          <button
            onClick={next}
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${RISK_COLORS.teal}, ${RISK_COLORS.cyan})` }}
          >
            {qIdx < t.questions.length - 1 ? t.next : t.finish}
          </button>
        )}
      </Card>
    </div>
  )
}

function LearningHub({ t }: { t: typeof T["ru"] }) {
  const lt = t.learning
  const [activeFilter, setActiveFilter] = useState(0)
  const [completedCards, setCompletedCards] = useState<number[]>([0, 1])
  const [exerciseOpen, setExerciseOpen] = useState(false)

  const streakDays = 3

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {exerciseOpen && (
        <ExerciseModal t={lt.exerciseModal} onClose={() => setExerciseOpen(false)} />
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{lt.title}</h1>
          <p className="mt-1 text-sm text-gray-400">{lt.subtitle}</p>
        </div>
        <span className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-300">
          {lt.progress}
        </span>
      </header>

      {/* Streak bar */}
      <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-orange-400" />
          <p className="font-semibold text-white">{lt.streak}</p>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const filled = i < streakDays
            const today = i === streakDays
            return (
              <div
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  today
                    ? "ring-2 ring-teal-400 ring-offset-1 ring-offset-[#0b1220]"
                    : ""
                }`}
                style={{
                  backgroundColor: filled || today ? RISK_COLORS.teal : "#ffffff10",
                  color: filled || today ? "#fff" : "#6b7280",
                }}
              >
                {filled ? "✓" : i + 1}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {lt.filters.map((f, i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(i)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
              activeFilter === i
                ? "border border-teal-400 bg-teal-500/10 text-teal-300"
                : "border border-white/10 bg-white/5 text-gray-400 hover:border-teal-500/40 hover:text-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Featured card */}
      <Card className="flex flex-col gap-4 border-teal-500/40 p-5 sm:flex-row" style={{ background: "linear-gradient(135deg, #0d1e35 0%, #0b1428 100%)" }}>
        <a
          href="https://youtu.be/UoAycSxS3q4?si=bHpJw0PAt9w3zEWh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-28 w-full flex-shrink-0 items-center justify-center rounded-xl bg-black/40 sm:w-48"
          aria-label="Watch on YouTube"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </a>
        <div className="flex flex-col justify-center gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
            {lt.featuredBadge}
          </span>
          <a
            href="https://youtu.be/UoAycSxS3q4?si=bHpJw0PAt9w3zEWh"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold leading-snug text-white hover:text-teal-300"
          >
            {lt.featuredTitle}
          </a>
          <p className="text-xs text-gray-500">{lt.featuredMeta}</p>
        </div>
      </Card>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {lt.cards.map((card, i) => {
          const isDone = completedCards.includes(i)
          return (
            <Card
              key={i}
              className={`flex flex-col gap-3 p-5 ${card.exercise ? "cursor-pointer hover:border-amber-500/40" : ""}`}
              onClick={card.exercise ? () => setExerciseOpen(true) : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                    style={{ color: card.typeColor, backgroundColor: `${card.typeColor}20` }}
                  >
                    {card.type}
                  </span>
                  <span className="text-xs text-gray-500">{card.level}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompletedCards((prev) =>
                      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                    )
                  }}
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                  className="flex-shrink-0"
                >
                  {isDone
                    ? <CheckCircle2 className="h-5 w-5 text-teal-400" />
                    : <Circle className="h-5 w-5 text-gray-600" />
                  }
                </button>
              </div>

              <div>
                <p className="font-semibold leading-snug text-gray-100">{card.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{card.desc}</p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-xs text-gray-600">{card.time}</span>
                {card.href ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                    <Play className="h-3 w-3" />
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Mini-test */}
      <MiniTest t={lt.miniTest} />
    </div>
  )
}
