import { motion } from "framer-motion";
import { UNIT_OPTIONS } from "@/lib/unitConversion";

export default function UnitToggle({ unit, onChange }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-0.5">
      {UNIT_OPTIONS.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)} className="relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors">
          {unit === opt.value && (
            <motion.div layoutId="unit-toggle-bg" className="absolute inset-0 bg-white rounded-full shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <span className={`relative z-10 ${unit === opt.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}