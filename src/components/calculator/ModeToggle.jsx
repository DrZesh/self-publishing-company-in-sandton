import { Pen, Ruler } from "lucide-react";
import { motion } from "framer-motion";

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full w-fit">
      {[{ key: "author", label: "Author Mode", icon: Pen }, { key: "designer", label: "Designer Mode", icon: Ruler }].map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => onModeChange(key)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${mode === key ? "text-white" : "text-muted-foreground hover:text-foreground"}`}>
          {mode === key && (
            <motion.div layoutId="modeToggle" className="absolute inset-0 bg-primary rounded-full shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <Icon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
          <span className="relative z-10 sm:hidden">{key === "author" ? "Author" : "Designer"}</span>
        </button>
      ))}
    </div>
  );
}