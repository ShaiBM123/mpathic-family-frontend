"use client"

import React, { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "./components/ui/button"
import ItemScale from "./ItemScale"
import ItemSelector from "./ItemSelector"

export interface Item {
  id: string
  name: string
  intensity: number
  type?: "good" | "bad" // Only for feelings, undefined for needs
}

interface ItemCategory {
  id: string
  name: string
  type?: "good" | "bad" // Only for feelings, undefined for needs
  items: Item[]
}

interface IntegratedItemsComponentProps {
  initialItems?: Item[]
  categories: ItemCategory[]
  itemType: "feeling" | "need" // New prop to specify item type
  onApprove?: (items: Item[]) => void
  approved?: boolean // Add this line
}

export default function IntegratedItemsComponent({
  initialItems = [],
  categories: initialCategories,
  itemType,
  onApprove,
  approved = false, // Add default value
}: IntegratedItemsComponentProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [categories, setCategories] = useState<ItemCategory[]>(initialCategories)

  // Remove initial items from categories to prevent duplications
  React.useEffect(() => {
    if (initialItems.length > 0) {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          items: category.items.filter((item) => !initialItems.some((initialItem) => initialItem.id === item.id)),
        })),
      )

      // Set selected items based on initial items
      setSelectedItems(initialItems.map((item) => item.id))
    }
  }, []) // Empty dependency array to run only on mount

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isApproved, setIsApproved] = useState(approved) // Use prop for initial state

  const handleDeleteItem = (id: string) => {
    const deletedItem = items.find((f) => f.id === id)
    setItems((prev) => prev.filter((item) => item.id !== id))

    // Add the item back to its category
    if (deletedItem) {
      setCategories((prev) =>
        prev.map((category) => {
          // For feelings, check type match; for needs, add to any category that originally contained it
          if (itemType === "feeling" && category.type === deletedItem.type) {
            // Find the original category that should contain this item
            const originalCategory = initialCategories.find((cat) => cat.items.some((f) => f.id === deletedItem.id))
            if (originalCategory && category.id === originalCategory.id) {
              const originalItem = originalCategory.items.find((f) => f.id === deletedItem.id)
              if (originalItem && !category.items.some((f) => f.id === deletedItem.id)) {
                return {
                  ...category,
                  items: [...category.items, originalItem],
                }
              }
            }
          } else if (itemType === "need") {
            // For needs, find the original category that contained this item
            const originalCategory = initialCategories.find((cat) => cat.items.some((f) => f.id === deletedItem.id))
            if (originalCategory && category.id === originalCategory.id) {
              const originalItem = originalCategory.items.find((f) => f.id === deletedItem.id)
              if (originalItem && !category.items.some((f) => f.id === deletedItem.id)) {
                return {
                  ...category,
                  items: [...category.items, originalItem],
                }
              }
            }
          }
          return category
        }),
      )

      // Remove from selected items
      setSelectedItems((prev) => prev.filter((id) => id !== deletedItem.id))
    }
  }

  const handleIntensityChange = (id: string, intensity: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, intensity } : item)))
  }

  const handleAddButtonClick = () => {
    // Only allow opening selector if less than 3 items
    if (items.length < 3) {
      setIsSelectorOpen(true)
    }
  }

  const handleItemSelect = useCallback((itemId: string, item: any) => {
    console.log("handleItemSelect called with:", itemId, item) // Debug log

    // Add to selected items list
    setSelectedItems((prev) => {
      const updated = [...prev, itemId]
      console.log("Updated selected items:", updated) // Debug log
      return updated
    })

    // Check if item already exists in the items list
    setItems((prev) => {
      const existingItem = prev.find((f) => f.id === itemId)
      if (!existingItem) {
        // Add new item with default intensity
        const newItem: Item = {
          id: itemId,
          name: item.name,
          intensity: 5, // Default intensity
          type: item.type, // Will be undefined for needs
        }
        const updated = [...prev, newItem]
        console.log("Added new item to list:", newItem) // Debug log
        console.log("Updated items list:", updated) // Debug log
        return updated
      }
      return prev
    })

    // Remove the item from its category
    setCategories((prev) => {
      const updated = prev.map((category) => ({
        ...category,
        items: category.items.filter((f) => f.id !== itemId),
      }))
      console.log("Updated categories after removal:", updated) // Debug log
      return updated
    })

    // Close the selector after adding the item
    setIsSelectorOpen(false)
  }, [])

  const handleItemDeselect = (itemId: string) => {
    // Remove from selected items list
    setSelectedItems((prev) => prev.filter((id) => id !== itemId))

    // Remove from items list
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleApprove = () => {
    setIsApproved(true)
    onApprove?.(items)
    setIsSelectorOpen(false)
  }

  // For feelings, separate good and bad; for needs, show all together
  const goodItems = itemType === "feeling" ? items.filter((item) => item.type === "good") : []
  const badItems = itemType === "feeling" ? items.filter((item) => item.type === "bad") : []
  const allItems = itemType === "need" ? items : [...badItems, ...goodItems]

  console.log("Current items state:", allItems) // Debug log
  console.log("Current categories state:", categories) // Debug log

  // Check if quota is reached (3 or more items)
  const isQuotaReached = items.length >= 3

  // Get title based on item type
  const getTitle = () => {
    return itemType === "feeling" ? "הרגשות שלי:" : "הצרכים שלי:"
  }

  return (
    <div id="mpathic-items-component">
      <div className="tw-w-full tw-max-w-md tw-mx-auto" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
        {/* Items List with Title inside */}
        <div className="tw-px-2 tw-pt-4" style={{ paddingBottom: "10px" }}>
          {/* Title aligned with item names */}
          <div className="tw-w-full tw-rounded-lg tw-p-3 sm:tw-p-4 tw-mb-1" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
            <div className="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4">
              {/* Empty space to match the X button width */}
              {/* <div style={{ width: "30px" }}></div> */}

              {/* Title positioned like an item name */}
              <div className="tw-relative tw-h-6 tw-flex-1">
                <div className="tw-absolute tw-right-0" style={{ top: "-4px" }}>
                  <h2
                    className="tw-text-gray-800"
                    style={{
                      fontFamily: "Assistant, sans-serif",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      textAlign: "right",
                    }}
                  >
                    {getTitle()}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="tw-space-y-1">
            {allItems.length === 0 ? (
              <div className="tw-text-center tw-text-gray-500 tw-py-4">
                {itemType === "feeling" ? "אין רגשות נבחרים" : "אין צרכים נבחרים"}
              </div>
            ) : (
              allItems.map((item) => (
                <div key={item.id}>
                  <ItemScale
                    initialIntensity={item.intensity}
                    itemName={item.name}
                    itemType={itemType}
                    feelingType={item.type} // Only relevant for feelings
                    onDelete={isApproved ? undefined : () => handleDeleteItem(item.id)}
                    onIntensityChange={isApproved ? undefined : (intensity) => handleIntensityChange(item.id, intensity)}
                  />
                </div>
              ))
            )}

            {/* Bottom Actions - moved inside the items list div and aligned with scale bars */}
            {!isApproved && (
              <div className="tw-w-full tw-rounded-lg tw-p-3 sm:tw-p-4" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
                <div className="tw-flex tw-items-center ">
                  {/* Empty space to match the X button width */}
                  <div style={{ marginTop: "40px" }}></div>
                  {/* <div style={{ width: "30px" }}></div> */}

                  {/* Buttons container aligned with scale area */}
                  <div className="tw-relative tw-flex-1 tw-flex tw-items-center tw-justify-between">
                    {/* Add Button aligned with right side of right scale bar */}
                    <div className="tw-absolute tw-right-0">
                      <Button
                        onClick={handleAddButtonClick}
                        variant="outline"
                        className="tw-rounded-full tw-p-0 tw-border-gray-400 tw-text-white tw-border-gray-500"
                        disabled={isQuotaReached}
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#545454",
                          opacity: isQuotaReached ? 0.4 : 1,
                          cursor: isQuotaReached ? "not-allowed" : "pointer",
                        }}
                      >
                        <Plus style={{ width: "26px", height: "26px" }} />
                      </Button>
                    </div>

                    {/* Approval Button aligned with left side of left scale bar */}
                    <div className="tw-absolute tw-left-0">
                      <Button
                        onClick={handleApprove}
                        className="tw-text-white tw-rounded-full tw-text-sm tw-font-medium"
                        style={{
                          fontFamily: "Assistant, sans-serif",
                          fontWeight: 600,
                          width: "80px",
                          height: "40px",
                          backgroundColor: "#545454",
                        }}
                      >
                        אישור
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Item Selector */}
        {!isApproved && isSelectorOpen && (
          // <div style={{ marginTop: "25px" }}>
          <ItemSelector
            categories={categories}
            selectedItems={selectedItems}
            itemType={itemType}
            onItemSelect={handleItemSelect}
            onItemDeselect={handleItemDeselect}
            isQuotaReached={isQuotaReached}
          />
          // </div>
        )}
      </div>
    </div >
  )
}
