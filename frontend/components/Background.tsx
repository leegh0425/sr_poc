"use client"

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F7F8FA]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-10"
        style={{
          backgroundImage: "url('/textures/euro-plaster.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F8FA]/95 to-[#ECEFF3]/90" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(1000px 500px at 85% 0%, rgba(230, 0, 18, 0.06), transparent 45%)",
        }}
      />

      {/* Soft vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.02) 100%)",
        }}
      />
    </div>
  )
}
