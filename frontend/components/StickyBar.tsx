"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Save } from "lucide-react"

interface StickyBarProps {
  isDirty: boolean
  onReset: () => void
  onSave: () => void
  isSubmitting?: boolean
}

export function StickyBar({ isDirty, onReset, onSave, isSubmitting }: StickyBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(isDirty)
  }, [isDirty])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 px-6 py-3 bg-gradient-to-b from-gray-900/85 to-black/85 backdrop-blur-xl rounded-full shadow-[0_2px_0_rgba(255,255,255,0.1),0_20px_60px_-16px_rgba(0,0,0,0.6),0_32px_80px_-20px_rgba(0,0,0,0.4)] border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <span className="text-sm font-medium text-white drop-shadow-sm">저장되지 않은 변경사항</span>
        </div>

        <div className="w-px h-6 bg-white/30" />

        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all disabled:opacity-50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_2px_8px_rgba(255,255,255,0.1)]"
        >
          <RotateCcw className="w-4 h-4" />
          초기화
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-b from-brand-500 to-brand-700 shadow-[0_2px_0_rgba(255,255,255,0.2),0_18px_36px_-12px_rgba(230,0,18,0.6),0_28px_56px_-16px_rgba(0,0,0,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] hover:shadow-[0_2px_0_rgba(255,255,255,0.25),0_22px_44px_-12px_rgba(230,0,18,0.7),0_32px_64px_-16px_rgba(0,0,0,0.35)] hover:-translate-y-[2px] active:translate-y-[1px] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4 drop-shadow-sm" />
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  )
}
