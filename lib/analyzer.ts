// =====================================================================
// WISE CHOICE: ЭКОНОМИКО-МАТЕМАТИЧЕСКИЙ ДВИЖОК АНАЛИЗА (v2.1 Precision)
// Авторы: Баяхметова Инабат (НИШ ФМН г. Актобе)
// Модели: Канеман (Prospect Theory), Чалдини (IMP), Зейтамль (CVF), IDP
// =====================================================================

export interface TriggerResult {
  id: string;
  nameKz: string;
  nameRu: string;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  alpha: number;
  found: boolean;
  intensity: number;
  quote?: string;
  description: string;
}

export interface AnalysisOutput {
  idp: number; // [0..100]
  categoryName: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  recommendationKz: string;
  recommendationRu: string;
  impScore: number; // [0..10]
  cvfScore: number; // [-1..+1]
  bayesianTrust: number; // [0..100%]
  cvfMetrics: {
    qQuality: number;
    pPriceAnomaly: number;
    rRisk: number;
    aAltCost: number;
  };
  priceStats: {
    extractedPrice: number | null;
    medianPrice: number;
    zScore: number;
    isAnomaly: boolean;
  };
  triggers: TriggerResult[];
  detectedTriggersCount: number;
}

function cleanOCRText(raw: string): string {
  return raw
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s%₸₽$.,\-–—]/gu, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function extractPrice(text: string): number | null {
  const match = text.match(/(\d[\d\s.,]{3,})\s*(тг|тенге|₸|руб|₽|\$)/i);
  if (match) {
    const cleanNum = match[1].replace(/[\s.,]/g, '');
    const val = parseInt(cleanNum, 10);
    return isNaN(val) ? null : val;
  }
  return null;
}

export function analyzeOffer(rawText: string, manualPrice?: number): AnalysisOutput {
  const text = cleanOCRText(rawText);

  // --- 1. ПРИЗНАКИ РЕАЛЬНОГО ОБРАЗОВАНИЯ (EDTECH СИГНАЛЫ) ---
  // Наличие силлабуса, домашних заданий, академических часов, дипломов
  const academicPatterns = [
    /(силлабус|программа курса|оқу бағдарламасы|учебный план|модул|сабақ)/i,
    /(домашн.*задан|үй жұмысы|тесты|практическ.*задан|проверка дз|куратор)/i,
    /(академическ.*час|сағат|недел|апта|месяц.*обучен|ай оқу)/i,
    /(сертификат|диплом|лицензия|аккредитац|тоо|ооо|ип|договор|оферта|келісімшарт)/i,
    /(преподаватель|оқытушы|спикер|профессор|phd|celta|эксперт с опытом)/i
  ];
  let academicScore = 0;
  academicPatterns.forEach(p => {
    if (p.test(text)) academicScore += 20;
  });

  // --- 2. ПРИЗНАКИ ТОКСИЧНОГО ИНФОСКАМА (HARD SCAM FLAGS) ---
  // Обещания быстрых легких денег, эзотерика, сомнительные схемы
  const scamFlags = [
    /(выйди на доход|заработай от|табысқа шық|айына \d+.*(тг|тенге|руб|\$)|рубить бабло|пассивн.*доход)/i,
    /(без опыта|без вложений|с нуля до миллиона|ештеңе істемей|лежа на пляже|на автомате|100% кепілдік|гарантия окупаемости)/i,
    /(денежн.*поток|денежный код|энерги.*изобили|квантов.*мышлени|пробитие потолка|родовые программ|матрица судьбы|астролог)/i,
    /(пиши в директ|жаз direct|ссылка в шапке|перевод на карту|kaspi gold|каспи голд)/i,
    /(секретн.*алгоритм|каспи алгоритм|дропшиппинг под ключ|схема заработка|крипта без риска)/i
  ];
  let hardScamCount = 0;
  scamFlags.forEach(p => {
    if (p.test(text)) hardScamCount++;
  });

  // --- 3. СТАНДАРТНЫЕ МАРКЕТИНГОВЫЕ ТРИГГЕРЫ (ЧАЛДИНИ) ---
  const triggers: TriggerResult[] = [
    {
      id: 'anchoring',
      nameKz: 'Зәкір эффектісі (Anchoring)',
      nameRu: 'Эффект якоря (Псевдоскидка)',
      category: 'HIGH',
      alpha: 0.273,
      found: false,
      intensity: 0,
      description: 'Жасанды жеңілдіктер мен сызылған бағалар.'
    },
    {
      id: 'social_proof',
      nameKz: 'Әлеуметтік дәлелдеме (Social Proof)',
      nameRu: 'Социальное доказательство',
      category: 'HIGH',
      alpha: 0.239,
      found: false,
      intensity: 0,
      description: '«Мыңдаған риза қатысушылар», күмәнді пікірлер.'
    },
    {
      id: 'halo_effect',
      nameKz: 'Halo-эффект (Жалған бедел)',
      nameRu: 'Эффект ореола (Ложный авторитет)',
      category: 'HIGH',
      alpha: 0.239,
      found: false,
      intensity: 0,
      description: 'Блогерлердің байлығы мен табысты өмірі арқылы сату.'
    },
    {
      id: 'fomo',
      nameKz: 'FOMO (Жіберіп алу қорқынышы)',
      nameRu: 'FOMO (Искусственная спешка)',
      category: 'CRITICAL',
      alpha: 0.137,
      found: false,
      intensity: 0,
      description: 'Кері санақ таймерлері, бағаның тез өсуі туралы қысым.'
    },
    {
      id: 'scarcity',
      nameKz: 'Тапшылық эффектісі (Scarcity)',
      nameRu: 'Эффект дефицита (Ограничение мест)',
      category: 'CRITICAL',
      alpha: 0.077,
      found: false,
      intensity: 0,
      description: '«Тек 2-3 орын қалды», «жабық VIP клуб» шектеулері.'
    },
    {
      id: 'loss_aversion',
      nameKz: 'Шығын аверсиясы (Loss Aversion)',
      nameRu: 'Неприятие потери (Loss Aversion)',
      category: 'MEDIUM',
      alpha: 0.034,
      found: false,
      intensity: 0,
      description: '«Упущенная выгода», ақша жоғалту қорқынышымен айла жасау.'
    }
  ];

  // Проверка триггеров
  const anchorMatch = text.match(/(вместо|орнына|бұрын|скидк|жеңіл|женил|старая цена|ескі баға|\d{1,2}%\s*(off|скид|жең))/i);
  if (anchorMatch) {
    triggers[0].found = true;
    triggers[0].intensity = 0.8;
    triggers[0].quote = anchorMatch[0];
  }

  const socialMatch = text.match(/(мың|тысяч|1000\+|10\s*000|чат разрыв|бәрі сатып|кейс|миллион просмотров)/i);
  if (socialMatch) {
    triggers[1].found = true;
    triggers[1].intensity = 0.75;
    triggers[1].quote = socialMatch[0];
  }

  const haloMatch = text.match(/(блогер|наставник|секрет|құпия|forbes|байлық|авторлық|vip-клуб|инвестор|богатство|миллионер)/i);
  if (haloMatch) {
    triggers[2].found = true;
    triggers[2].intensity = 0.85;
    triggers[2].quote = haloMatch[0];
  }

  const fomoMatch = text.match(/(успей|үлгер|таймер|только сегодня|тек бүгін|соңғы сағат|24 часа|жабылады|баға өсед|цена выраст|\d{1,2}:\d{2}:\d{2})/i);
  if (fomoMatch) {
    triggers[3].found = true;
    triggers[3].intensity = 0.95;
    triggers[3].quote = fomoMatch[0];
  }

  const scarcityMatch = text.match(/(орын қалд|остал.*мест|строго для|шектеулі|лимит|взяли еще|соңғы \d|последн.*мест|іріктеу)/i);
  if (scarcityMatch) {
    triggers[4].found = true;
    triggers[4].intensity = 0.9;
    triggers[4].quote = scarcityMatch[0];
  }

  const lossMatch = text.match(/(упущен|жоғалт|промедлен|шығын|убыт|слива|айырыл|не теряй шанс)/i);
  if (lossMatch) {
    triggers[5].found = true;
    triggers[5].intensity = 0.7;
    triggers[5].quote = lossMatch[0];
  }

  // Расчет IMP
  const gamma = 0.34;
  let rawIMP = 0;
  let detectedCount = 0;
  triggers.forEach(t => {
    if (t.found) {
      detectedCount++;
      rawIMP += t.alpha * 1 * (1 + gamma * t.intensity);
    }
  });
  const impScore = Number(Math.min(10, rawIMP * 9.5).toFixed(1));

  // --- 4. БАЙЕСОВСКИЙ БАЛЛ ДОВЕРИЯ B(q) ---
  let bayesianTrust = 50;
  if (academicScore >= 40) {
    bayesianTrust = Math.min(92, 60 + academicScore * 0.35);
  } else if (hardScamCount >= 2) {
    bayesianTrust = Math.max(12, 35 - hardScamCount * 10);
  } else if (detectedCount >= 3) {
    bayesianTrust = 40;
  }

  // --- 5. ЦЕНОВОЙ АНАЛИЗ И CVF ---
  const foundPrice = manualPrice || extractPrice(rawText) || 45000;
  const marketMedian = 35000;
  const zScore = Number(((foundPrice - marketMedian) / 25000).toFixed(2));
  const isPriceAnomaly = zScore > 1.8;

  const qQuality = Math.max(10, Math.min(95, academicScore + 20 - hardScamCount * 25));
  const pPriceAnomaly = isPriceAnomaly ? 85 : 30;
  const rRisk = Math.min(95, Math.max(15, hardScamCount * 30 + detectedCount * 8 - (academicScore > 40 ? 30 : 0)));
  const aAltCost = 55;

  const cvfScore = Number(
    (
      0.266 * (qQuality / 100) -
      0.246 * (pPriceAnomaly / 100) -
      0.227 * (rRisk / 100) -
      0.261 * (aAltCost / 100)
    ).toFixed(2)
  );

  // --- 6. ИТОГОВАЯ КАЛИБРОВКА IDP (Разделение EdTech и Инфоцыган) ---
  let idp = 50;

  // Случай А: Настоящий скам (обещания миллионов, эзотерика, нет структуры)
  if (hardScamCount >= 2 || (hardScamCount >= 1 && detectedCount >= 2 && academicScore < 20)) {
    idp = Math.max(14, Math.min(32, 40 - hardScamCount * 10 - impScore * 1.5));
  }
  // Случай Б: Легитимный EdTech со скидками (Skillbox и др.)
  else if (academicScore >= 40) {
    // Академическая база держит курс в зеленой/желтой зоне, несмотря на скидки
    idp = Math.max(58, Math.min(88, academicScore + 25 - impScore * 3.5));
  }
  // Случай В: Нейтральное/обычное предложение
  else {
    idp = Math.max(35, Math.min(78, 65 - impScore * 4.2 + (academicScore > 0 ? 10 : 0)));
  }

  idp = Math.round(idp);

  // Определение категории и текстов
  let categoryName = 'Орташа тәуекел';
  let color: AnalysisOutput['color'] = 'yellow';
  let recommendationKz = 'Стандартты маркетингтік қысым бар. Салыстырып көріңіз.';
  let recommendationRu = 'Присутствуют маркетинговые уловки, но есть и образовательная база.';

  if (idp >= 78) {
    categoryName = 'Жоғары адалдық';
    color = 'green';
    recommendationKz = 'Манипуляция белгілері жоқ. Тексерілген сапалы ұсыныс.';
    recommendationRu = 'Честное академическое предложение с прозрачной программой.';
  } else if (idp >= 55) {
    categoryName = 'Орташа тәуекел';
    color = 'yellow';
    recommendationKz = 'Агрессивті маркетинг (жеңілдік/таймер), бірақ оқу бағдарламасы бар.';
    recommendationRu = 'Умеренный риск: классический маркетинг EdTech. Изучите силлабус перед оплатой.';
  } else if (idp >= 33) {
    categoryName = 'Жоғары тәуекел';
    color = 'orange';
    recommendationKz = 'Манипуляция басым. Сапалық сипаттамалар аз көрсетілген.';
    recommendationRu = 'Высокий риск: много обещаний и триггеров, мало конкретики по обучению.';
  } else {
    categoryName = 'Сыни тәуекел';
    color = 'red';
    recommendationKz = 'Инфоалдау және күмәнді уәделер! Сатып алу өте қауіпті.';
    recommendationRu = 'Критический риск: признаки инфомошенничества и продажи воздуха!';
  }

  return {
    idp,
    categoryName,
    color,
    recommendationKz,
    recommendationRu,
    impScore,
    cvfScore,
    bayesianTrust,
    cvfMetrics: {
      qQuality,
      pPriceAnomaly,
      rRisk,
      aAltCost
    },
    priceStats: {
      extractedPrice: foundPrice,
      medianPrice: marketMedian,
      zScore,
      isAnomaly: isPriceAnomaly
    },
    triggers,
    detectedTriggersCount: detectedCount
  };
}