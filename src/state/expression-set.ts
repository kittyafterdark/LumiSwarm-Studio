const EXPRESSION_BASICS = [
  ["neutral", "neutral expression, relaxed eyebrows, closed mouth"],
  ["joy", "joyful smile, bright eyes, raised cheeks"],
  ["sadness", "sad expression, downcast eyes, corners of mouth turned down"],
  ["anger", "angry glare, furrowed brows, tight mouth"],
  ["surprise", "wide eyes, raised eyebrows, open mouth"],
  ["fear", "tense face, wide eyes, brows drawn together"],
] as const

const EXPRESSION_SPREAD = [
  ...EXPRESSION_BASICS,
  ["amusement", "amused grin, one eyebrow raised, eyes crinkling"],
  ["annoyance", "side glance, lowered eyebrows, pursed lips"],
  ["approval", "warm approving smile, relaxed eyes"],
  ["confusion", "tilted head, one brow raised, slightly open mouth"],
  ["curiosity", "attentive gaze, raised eyebrows, lips slightly parted"],
  ["determination", "focused gaze, firm mouth, brows slightly drawn"],
  ["disappointment", "lowered gaze, lips pressed together"],
  ["disgust", "wrinkled nose, curled upper lip, narrowed eyes"],
  ["embarrassment", "blushing cheeks, averted gaze, awkward smile"],
  ["excitement", "wide grin, luminous eyes, raised eyebrows"],
  ["grief", "teary eyes, eyebrows lifted at the center, trembling lips"],
  ["pride", "chin slightly raised, confident smile"],
  ["relief", "eyes gently closed, relaxed brows, soft smile"],
  ["suspicion", "narrowed eyes, one eyebrow lifted, tight mouth"],
] as const

const EXPRESSION_CUSTOM_LIMIT = 24
const EXPRESSION_DEFAULT_RECIPE = { width: 768, height: 768, steps: 24 }
const EXPRESSION_DEFAULT_PREFIX = "solo, head and shoulders portrait, facing viewer, plain background"
const EXPRESSION_PROMPT_LIMIT = 4000
const EXPRESSION_DIRECTION_LIMIT = 1000

interface StudioExpressionGeneration {
  recipe: GenerationRecipe
  prefix: string
  negative: string
}

interface StudioExpressionSet {
  slots: Array<{ label: string; direction: string }>
  selected: string[]
  generation: StudioExpressionGeneration
}

function cleanExpressionLabel(value: unknown): string {
  const label = typeof value === "string" ? value.trim() : ""
  return label.length <= 40 && /^[\p{L}\p{N}][\p{L}\p{N} _'-]*$/u.test(label) ? label : ""
}

function cleanExpressionGeneration(value: unknown): StudioExpressionGeneration {
  const input = recipeRecord(value)
  return {
    recipe: sanitizeGenerationRecipe(input.recipe),
    prefix: typeof input.prefix === "string" ? input.prefix.slice(0, EXPRESSION_PROMPT_LIMIT) : EXPRESSION_DEFAULT_PREFIX,
    negative: typeof input.negative === "string" ? input.negative.slice(0, EXPRESSION_PROMPT_LIMIT) : "",
  }
}

function cleanStudioExpressionSet(value: unknown): StudioExpressionSet {
  const input = recipeRecord(value)
  const slots = new Map<string, StudioExpressionSet["slots"][number]>(
    EXPRESSION_SPREAD.map(([label, direction]) => [label, { label, direction }]),
  )
  for (const raw of Array.isArray(input.slots) ? input.slots.slice(0, EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT) : []) {
    const slot = recipeRecord(raw)
    const label = cleanExpressionLabel(slot.label)
    const key = label.toLowerCase()
    const existing = slots.get(key)
    if (!label || typeof slot.direction !== "string") continue
    slots.set(key, { label: existing?.label || label, direction: slot.direction.slice(0, EXPRESSION_DIRECTION_LIMIT) })
  }
  const selected = Array.isArray(input.selected) ? input.selected : EXPRESSION_BASICS.map(([label]) => label)
  return {
    slots: [...slots.values()],
    selected: [...new Set(selected.slice(0, slots.size).filter((label): label is string => typeof label === "string" && slots.has(label)))],
    generation: cleanExpressionGeneration(input.generation),
  }
}
