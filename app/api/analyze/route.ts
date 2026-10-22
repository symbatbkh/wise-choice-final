import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"
export const maxDuration = 120

const emptyTrigger = { found: false, intensity: 0, quote: "" }

const scoreSchema = z.preprocess(
  (value) => typeof value === "string" ? Number(value.replace(",", ".")) : value,
  z.number().min(0).max(100),
)

const amountSchema = z.preprocess((value) => {
  if (value == null || value === "") return null
  if (typeof value === "number") return value
  const parsed = Number(String(value).replace(/[^\d.,]/g, "").replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}, z.number().nonnegative().nullable())

const currencySchema = z.preprocess((value) => {
  if (value == null || value === "") return null
  const normalized = String(value).trim().toUpperCase()
  if (["₸", "ТЕНГЕ", "ТГ", "KZT"].includes(normalized)) return "KZT"
  if (["₽", "РУБ", "RUB"].includes(normalized)) return "RUB"
  if (["$", "USD"].includes(normalized)) return "USD"
  if (["€", "EUR"].includes(normalized)) return "EUR"
  return normalized
}, z.enum(["KZT", "RUB", "USD", "EUR"]).nullable()).catch(null)

const triggerSchema = z.object({
  found: z.preprocess((value) => value === "true" ? true : value === "false" ? false : value, z.boolean()).catch(false),
  intensity: z.preprocess((value) => typeof value === "string" ? Number(value) : value, z.number().min(0).max(1)).catch(0),
  quote: z.coerce.string().catch(""),
}).catch(emptyTrigger)

const analysisSchema = z.preprocess((value) => {
  const raw = value && typeof value === "object" ? value as Record<string, any> : {}
  const triggers = raw.triggers && typeof raw.triggers === "object" ? raw.triggers : {}
  return {
    ...raw,
    courseTitle: raw.courseTitle ?? raw.course_title ?? "",
    courseSubject: raw.courseSubject ?? raw.course_subject ?? raw.category ?? "",
    coursePrice: raw.coursePrice ?? raw.course_price ?? { amount: raw.price ?? null, currency: raw.currency ?? null },
    verdict_kk: raw.verdict_kk ?? raw.verdictKz ?? "",
    verdict_ru: raw.verdict_ru ?? raw.verdictRu ?? "",
    triggers: {
      anchoring: triggers.anchoring,
      socialProof: triggers.socialProof ?? triggers.social_proof,
      halo: triggers.halo ?? triggers.halo_effect,
      fomo: triggers.fomo,
      scarcity: triggers.scarcity,
      lossAversion: triggers.lossAversion ?? triggers.loss_aversion,
    },
  }
}, z.object({
  qQuality: scoreSchema,
  pPriceAnomaly: scoreSchema,
  rRisk: scoreSchema,
  aAltCost: scoreSchema,
  courseTitle: z.coerce.string().catch(""),
  courseSubject: z.coerce.string().catch(""),
  coursePrice: z.object({ amount: amountSchema, currency: currencySchema }).catch({ amount: null, currency: null }),
  triggers: z.object({
    anchoring: triggerSchema,
    socialProof: triggerSchema,
    halo: triggerSchema,
    fomo: triggerSchema,
    scarcity: triggerSchema,
    lossAversion: triggerSchema,
  }),
  verdict_kk: z.coerce.string().catch(""),
  verdict_ru: z.coerce.string().catch(""),
}))

const comparisonSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(["KZT", "RUB", "USD", "EUR"]),
  url: z.string().url().optional(),
})

const comparisonResponseSchema = z.object({ comparisons: z.array(comparisonSchema).max(8) })

const triggerJsonSchema = {
  type: "object",
  required: ["found", "intensity", "quote"],
  properties: {
    found: { type: "boolean" },
    intensity: { type: "number", minimum: 0, maximum: 1 },
    quote: { type: "string" },
  },
}

const analysisJsonSchema = {
  type: "object",
  required: ["qQuality", "pPriceAnomaly", "rRisk", "aAltCost", "courseTitle", "courseSubject", "coursePrice", "triggers", "verdict_kk", "verdict_ru"],
  properties: {
    qQuality: { type: "number", minimum: 0, maximum: 100 },
    pPriceAnomaly: { type: "number", minimum: 0, maximum: 100 },
    rRisk: { type: "number", minimum: 0, maximum: 100 },
    aAltCost: { type: "number", minimum: 0, maximum: 100 },
    courseTitle: { type: "string" },
    courseSubject: { type: "string" },
    coursePrice: {
      type: "object",
      required: ["amount", "currency"],
      properties: {
        amount: { anyOf: [{ type: "number", minimum: 0 }, { type: "null" }] },
        currency: { anyOf: [{ type: "string", enum: ["KZT", "RUB", "USD", "EUR"] }, { type: "null" }] },
      },
    },
    triggers: {
      type: "object",
      required: ["anchoring", "socialProof", "halo", "fomo", "scarcity", "lossAversion"],
      properties: {
        anchoring: triggerJsonSchema,
        socialProof: triggerJsonSchema,
        halo: triggerJsonSchema,
        fomo: triggerJsonSchema,
        scarcity: triggerJsonSchema,
        lossAversion: triggerJsonSchema,
      },
    },
    verdict_kk: { type: "string" },
    verdict_ru: { type: "string" },
  },
}

const comparisonJsonSchema = {
  type: "object",
  required: ["comparisons"],
  properties: {
    comparisons: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        required: ["name", "provider", "amount", "currency", "url"],
        properties: {
          name: { type: "string" },
          provider: { type: "string" },
          amount: { type: "number", minimum: 0 },
          currency: { type: "string", enum: ["KZT", "RUB", "USD", "EUR"] },
          url: { type: "string" },
        },
      },
    },
  },
}

class GeminiError extends Error {
  constructor(public status: number, public detail = "") {
    super(`Gemini API error: ${status}${detail ? ` — ${detail}` : ""}`)
  }
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

function extractText(payload: any): string {
  return (payload?.candidates?.[0]?.content?.parts ?? [])
    .map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim()
}

function parseJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1))
    throw new SyntaxError("Gemini response does not contain JSON")
  }
}

async function callGemini(apiKey: string, model: string, body: unknown) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 55_000)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    )
    if (!response.ok) {
      const providerBody = await response.text()
      let detail = providerBody.slice(0, 400)
      try {
        detail = JSON.parse(providerBody)?.error?.message?.slice(0, 400) ?? detail
      } catch {}
      throw new GeminiError(response.status, detail)
    }
    return response.json()
  } finally {
    clearTimeout(timer)
  }
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
}

async function findComparableCourses(apiKey: string, model: string, course: z.infer<typeof analysisSchema>) {
  if (!course.courseSubject.trim()) return { comparisons: [], sources: [], searchQueries: [] }

  const prompt = `Сегодня ${new Date().toISOString().slice(0, 10)}. ОБЯЗАТЕЛЬНО выполни Google Search и найди актуальные цены на 3–8 реально продающихся онлайн-курсов, максимально точно совпадающих с этим предложением.
Название: ${course.courseTitle || "не указано"}
Тема: ${course.courseSubject}
Цена: ${course.coursePrice.amount ?? "не указана"} ${course.coursePrice.currency ?? ""}

Сначала ищи курсы с той же узкой темой, уровнем, аудиторией, форматом и рынком/языком. Не подменяй их общими курсами из более широкой категории. Исключи само проверяемое предложение. Бери только официальные страницы курса или надёжные страницы продажи, где прямо видна актуальная полная цена. Не используй ежемесячный платёж рассрочки. Если валюта проверяемого курса известна, ищи цены в этой валюте. URL должен вести на страницу, подтверждающую название и цену. Не выдумывай результаты: если точных аналогов мало, верни меньше элементов.`

  let payload: any = null
  let lastError: unknown = null
  let usedSearchModel = model
  const searchModels = [...new Set([model, "gemini-2.5-flash"])]

  for (const searchModel of searchModels) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        payload = await callGemini(apiKey, searchModel, {
          contents: [{ role: "user", parts: [{ text: `${prompt}\nВерни результат только как JSON с массивом comparisons: name, provider, amount, currency, url.` }] }],
          tools: [{ google_search: {} }],
        })
        usedSearchModel = searchModel
        break
      } catch (error) {
        lastError = error
        if (!(error instanceof GeminiError) || ![400, 404, 429, 500, 503].includes(error.status)) throw error
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
    if (payload) break
  }

  if (!payload) throw lastError instanceof Error ? lastError : new Error("Google Search недоступен")

  const groundedText = extractText(payload)
  let parsedResult: unknown
  try {
    parsedResult = parseJson(groundedText)
  } catch {
    const normalizedPayload = await callGemini(apiKey, usedSearchModel, {
      contents: [{
        role: "user",
        parts: [{ text: `Преобразуй найденные через Google данные ниже в JSON. Не добавляй курсы, цены или ссылки, которых нет в исходных данных.\n\n${groundedText}` }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: comparisonJsonSchema,
      },
    })
    parsedResult = parseJson(extractText(normalizedPayload))
  }

  const parsed = comparisonResponseSchema.parse(parsedResult)
  const seen = new Set<string>()
  const comparisons = parsed.comparisons.filter((item) => {
    if (course.coursePrice.currency && item.currency !== course.coursePrice.currency) return false
    const key = `${item.provider}|${item.name}|${item.amount}|${item.currency}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const metadata = payload?.candidates?.[0]?.groundingMetadata
  const groundedSources = (metadata?.groundingChunks ?? [])
    .map((chunk: any) => chunk?.web)
    .filter((web: any) => web?.uri && web?.title)
    .map((web: any) => ({ title: String(web.title), url: String(web.uri) }))
  const comparisonSources = comparisons
    .filter((item) => item.url)
    .map((item) => ({ title: `${item.provider} — ${item.name}`, url: item.url as string }))
  const sources = [...groundedSources, ...comparisonSources]
    .filter((source, index, all) => all.findIndex((item) => item.url === source.url) === index)
  const searchQueries = (metadata?.webSearchQueries ?? []).map(String)

  return { comparisons, sources, searchQueries }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const text = typeof body?.text === "string" ? body.text.trim() : ""
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : ""
    const apiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash"

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY не настроен на сервере", code: "GEMINI_NOT_CONFIGURED" }, { status: 503 })
    }
    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Добавьте текст или изображение для анализа" }, { status: 400 })
    }

    const systemPrompt = `Ты — семантический эксперт проекта Wise Choice (НИШ ФМН г. Актобе). Оцени рекламу онлайн-курса.
qQuality — доказанное качество; pPriceAnomaly — несоответствие цены доказанной ценности; rRisk — риск потери денег; aAltCost — доступность дешёвых альтернатив. Все показатели 0..100.
Найди триггеры anchoring, socialProof, halo, fomo, scarcity, lossAversion. Извлеки полную цену и валюту KZT/RUB/USD/EUR. courseSubject должен быть пригоден для поиска похожих курсов.
Критическое правило: физически невозможное или сверхъестественное обещание означает qQuality=0 и rRisk не ниже 90. «Научим человека летать» без самолёта, параплана, подготовки пилотов или реальной авиационной дисциплины — невозможное обещание. Высокая цена не доказывает качество.
Цитаты бери только из входного текста. Если триггера нет: found=false, intensity=0, quote="".
Верни только JSON со всеми полями: qQuality, pPriceAnomaly, rRisk, aAltCost, courseTitle, courseSubject, coursePrice {amount, currency}, triggers {anchoring, socialProof, halo, fomo, scarcity, lossAversion}, verdict_kk, verdict_ru. Каждый триггер содержит found, intensity, quote.`

    const userContent: any[] = [{ text: `Оцени это предложение:\n${text || "Текст находится на изображении"}` }]
    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
      userContent.push({ inlineData: { mimeType: match?.[1] ?? "image/jpeg", data: match?.[2] ?? imageBase64 } })
    }

    let geminiPayload: any = null
    let analysisProviderError: unknown = null
    const analysisModels = [...new Set([model, "gemini-2.5-flash"])]

    for (const analysisModel of analysisModels) {
      const requestBodies = [
        {
          contents: [{ role: "user", parts: userContent }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json", responseJsonSchema: analysisJsonSchema },
        },
        {
          contents: [{ role: "user", parts: userContent }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" },
        },
      ]

      for (const requestBody of requestBodies) {
        try {
          geminiPayload = await callGemini(apiKey, analysisModel, requestBody)
          break
        } catch (error) {
          analysisProviderError = error
          if (!(error instanceof GeminiError) || ![400, 404, 429, 500, 503].includes(error.status)) throw error
        }
      }
      if (geminiPayload) break
    }

    if (!geminiPayload) {
      throw analysisProviderError instanceof Error ? analysisProviderError : new Error("Gemini analysis unavailable")
    }
    const rawParsed = analysisSchema.parse(parseJson(extractText(geminiPayload)))

    // Исходные коэффициенты и пороги формул сохранены без изменений.
    const weights: Record<string, number> = {
      anchoring: 0.273, socialProof: 0.239, halo: 0.239,
      fomo: 0.137, scarcity: 0.077, lossAversion: 0.034,
    }
    const gamma = 0.34
    let rawIMP = 0
    const detectedTriggers: { name: string; level: string; quote: string }[] = []
    for (const [key, alpha] of Object.entries(weights)) {
      const trigger = rawParsed.triggers[key as keyof typeof rawParsed.triggers]
      if (trigger.found) {
        rawIMP += alpha * (1 + gamma * (trigger.intensity || 0.8))
        detectedTriggers.push({
          name: key.toUpperCase(),
          level: alpha >= 0.2 ? "CRITICAL" : alpha >= 0.1 ? "HIGH" : "MEDIUM",
          quote: trigger.quote || "Обнаружен триггер манипуляции",
        })
      }
    }
    const imp = Number(Math.min(10, rawIMP * 9.5).toFixed(1))

    let market = { comparisons: [] as z.infer<typeof comparisonSchema>[], sources: [] as { title: string; url: string }[], searchQueries: [] as string[] }
    let priceSearchError: string | null = null
    try {
      market = await findComparableCourses(apiKey, model, rawParsed)
      if (!market.comparisons.length) {
        priceSearchError = "Google Search не нашёл подтверждённых цен на достаточно похожие курсы"
      }
    } catch (error) {
      console.warn("Price comparison search failed:", error instanceof Error ? error.message : error)
      priceSearchError = error instanceof GeminiError
        ? `Gemini Google Search отклонил запрос (${error.status})`
        : "Не удалось получить подтверждённые цены через Gemini Google Search"
    }

    const prices = market.comparisons.map((item) => item.amount)
    const medianPrice = median(prices)
    const deviation = standardDeviation(prices)
    const targetPrice = rawParsed.coursePrice.amount
    const zScore = targetPrice !== null && deviation && deviation > 0
      ? Number(((targetPrice - (medianPrice ?? 0)) / deviation).toFixed(2))
      : null
    // Та же исходная логика analyzer.ts: при z > 1.8 показатель P равен 85, иначе 30.
    const priceAnomaly = zScore === null ? rawParsed.pPriceAnomaly : zScore > 1.8 ? 85 : 30

    const qNorm = (rawParsed.qQuality ?? 20) / 100
    const pNorm = priceAnomaly / 100
    const rNorm = (rawParsed.rRisk ?? 30) / 100
    const aNorm = (rawParsed.aAltCost ?? 60) / 100
    const cvf = Number((0.266 * qNorm - 0.246 * pNorm - 0.227 * rNorm - 0.261 * aNorm).toFixed(2))
    const bayesianTrust = Math.round(Math.max(10, Math.min(95, qNorm * 100 - rNorm * 40 + 20)))
    const zVal = (cvf * 2.8) * Math.max(0.1, 1 - imp / 10) * (bayesianTrust / 100)
    let idp = Math.round(100 * sigmoid(zVal))
    if (rawParsed.rRisk >= 85) idp = Math.min(idp, 18)
    if (rawParsed.qQuality >= 75 && imp <= 4) idp = Math.max(idp, 78)

    return NextResponse.json({
      idp, cvf, imp, bayesian_trust: bayesianTrust,
      verdict_kk: rawParsed.verdict_kk, verdict_ru: rawParsed.verdict_ru,
      triggers: detectedTriggers,
      quality: rawParsed.qQuality, price_anomaly: priceAnomaly,
      risk: rawParsed.rRisk, alt_cost: rawParsed.aAltCost,
      cvf_metrics: {
        qQuality: rawParsed.qQuality, pPriceAnomaly: priceAnomaly,
        rRisk: rawParsed.rRisk, aAltCost: rawParsed.aAltCost,
      },
      price_stats: {
        extractedPrice: targetPrice,
        currency: rawParsed.coursePrice.currency,
        medianPrice,
        zScore,
        isAnomaly: zScore === null ? null : zScore > 1.8,
        comparisons: market.comparisons,
        sources: market.sources,
        searchQueries: market.searchQueries,
        searchError: priceSearchError,
        searchedAt: market.comparisons.length ? new Date().toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Analysis Pipeline Error:", error)
    if (error instanceof GeminiError) {
      return NextResponse.json({
        error: "Gemini API не выполнил запрос",
        code: "GEMINI_API_ERROR",
        providerStatus: error.status,
        providerMessage: error.detail,
      }, { status: 502 })
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "Gemini вернул ответ в неверном формате", code: "INVALID_GEMINI_RESPONSE" }, { status: 502 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ошибка пайплайна" }, { status: 500 })
  }
}

