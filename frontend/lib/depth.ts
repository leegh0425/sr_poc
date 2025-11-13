// Glassmorphism + Neumorphism depth tokens for consistent styling

export const depth = {
  field:
    "rounded-2xl bg-white/80 border border-white/60 backdrop-blur-[2px] shadow-inner-soft transition-all duration-200",
  fieldHover: "hover:shadow-depth-1 hover:-translate-y-[1px]",
  fieldFocus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/70 focus-visible:ring-offset-2",
  fieldActive: "active:translate-y-[1px]",
  card: "rounded-3xl bg-white/65 border border-white/50 backdrop-blur-md shadow-depth-1",
  pill: "rounded-full bg-white/85 border border-white/60 backdrop-blur-[2px] shadow-depth-1",
  press: "active:translate-y-[1px] hover:-translate-y-[1px] transition-transform duration-150",
}

// Helper to combine depth classes
export const combineDepth = (...classes: string[]) => classes.join(" ")
