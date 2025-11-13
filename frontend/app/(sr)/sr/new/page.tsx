import { SRForm } from "@/components/SRForm"
import { FAQ } from "@/components/FAQ"
import { Background } from "@/components/Background"

export default function NewSRPage() {
  return (
    <>
      <Background />

      <div className="min-h-[100dvh]">
        <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,1),0_4px_12px_-2px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]">
          <div className="container mx-auto flex h-16 items-center px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_2px_0_rgba(255,255,255,0.3),0_6px_16px_-2px_rgba(230,0,18,0.4),0_12px_24px_-4px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]">
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5 drop-shadow-sm">
                  <circle cx="7" cy="7" r="2" />
                  <circle cx="17" cy="7" r="2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                  <circle cx="12" cy="12" r="1.5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 drop-shadow-sm">Daiso IT SR</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pb-32 md:pb-12">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800 text-balance drop-shadow-sm">시스템 요청 및 문의</h1>
            <p className="text-gray-600">IT 시스템 관련 장애, 문의, 개선 요청을 접수하세요</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <aside className="space-y-6">
              <FAQ />

              <div className="rounded-3xl bg-white/90 border border-white/80 backdrop-blur-xl shadow-depth-3 p-6 hover:shadow-float transition-shadow duration-300">
                <h3 className="mb-4 text-lg font-bold text-gray-800 drop-shadow-sm">작성 가이드</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_2px_0_rgba(255,255,255,0.3),0_4px_10px_-1px_rgba(230,0,18,0.5),0_8px_16px_-2px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.4)]">
                      <span className="text-xs font-bold text-white drop-shadow-sm">1</span>
                    </div>
                    <span className="leading-relaxed">문제 상황을 구체적으로 설명해주세요</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_2px_0_rgba(255,255,255,0.3),0_4px_10px_-1px_rgba(230,0,18,0.5),0_8px_16px_-2px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.4)]">
                      <span className="text-xs font-bold text-white drop-shadow-sm">2</span>
                    </div>
                    <span className="leading-relaxed">스크린샷이나 오류 메시지를 첨부해주세요</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_2px_0_rgba(255,255,255,0.3),0_4px_10px_-1px_rgba(230,0,18,0.5),0_8px_16px_-2px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.4)]">
                      <span className="text-xs font-bold text-white drop-shadow-sm">3</span>
                    </div>
                    <span className="leading-relaxed">완료 희망 일자가 있다면 기입해주세요</span>
                  </li>
                </ul>
              </div>
            </aside>

            <main>
              <div className="rounded-3xl bg-white/90 border border-white/80 backdrop-blur-xl shadow-depth-3 p-6 md:p-10 hover:shadow-float transition-shadow duration-300">
                <SRForm />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
