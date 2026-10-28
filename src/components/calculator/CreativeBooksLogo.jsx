const LOGO_URL = "https://media.base44.com/images/public/6a305ef10f4b726c3a1258a1/7b989a875_creativelogo.png";

export default function CreativeBooksLogo({ size = "md" }) {
  const sizes = { sm: { h: "h-8" }, md: { h: "h-12" }, lg: { h: "h-14 sm:h-16" } };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`flex items-center ${s.h}`}>
      <img src={LOGO_URL} alt="Creative Books SA" className={`${s.h} w-auto object-contain`} />
      <div className="ml-3 hidden sm:block">
        <p className="text-xs text-muted-foreground tracking-wide leading-tight">Book Cover Design<br />&amp; Print</p>
      </div>
    </div>
  );
}