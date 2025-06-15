"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Button } from "./components/ui/button"

interface Item {
  id: string
  name: string
  type?: "good" | "bad" // Only for feelings
}

interface ItemCategory {
  id: string
  name: string
  type?: "good" | "bad" // Only for feelings
  items: Item[]
}

interface ItemSelectorProps {
  categories: ItemCategory[]
  selectedItems?: string[]
  itemType: "feeling" | "need"
  onItemSelect?: (itemId: string, item: Item) => void
  onItemDeselect?: (itemId: string) => void
  isQuotaReached?: boolean
}

export default function ItemSelector({
  categories,
  selectedItems = [],
  itemType,
  onItemSelect,
  onItemDeselect,
  isQuotaReached = false,
}: ItemSelectorProps) {
  const [isBadDropdownOpen, setIsBadDropdownOpen] = useState(false)
  const [isGoodDropdownOpen, setIsGoodDropdownOpen] = useState(false)
  const [isNeedDropdownOpen, setIsNeedDropdownOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [approvalPopup, setApprovalPopup] = useState<{ item: Item; categoryId: string } | null>(null)
  const [pendingSelection, setPendingSelection] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const categoriesContainerRef = useRef<HTMLDivElement>(null)
  const expandedCategoryRef = useRef<HTMLDivElement>(null)
  const badDropdownRef = useRef<HTMLDivElement>(null)
  const goodDropdownRef = useRef<HTMLDivElement>(null)
  const needDropdownRef = useRef<HTMLDivElement>(null)

  const badCategories = categories.filter((category) => category.type === "bad")
  const goodCategories = categories.filter((category) => category.type === "good")
  const needCategories = categories // For needs, all categories are need categories

  // Freeze background and scroll to popup when it appears
  useEffect(() => {
    if (approvalPopup) {
      // Freeze background scrolling
      document.body.style.overflow = "hidden"

      // Scroll to popup after it's rendered
      setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      }, 100)
    } else {
      // Restore background scrolling
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [approvalPopup])

  // Scroll to bad dropdown when it opens
  useEffect(() => {
    if (isBadDropdownOpen && badDropdownRef.current) {
      setTimeout(() => {
        if (badDropdownRef.current) {
          badDropdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Scroll a bit more to show the dropdown content
          setTimeout(() => {
            window.scrollBy({
              top: 150, // Scroll down additional 150px to show more of the dropdown
              behavior: "smooth",
            })
          }, 300)
        }
      }, 100)
    }
  }, [isBadDropdownOpen])

  // Scroll to good dropdown when it opens
  useEffect(() => {
    if (isGoodDropdownOpen && goodDropdownRef.current) {
      setTimeout(() => {
        if (goodDropdownRef.current) {
          goodDropdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Scroll a bit more to show the dropdown content
          setTimeout(() => {
            window.scrollBy({
              top: 150, // Scroll down additional 150px to show more of the dropdown
              behavior: "smooth",
            })
          }, 300)
        }
      }, 100)
    }
  }, [isGoodDropdownOpen])

  // Scroll to need dropdown when it opens
  useEffect(() => {
    if (isNeedDropdownOpen && needDropdownRef.current) {
      setTimeout(() => {
        if (needDropdownRef.current) {
          needDropdownRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Scroll a bit more to show the dropdown content
          setTimeout(() => {
            window.scrollBy({
              top: 150, // Scroll down additional 150px to show more of the dropdown
              behavior: "smooth",
            })
          }, 300)
        }
      }, 100)
    }
  }, [isNeedDropdownOpen])

  // Scroll to expanded category when it changes
  useEffect(() => {
    if (expandedCategory && expandedCategoryRef.current) {
      // Scroll to the expanded category
      setTimeout(() => {
        if (expandedCategoryRef.current) {
          expandedCategoryRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Scroll a bit more to show more categories below
          setTimeout(() => {
            window.scrollBy({
              top: 100, // Scroll down additional 100px to show more categories
              behavior: "smooth",
            })
          }, 300)
        }
      }, 100)
    }
  }, [expandedCategory])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId))
  }

  const handleItemClick = (item: Item, categoryId: string) => {
    if (selectedItems.includes(item.id)) {
      onItemDeselect?.(item.id)
    } else {
      // Show visual feedback immediately and show approval popup
      setPendingSelection(item.id)
      setApprovalPopup({ item, categoryId })
      console.log("Setting approval popup for item:", item) // Debug log
    }
  }

  const handleApproveItem = () => {
    console.log("handleApproveItem called") // Debug log
    if (approvalPopup) {
      console.log("Approving item:", approvalPopup.item) // Debug log
      console.log("onItemSelect callback exists:", !!onItemSelect) // Debug log

      // Call the callback to add the item
      if (onItemSelect) {
        onItemSelect(approvalPopup.item.id, approvalPopup.item)
        console.log("Called onItemSelect with:", approvalPopup.item.id, approvalPopup.item) // Debug log
      } else {
        console.error("onItemSelect callback is not defined!") // Debug log
      }

      setApprovalPopup(null)
      setPendingSelection(null)
    }
  }

  const handleCancelApproval = () => {
    console.log("handleCancelApproval called") // Debug log
    setApprovalPopup(null)
    setPendingSelection(null)
  }

  const toggleBadDropdown = () => {
    setIsBadDropdownOpen((prev) => !prev)
  }

  const toggleGoodDropdown = () => {
    setIsGoodDropdownOpen((prev) => !prev)
  }

  const toggleNeedDropdown = () => {
    setIsNeedDropdownOpen((prev) => !prev)
  }

  // Common popup style properties
  const popupStyle = {
    backgroundColor: "#545454",
    width: "180px", // Fixed width for both popups
    minHeight: "100px", // Minimum height for both popups
  }

  // Get instructions text based on item type
  const getInstructionsText = () => {
    return itemType === "feeling"
      ? "בלחיצה על כל קבוצת רגשות תופיע רשימת רגשות לבחירה"
      : "בלחיצה על כל קבוצת צרכים תופיע רשימת צרכים לבחירה"
  }

  // Get approval question text based on item type
  const getApprovalText = () => {
    return itemType === "feeling" ? "להוסיף את הרגש הזה?" : "להוסיף את הצורך הזה?"
  }

  // Render categories for the given type
  const renderCategories = (categoriesToRender: ItemCategory[], colorClass: string) => {
    return categoriesToRender.map((category) => {
      const isExpanded = expandedCategory === category.id

      return (
        <div
          key={category.id}
          className="tw-border-b tw-border-gray-100 last:tw-border-b-0"
          ref={isExpanded ? expandedCategoryRef : null}
        >
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="tw-w-full tw-p-4 tw-text-right hover:tw-bg-gray-50 tw-flex tw-items-center tw-gap-2 tw-transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className={`tw-h-4 tw-w-4 ${colorClass}`} />
            ) : (
              <ChevronDown className={`tw-h-4 tw-w-4 ${colorClass}`} />
            )}
            <span
              className="tw-text-gray-800"
              style={{
                fontFamily: "Assistant, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {category.name}
            </span>
          </button>

          {/* Category Items */}
          {isExpanded && (
            <div className="tw-px-4 tw-pb-4 tw-relative">
              {category.items.map((item, index) => {
                const isSelected = selectedItems.includes(item.id)
                const isPending = pendingSelection === item.id
                const showApprovalPopupAfterThis = approvalPopup && approvalPopup.item.id === item.id

                return (
                  <div key={item.id}>
                    {/* Item Button */}
                    <button
                      onClick={() => handleItemClick(item, category.id)}
                      className="tw-w-full tw-p-2 tw-text-right hover:tw-bg-white tw-rounded tw-flex tw-items-center tw-gap-2 tw-transition-colors tw-group"
                    >
                      <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">
                        {isSelected || isPending ? (
                          <div
                            className={`tw-w-5 tw-h-5 tw-rounded-full tw-flex tw-items-center tw-justify-center ${itemType === "feeling"
                              ? item.type === "bad"
                                ? "tw-bg-red-500"
                                : "tw-bg-green-500"
                              : "tw-bg-blue-500"
                              }`}
                          >
                            <Check className="tw-h-3 tw-w-3 tw-text-white" />
                          </div>
                        ) : (
                          <div className="tw-w-5 tw-h-5 tw-rounded-full tw-bg-gray-100"></div>
                        )}
                      </div>
                      <span
                        className="tw-text-gray-700 group-hover:tw-text-gray-900"
                        style={{
                          fontFamily: "Assistant, sans-serif",
                          fontWeight: 400,
                          fontSize: "14px",
                        }}
                      >
                        {item.name}
                      </span>
                    </button>

                    {/* Inline Approval Popup */}
                    {showApprovalPopupAfterThis && (
                      <div ref={popupRef} className="tw-my-4 tw-flex tw-justify-center tw-relative tw-z-50">
                        <div
                          className="tw-text-white tw-rounded-lg tw-p-4 tw-shadow-lg tw-relative tw-flex tw-flex-col tw-justify-between"
                          style={popupStyle}
                        >
                          {/* Close button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log("Close button clicked")
                              handleCancelApproval()
                            }}
                            className="tw-absolute tw-top-2 tw-right-2 tw-text-white hover:tw-text-gray-300"
                          >
                            <X className="tw-h-4 tw-w-4" />
                          </button>

                          {/* Question text */}
                          <div className="tw-text-center tw-mb-4 tw-pt-2">
                            <span
                              style={{
                                fontFamily: "Assistant, sans-serif",
                                fontWeight: 400,
                                fontSize: "14px",
                              }}
                            >
                              {getApprovalText()}
                            </span>
                          </div>

                          {/* Buttons */}
                          <div className="tw-flex tw-justify-center tw-mt-auto tw-pb-2" style={{ gap: "24px" }}>
                            {/* Cancel button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log("Cancel button clicked")
                                handleCancelApproval()
                              }}
                              className="tw-bg-transparent tw-text-white hover:tw-bg-transparent tw-rounded-full tw-text-sm tw-cursor-pointer tw-border tw-border-white tw-flex tw-items-center tw-justify-center"
                              style={{
                                fontFamily: "Assistant, sans-serif",
                                fontWeight: 400,
                                fontSize: "14px",
                                pointerEvents: "auto",
                                width: "84px",
                                height: "40px",
                              }}
                            >
                              לא
                            </button>
                            {/* Approval button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log("Approval button clicked!")
                                console.log("Current approvalPopup:", approvalPopup)
                                console.log("onItemSelect exists:", !!onItemSelect)

                                if (approvalPopup && onItemSelect) {
                                  console.log("About to call onItemSelect")
                                  onItemSelect(approvalPopup.item.id, approvalPopup.item)
                                  console.log("Called onItemSelect successfully")
                                  setApprovalPopup(null)
                                  setPendingSelection(null)
                                } else {
                                  console.error("Missing approvalPopup or onItemSelect:", {
                                    approvalPopup: !!approvalPopup,
                                    onItemSelect: !!onItemSelect,
                                  })
                                }
                              }}
                              className="tw-bg-white tw-text-gray-800 hover:tw-bg-gray-100 tw-rounded-full tw-text-sm tw-cursor-pointer tw-flex tw-items-center tw-justify-center"
                              style={{
                                fontFamily: "Assistant, sans-serif",
                                fontWeight: 400,
                                fontSize: "14px",
                                pointerEvents: "auto",
                                width: "84px",
                                height: "40px",
                              }}
                            >
                              אישור
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="tw-w-full tw-max-w-md tw-mx-auto" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
      {/* Container with same structure as items list to align with buttons */}
      <div className="tw-px-2">
        <div className="tw-w-full tw-rounded-lg tw-p-3 sm:tw-p-4" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
          <div className="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4">
            {/* Empty space to match the X button width */}
            {/* <div style={{ width: "30px" }}></div> */}

            {/* Dropdowns container aligned with scale area */}
            <div className="tw-relative tw-flex-1">
              {/* Main Type Selector */}
              <div>
                {itemType === "feeling" ? (
                  <>
                    {/* Bad Feelings Section */}
                    <div className="tw-mb-0">
                      {/* Bad Feelings Button with conditional rounded corners and background colors */}
                      <Button
                        onClick={toggleBadDropdown}
                        className={`tw-w-full !tw-justify-start tw-gap-2 tw-text-white tw-border-0 tw-rounded-t-lg ${isBadDropdownOpen ? "tw-rounded-b-none" : "tw-rounded-b-lg"
                          }`}
                        style={{
                          fontFamily: "Assistant, sans-serif",
                          fontWeight: 600,
                          fontSize: "16px",
                          backgroundColor: isBadDropdownOpen ? "#FFBFBF" : "#FF5B5B",
                        }}
                      >
                        {isBadDropdownOpen ? <ChevronUp className="tw-h-4 tw-w-4" /> : <ChevronDown className="tw-h-4 tw-w-4" />}
                        רגשות לא נעימים
                      </Button>

                      {/* Bad Feelings Categories - Inline */}
                      {isBadDropdownOpen && (
                        <div
                          ref={badDropdownRef}
                          className="tw-bg-white tw-rounded-b-lg tw-shadow-lg tw-overflow-hidden tw-relative tw-rounded-t-none"
                        >
                          {/* Instructions */}
                          <div
                            className="tw-px-4 tw-pt-4 tw-text-right tw-text-gray-600 tw-leading-relaxed"
                            style={{
                              fontFamily: "Assistant, sans-serif",
                              fontWeight: 400,
                              fontSize: "15px",
                            }}
                          >
                            {getInstructionsText()}
                          </div>

                          {/* Bad Categories List */}
                          <div ref={categoriesContainerRef} className="tw-max-h-96 tw-overflow-y-auto">
                            {renderCategories(badCategories, "tw-text-red-500")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 10px Gap between Bad and Good Feelings Sections */}
                    <div className="tw-h-[10px]"></div>

                    {/* Good Feelings Section */}
                    <div>
                      {/* Good Feelings Button with conditional rounded corners and background colors */}
                      <Button
                        onClick={toggleGoodDropdown}
                        className={`tw-w-full !tw-justify-start tw-gap-2 tw-text-white tw-border-0 tw-rounded-t-lg ${isGoodDropdownOpen ? "tw-rounded-b-none" : "tw-rounded-b-lg"
                          }`}
                        style={{
                          fontFamily: "Assistant, sans-serif",
                          fontWeight: 600,
                          fontSize: "16px",
                          backgroundColor: isGoodDropdownOpen ? "#ACF0AE" : "#3DA540",
                        }}
                      >
                        {isGoodDropdownOpen ? <ChevronUp className="tw-h-4 tw-w-4" /> : <ChevronDown className="tw-h-4 tw-w-4" />}
                        רגשות נעימים
                      </Button>

                      {/* Good Feelings Categories - Inline */}
                      {isGoodDropdownOpen && (
                        <div
                          ref={goodDropdownRef}
                          className="tw-bg-white tw-rounded-b-lg tw-shadow-lg tw-overflow-hidden tw-relative tw-rounded-t-none"
                        >
                          {/* Instructions */}
                          <div
                            className="tw-px-4 tw-pt-4 tw-text-right tw-text-gray-600 tw-leading-relaxed"
                            style={{
                              fontFamily: "Assistant, sans-serif",
                              fontWeight: 400,
                              fontSize: "15px",
                            }}
                          >
                            {getInstructionsText()}
                          </div>

                          {/* Good Categories List */}
                          <div className="tw-max-h-96 tw-overflow-y-auto">
                            {renderCategories(goodCategories, "tw-text-green-500")}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Need Section - Single Dropdown */
                  <div>
                    {/* Need Button with conditional rounded corners and background colors */}
                    <Button
                      onClick={toggleNeedDropdown}
                      className={`tw-w-full !tw-justify-start tw-gap-2 tw-text-white tw-border-0 tw-rounded-t-lg ${isNeedDropdownOpen ? "tw-rounded-b-none" : "tw-rounded-b-lg"
                        }`}
                      style={{
                        fontFamily: "Assistant, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                        backgroundColor: isNeedDropdownOpen ? "#B9CDFF" : "#3869E5",
                      }}
                    >
                      {isNeedDropdownOpen ? <ChevronUp className="tw-h-4 tw-w-4" /> : <ChevronDown className="tw-h-4 tw-w-4" />}
                      צרכים
                    </Button>

                    {/* Need Categories - Inline */}
                    {isNeedDropdownOpen && (
                      <div
                        ref={needDropdownRef}
                        className="tw-bg-white tw-rounded-b-lg tw-shadow-lg tw-overflow-hidden tw-relative tw-rounded-t-none"
                      >
                        {/* Instructions */}
                        <div
                          className="tw-px-4 tw-pt-4 tw-text-right tw-text-gray-600 tw-leading-relaxed"
                          style={{
                            fontFamily: "Assistant, sans-serif",
                            fontWeight: 400,
                            fontSize: "15px",
                          }}
                        >
                          {getInstructionsText()}
                        </div>

                        {/* Need Categories List */}
                        <div className="tw-max-h-96 tw-overflow-y-auto">
                          {renderCategories(needCategories, "tw-text-blue-500")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to prevent background interaction - but allow popup clicks */}
      {approvalPopup && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black tw-bg-opacity-20"
          onClick={(e) => {
            // Only close if clicking the overlay itself, not its children
            if (e.target === e.currentTarget) {
              console.log("Overlay clicked")
              handleCancelApproval()
            }
          }}
          style={{ pointerEvents: "auto" }}
        />
      )}
    </div>
  )
}
