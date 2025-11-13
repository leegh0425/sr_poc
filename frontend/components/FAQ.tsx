"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqData = [
  {
    question: "장애/문의/개선의 차이는?",
    answer:
      "**장애**: 시스템이 정상 작동하지 않아 업무에 즉시 영향을 주는 경우입니다. **문의**: 기능 사용법이나 절차에 대한 질문입니다. **개선**: 기존 기능의 개선이나 변경을 요청하는 경우입니다.",
  },
  {
    question: "파일 첨부 방법은?",
    answer:
      "파일 업로드 영역을 클릭하거나 파일을 드래그 앤 드롭하여 첨부할 수 있습니다. 스크린샷, 에러 메시지 캡처 등을 함께 첨부하면 빠른 처리에 도움이 됩니다.",
  },
  {
    question: "평균 처리 시간은?",
    answer:
      "요청 유형에 따라 다릅니다. **장애**: 2~4시간 이내 우선 대응, **문의**: 1~2일, **개선/신규**: 협의 후 일정 산정. 긴급한 경우 요청 구분을 '장애'로 선택해 주세요.",
  },
]

export function FAQ() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-[0_2px_0_rgba(255,255,255,0.3),0_6px_16px_-2px_rgba(230,0,18,0.4),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-white drop-shadow-sm"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 drop-shadow-sm">자주 묻는 질문</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqData.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="rounded-2xl bg-white/90 border border-white/80 backdrop-blur-xl shadow-depth-3 overflow-hidden hover:shadow-float transition-all duration-300"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline text-left font-semibold text-gray-800 hover:text-brand-600 transition-colors [&[data-state=open]]:text-brand-600">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-gray-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
