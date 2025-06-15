"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./components/ui/button"

interface ItemScaleProps {
  initialIntensity?: number
  itemName?: string
  itemType: "feeling" | "need"
  feelingType?: "good" | "bad" // Only relevant for feelings
  onDelete?: () => void
  onIntensityChange?: (intensity: number) => void
}

export default function ItemScale({
  initialIntensity = 5,
  itemName = "חמלה",
  itemType = "feeling",
  feelingType = "bad",
  onDelete,
  onIntensityChange,
}: ItemScaleProps) {
  const [intensity, setIntensity] = useState(initialIntensity)
  const [isDragging, setIsDragging] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Update container width when component mounts and on resize
  useEffect(() => {
    const updateWidth = () => {
      if (sliderRef.current) {
        setContainerWidth(sliderRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)

    // Use ResizeObserver if available for more accurate updates
    if (window.ResizeObserver && sliderRef.current) {
      const resizeObserver = new ResizeObserver(updateWidth)
      resizeObserver.observe(sliderRef.current)

      return () => {
        window.removeEventListener("resize", updateWidth)
        resizeObserver.disconnect()
      }
    }

    return () => {
      window.removeEventListener("resize", updateWidth)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onIntensityChange) return
    setIsDragging(true)
    updateIntensity(e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onIntensityChange) return
    setIsDragging(true)
    const touch = e.touches[0]
    updateIntensityFromTouch(touch as any)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateIntensity(e)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault()
      const touch = e.touches[0]
      updateIntensityFromTouch(touch)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const updateIntensity = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current || !onIntensityChange || containerWidth === 0) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Account for circle radius + 5px gap in positioning
    const effectiveWidth = containerWidth - 2 * (circleRadius + 5)
    const effectiveX = Math.max(circleRadius + 5, Math.min(containerWidth - circleRadius - 5, x))
    const percentage = (effectiveX - circleRadius - 5) / effectiveWidth

    // Convert percentage to intensity: left = 10, right = 1
    const newIntensity = Math.round(10 - percentage * 9)

    setIntensity(newIntensity)
    onIntensityChange(newIntensity)
  }

  const updateIntensityFromTouch = (touch: Touch) => {
    if (!sliderRef.current || !onIntensityChange || containerWidth === 0) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = touch.clientX - rect.left

    // Account for circle radius + 5px gap in positioning
    const effectiveWidth = containerWidth - 2 * (circleRadius + 5)
    const effectiveX = Math.max(circleRadius + 5, Math.min(containerWidth - circleRadius - 5, x))
    const percentage = (effectiveX - circleRadius - 5) / effectiveWidth

    // Convert percentage to intensity: left = 10, right = 1
    const newIntensity = Math.round(10 - percentage * 9)

    setIntensity(newIntensity)
    onIntensityChange(newIntensity)
  }

  // Add event listeners for mouse and touch events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging])

  const handleDelete = () => {
    onDelete?.()
  }

  // Design specifications - exact sizes as requested
  const circleMargin = 5 // 5px margin on each side of the circle
  const circleSize = 25 // Scale circle height (25px)
  const barHeight = 15 // Bar height (15px)
  const deleteButtonSize = 30 // X circle height (30px)
  const circleRadius = circleSize / 2

  // Calculate circle position: ensure circle stays within bounds with 5px gap
  // Use a more robust calculation that doesn't depend on dynamic width
  const circleLeftPosition =
    containerWidth > 0
      ? ((circleRadius + 5) / containerWidth) * 100 +
      ((10 - intensity) / 9) * (100 - ((2 * (circleRadius + 5)) / containerWidth) * 100)
      : 50 // Fallback to center if width not available yet

  // Get the color based on item type, feeling type, and intensity
  const getColor = (
    itemType: "feeling" | "need",
    feelingType: "good" | "bad" | undefined,
    intensity: number,
  ): string => {
    if (itemType === "need") {
      // Blue shades for needs
      const needColors: { [key: number]: string } = {
        10: "#0C3AAF",
        9: "#0E41C5",
        8: "#144CDB",
        7: "#235AE4",
        6: "#3869E5",
        5: "#5182FD",
        4: "#7099FF",
        3: "#99B6FF",
        2: "#B9CDFF",
        1: "#FFFFFF",
      }
      return needColors[intensity] || "#FFFFFF"
    } else if (itemType === "feeling") {
      // Original feeling colors
      if (feelingType === "bad") {
        const badColors: { [key: number]: string } = {
          10: "#A10303",
          9: "#C20909",
          8: "#E01F1F",
          7: "#F43B3B",
          6: "#FF5B5B",
          5: "#FF7272",
          4: "#FF9C9C",
          3: "#FFBFBF",
          2: "#FFDDDD",
          1: "#FFFFFF",
        }
        return badColors[intensity] || "#FFFFFF"
      } else {
        const goodColors: { [key: number]: string } = {
          10: "#024204",
          9: "#0F7912",
          8: "#208823",
          7: "#2D9830",
          6: "#3DA540",
          5: "#50B853",
          4: "#5FC762",
          3: "#85DF88",
          2: "#ACF0AE",
          1: "#FFFFFF",
        }
        return goodColors[intensity] || "#FFFFFF"
      }
    }
    return "#FFFFFF"
  }

  const color = getColor(itemType, feelingType, intensity)

  return (
    <div className="tw-w-full tw-rounded-lg tw-p-3 sm:tw-p-4" style={{ backgroundColor: "#D1F2FD" }} dir="rtl">
      {/* Scale and Delete Button */}
      <div className="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4">
        {/* Delete Button */}
        {onDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="tw-p-0 tw-rounded-full tw-text-white tw-flex-shrink-0 tw-touch-manipulation"
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#545454",
            }}
          >
            <X style={{ width: "19.2px", height: "19.2px" }} />
          </Button>
        )}

        {/* Custom Slider that fills available space */}
        <div className="tw-relative tw-h-12 sm:tw-h-10 tw-flex-1">
          {/* Item Name - positioned above the right edge of the scale, shifted 7px lower */}
          <div className="tw-absolute tw-right-0" style={{ top: "-20px" }}>
            <span
              className="tw-text-gray-800"
              style={{
                fontFamily: "Assistant, sans-serif",
                fontWeight: 700,
                fontSize: "16px", // Increased for mobile
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "right",
              }}
            >
              {itemName}
            </span>
          </div>

          <div
            ref={sliderRef}
            className={`tw-absolute tw-inset-0 tw-select-none tw-touch-manipulation ${onIntensityChange ? "tw-cursor-pointer" : ""}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* White area (left side of circle) */}
            <div
              className="tw-absolute tw-top-1/2 tw-left-0 tw-bg-white tw-rounded-full tw-transform -tw-translate-y-1/2"
              style={{
                width: `calc(${circleLeftPosition}% - ${circleRadius + 5}px)`,
                height: `${barHeight}px`,
                zIndex: 1,
              }}
            />

            {/* Colored area (right side of circle) */}
            <div
              className="tw-absolute tw-top-1/2 tw-right-0 tw-rounded-full tw-transform -tw-translate-y-1/2"
              style={{
                width: `calc(${100 - circleLeftPosition}% - ${circleRadius + 5}px)`,
                height: `${barHeight}px`,
                backgroundColor: color,
                zIndex: 1,
              }}
            />

            {/* Draggable Circle */}
            <div
              className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 -tw-translate-x-1/2 tw-bg-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-cursor-grab active:tw-cursor-grabbing tw-touch-manipulation"
              style={{
                left: `${circleLeftPosition}%`,
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                userSelect: "none",
                zIndex: 2,
              }}
            >
              <span className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-pointer-events-none">{intensity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
