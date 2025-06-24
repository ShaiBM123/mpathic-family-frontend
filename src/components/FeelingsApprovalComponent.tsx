"use client"

import { EmotionalExpressionItems, Item } from "./emotional-expression-items-component"

// Sample data structure
const feelingsCategories = [
	{
		id: "anger-frustration",
		name: "כעס, תסכול והתנגדות",
		type: "bad" as const,
		items: [
			{ id: "anger", name: "כעס", type: "bad" as const },
			{ id: "offense", name: "עלבון", type: "bad" as const },
			{ id: "frustration", name: "תסכול", type: "bad" as const },
			{ id: "bitterness", name: "מרמור", type: "bad" as const },
			{ id: "nervousness", name: "עצבנות", type: "bad" as const },
			{ id: "resistance", name: "התנגדות", type: "bad" as const },
			{ id: "disgust", name: "גועל", type: "bad" as const },
		],
	},
	{
		id: "sadness-loss",
		name: "עצב, אובדן וגעגוע",
		type: "bad" as const,
		items: [
			{ id: "mourning", name: "אבל", type: "bad" as const },
			{ id: "loneliness", name: "בדידות", type: "bad" as const },
			{ id: "longing", name: "געגוע", type: "bad" as const },
			{ id: "sorrow", name: "צער", type: "bad" as const },
			{ id: "sadness", name: "עצב", type: "bad" as const },
			{ id: "heartbreak", name: "שברון לב", type: "bad" as const },
			{ id: "emptiness", name: "ריקנות", type: "bad" as const },
			{ id: "disappointment", name: "באסה", type: "bad" as const },
			{ id: "dejection", name: "דכדוך", type: "bad" as const },
			{ id: "depression", name: "דיכאון", type: "bad" as const },
			{ id: "hopelessness", name: "נואשות", type: "bad" as const },
			{ id: "distress", name: "מועקה", type: "bad" as const },
			{ id: "torment", name: "ייסורים", type: "bad" as const },
			{ id: "pain", name: "כאב", type: "bad" as const },
		],
	},
	{
		id: "fear-anxiety",
		name: "פחד, דאגה וחוסר ביטחון",
		type: "bad" as const,
		items: [
			{ id: "tension", name: "מתח", type: "bad" as const },
			{ id: "pressure", name: "לחץ", type: "bad" as const },
			{ id: "worry", name: "דאגה", type: "bad" as const },
			{ id: "terror", name: "אימה", type: "bad" as const },
			{ id: "panic", name: "פאניקה", type: "bad" as const },
			{ id: "fear", name: "פחד", type: "bad" as const },
			{ id: "anxiety", name: "חרדה", type: "bad" as const },
			{ id: "concern", name: "חשש", type: "bad" as const },
			{ id: "suspicion", name: "חשדנות", type: "bad" as const },
			{ id: "regret", name: "חרטה", type: "bad" as const },
			{ id: "surprise", name: "הפתעה", type: "bad" as const },
			{ id: "shock", name: "זעזוע", type: "bad" as const },
			{ id: "trauma", name: "הלם", type: "bad" as const },
			{ id: "insecurity", name: "חוסר בטחון", type: "bad" as const },
			{ id: "fragility", name: "שבריריות", type: "bad" as const },
			{ id: "helplessness", name: "חוסר אונים", type: "bad" as const },
			{ id: "bother", name: "טרדה", type: "bad" as const },
		],
	},
	{
		id: "confusion-overwhelm",
		name: "בלבול, חוסר בהירות והצפה",
		type: "bad" as const,
		items: [
			{ id: "confusion", name: "בלבול", type: "bad" as const },
			{ id: "embarrassment", name: "מבוכה", type: "bad" as const },
			{ id: "hesitation", name: "היסוס", type: "bad" as const },
			{ id: "uncertainty", name: "חוסר ודאות", type: "bad" as const },
			{ id: "restlessness", name: "חוסר שקט", type: "bad" as const },
			{ id: "instability", name: "חוסר יציבות", type: "bad" as const },
			{ id: "discomfort", name: "חוסר נוחות", type: "bad" as const },
			{ id: "unease", name: "חוסר נחת", type: "bad" as const },
			{ id: "overwhelm", name: "הצפה", type: "bad" as const },
			{ id: "emotional-storm", name: "סערת רגשות", type: "bad" as const },
		],
	},
	{
		id: "exhaustion-burnout",
		name: "תשישות, אדישות וחוסר אנרגיה",
		type: "bad" as const,
		items: [
			{ id: "fatigue", name: "עייפות", type: "bad" as const },
			{ id: "heaviness", name: "כבדות", type: "bad" as const },
			{ id: "lack-of-energy", name: "חוסר מרץ", type: "bad" as const },
			{ id: "lack-of-motivation", name: "חוסר מוטיבציה", type: "bad" as const },
			{ id: "boredom", name: "שעמום", type: "bad" as const },
			{ id: "indifference", name: "אדישות", type: "bad" as const },
			{ id: "lack-of-interest", name: "חוסר עניין", type: "bad" as const },
		],
	},
	{
		id: "alienation-isolation",
		name: "חוסר חיבור, נתק וריחוק",
		type: "bad" as const,
		items: [
			{ id: "alienation", name: "ניכור", type: "bad" as const },
			{ id: "distance", name: "ריחוק", type: "bad" as const },
			{ id: "disconnection", name: "ניתוק", type: "bad" as const },
			{ id: "closedness", name: "סגירות", type: "bad" as const },
			{ id: "reservation", name: "הסתייגות", type: "bad" as const },
		],
	},
	{
		id: "vulnerability-shame",
		name: "תחושת פגיעות, בושה ואשמה",
		type: "bad" as const,
		items: [
			{ id: "shame", name: "בושה", type: "bad" as const },
			{ id: "guilt", name: "אשמה", type: "bad" as const },
			{ id: "remorse", name: "ייסורי מצפון", type: "bad" as const },
			{ id: "sensitivity", name: "רגישות", type: "bad" as const },
			{ id: "regret", name: "חרטה", type: "bad" as const },
		],
	},
	{
		id: "pessimism-disappointment",
		name: "פסימיות, אכזבה וכמיהה",
		type: "bad" as const,
		items: [
			{ id: "disappointment", name: "אכזבה", type: "bad" as const },
			{ id: "pessimism", name: "פסימיות", type: "bad" as const },
			{ id: "dissatisfaction", name: "חוסר סיפוק", type: "bad" as const },
			{ id: "yearning", name: "כמיהה", type: "bad" as const },
			{ id: "envy", name: "קנאה", type: "bad" as const },
			{ id: "discouragement", name: "רפיון ידיים", type: "bad" as const },
		],
	},
	{
		id: "impatience-irritation",
		name: "חוסר סבלנות וחוסר מנוחה",
		type: "bad" as const,
		items: [
			{ id: "impatience", name: "חוסר סבלנות", type: "bad" as const },
			{ id: "alertness", name: "דריכות", type: "bad" as const },
			{ id: "uneasiness", name: "אי שקט", type: "bad" as const },
			{ id: "fidgetiness", name: "חוסר מנוחה", type: "bad" as const },
		],
	},
	{
		id: "depression-hopelessness",
		name: "כאב רגשי ומועקה",
		type: "bad" as const,
		items: [
			{ id: "suffering", name: "סבל", type: "bad" as const },
			{ id: "emotional-pain", name: "כאב רגשי", type: "bad" as const },
			{ id: "distress", name: "מועקה", type: "bad" as const },
			{ id: "torment", name: "ייסורים", type: "bad" as const },
			{ id: "mental-heaviness", name: "כבדות נפשית", type: "bad" as const },
			{ id: "heartbreak", name: "שברון-לב", type: "bad" as const },
			{ id: "despair", name: "ייאוש", type: "bad" as const },
		],
	},
	{
		id: "physical-pain",
		name: "תחושות גוף (פיזיות)",
		type: "bad" as const,
		items: [
			{ id: "contraction", name: "כיווץ", type: "bad" as const },
			{ id: "weakness", name: "חולשה", type: "bad" as const },
			{ id: "choking", name: "חנק", type: "bad" as const },
			{ id: "physical-pain", name: "כאב פיזי", type: "bad" as const },
			{ id: "tension", name: "מתח", type: "bad" as const },
			{ id: "pressure", name: "לחץ", type: "bad" as const },
			{ id: "breathing-difficulty", name: "קושי בנשימה", type: "bad" as const },
			{ id: "exhaustion", name: "תשישות", type: "bad" as const },
			{ id: "powerlessness", name: "אפיסת כוחות", type: "bad" as const },
			{ id: "paralysis", name: "שיתוק", type: "bad" as const },
		],
	},
	{
		id: "love-affection",
		name: "אהבה, חום וקשר אנושי",
		type: "good" as const,
		items: [
			{ id: "love", name: "אהבה", type: "good" as const },
			{ id: "empathy", name: "הזדהות", type: "good" as const },
			{ id: "appreciation", name: "הוקרה", type: "good" as const },
			{ id: "affection", name: "חיבה", type: "good" as const },
			{ id: "connection", name: "חיבור", type: "good" as const },
			{ id: "caring", name: "אכפתיות", type: "good" as const },
			{ id: "warmth", name: "חום", type: "good" as const },
			{ id: "tenderness", name: "רוך", type: "good" as const },
			{ id: "compassion", name: "חמלה", type: "good" as const },
			{ id: "openness", name: "פתיחות", type: "good" as const },
		],
	},
	{
		id: "joy-enthusiasm",
		name: "שמחה, התלהבות וחדוות חיים",
		type: "good" as const,
		items: [
			{ id: "enthusiasm", name: "התלהבות", type: "good" as const },
			{ id: "admiration", name: "התפעלות", type: "good" as const },
			{ id: "excitement", name: "התרגשות", type: "good" as const },
			{ id: "joy", name: "שמחה", type: "good" as const },
			{ id: "pleasure", name: "הנאה", type: "good" as const },
			{ id: "lightness", name: "קלילות", type: "good" as const },
			{ id: "cheerfulness", name: "עליזות", type: "good" as const },
			{ id: "delight", name: "עונג", type: "good" as const },
			{ id: "passion", name: "להט", type: "good" as const },
			{ id: "desire", name: "תשוקה", type: "good" as const },
		],
	},
	{
		id: "satisfaction",
		name: "הרגשת סיפוק",
		type: "good" as const,
		items: [
			{ id: "satisfaction", name: "סיפוק", type: "good" as const },
			{ id: "contentment", name: "שביעות רצון", type: "good" as const },
			{ id: "happiness", name: "אושר", type: "good" as const },
			{ id: "gratification", name: "נחת", type: "good" as const },
		],
	},
	{
		id: "positive-perception",
		name: "ראיה והרגשה חיובית",
		type: "good" as const,
		items: [
			{ id: "optimism", name: "אופטימיות", type: "good" as const },
			{ id: "alertness", name: "ערנות", type: "good" as const },
			{ id: "freshness", name: "רעננות", type: "good" as const },
			{ id: "energy", name: "מרץ", type: "good" as const },
			{ id: "encouragement", name: "עידוד", type: "good" as const },
			{ id: "gratitude", name: "הכרת תודה", type: "good" as const },
			{ id: "hope", name: "תקווה", type: "good" as const },
		],
	},
	{
		id: "tranquility",
		name: "שלווה ושקט פנימי",
		type: "good" as const,
		items: [
			{ id: "relief", name: "הקלה", type: "good" as const },
			{ id: "comfort", name: "נוחות", type: "good" as const },
			{ id: "ease", name: "נינוחות", type: "good" as const },
			{ id: "calm", name: "רוגע", type: "good" as const },
			{ id: "serenity", name: "שלווה", type: "good" as const },
			{ id: "security", name: "ביטחון", type: "good" as const },
		],
	},
	{
		id: "pride-self-esteem",
		name: "עוצמה אישית",
		type: "good" as const,
		items: [
			{ id: "pride", name: "גאווה", type: "good" as const },
			{ id: "courage", name: "אומץ", type: "good" as const },
			{ id: "vitality", name: "חיוניות", type: "good" as const },
		],
	},
]

type FeelingsApprovalComponentProps = {
	feelings: Item[]
	onRescaleDone?: (feelings: Item[], promptMsg: string) => void
	approved?: boolean
	forceChatRerender?: () => void // <-- Add this prop type
}

export function FeelingsApprovalComponent({
	feelings,
	approved = false,
	onRescaleDone,
	forceChatRerender, // <-- Add this prop
}: FeelingsApprovalComponentProps) {
	// Compose a prompt message similar to FeelingsScale
	const composePromptMsg = (items: Item[]) => {
		if (!items.length) return ""
		const msg = items
			.map((item) => ` ${item.name} בעוצמה ${item.intensity ?? 5} `)
			.join(" ")
		return `אני מרגיש את הרגשות הבאים בסולם של אחת עד עשר: ${msg}`
	}

	const handleApprove = (feelings: Item[]) => {
		const promptMsg = composePromptMsg(feelings)
		if (onRescaleDone) {
			onRescaleDone(feelings, promptMsg)
		}
		console.log("Approved feelings:", feelings, promptMsg)
	}

	return (
		<EmotionalExpressionItems
			initialItems={feelings}
			categories={feelingsCategories as any}
			itemType="feeling"
			onApprove={handleApprove}
			approved={approved}
			forceChatRerender={forceChatRerender} // <-- Pass it down
		/>
	)
}
