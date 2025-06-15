"use client"

import { useState } from "react"
import { EmotionalExpressionItems, Item } from "./emotional-expression-items-component"

// Sample need categories
const needsCategories = [
  {
    id: "connection-belonging",
    name: "חיבור ושייכות",
    items: [
      { id: "love", name: "אהבה" },
      { id: "friendship", name: "ידידות" },
      { id: "belonging", name: "שייכות" },
      { id: "community", name: "קהילה" },
      { id: "intimacy", name: "אינטימיות" },
    ],
  },
  {
    id: "autonomy-freedom",
    name: "אוטונומיה וחופש",
    items: [
      { id: "independence", name: "עצמאות" },
      { id: "choice", name: "בחירה" },
      { id: "freedom", name: "חופש" },
      { id: "self-expression", name: "ביטוי עצמי" },
    ],
  },
  {
    id: "security-safety",
    name: "ביטחון ובטיחות",
    items: [
      { id: "safety", name: "בטיחות" },
      { id: "security", name: "ביטחון" },
      { id: "stability", name: "יציבות" },
      { id: "predictability", name: "צפיות" },
    ],
  },
  {
    id: "growth-learning",
    name: "צמיחה ולמידה",
    items: [
      { id: "growth", name: "צמיחה" },
      { id: "learning", name: "למידה" },
      { id: "development", name: "התפתחות" },
      { id: "creativity", name: "יצירתיות" },
    ],
  },
]

type NeedsApprovalComponentProps = {
  needs: Item[]
  onRescaleDone?: (needs: Item[], promptMsg: string) => void
}

export default function NeedsApprovalComponent({
  needs,
  onRescaleDone,
}: NeedsApprovalComponentProps) {

  const composePromptMsg = (items: Item[]) => {
    if (!items.length) return ""
    const msg = items
      .map((item) => ` ${item.name} בעוצמה ${item.intensity ?? 5} `)
      .join(" ")
    return `אני צריך את הצרכים הבאים בסולם של אחת עד עשר: ${msg}`
  }

  const handleApprove = (needs: any[]) => {
    const promptMsg = composePromptMsg(needs)
    if (onRescaleDone) {
      onRescaleDone(needs, promptMsg)
    }
    console.log("Approved needs:", needs, promptMsg)
  }

  return (
    <EmotionalExpressionItems
      initialItems={needs}
      categories={needsCategories as any}
      itemType="need"
      onApprove={handleApprove}
    />
  )
}
