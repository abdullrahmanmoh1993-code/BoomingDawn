/**
 * Bilingual brand slogan.
 * EN: "A new Dawn, A new beginning" — CoupDePoker (fallback Anton/Impact), orange.
 * AR: "فجر جديد، بداية جديدة" — beirut (fallback Cairo/Tajawal), orange.
 */
export function Slogan({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <p
        className="font-display text-booming-orange tracking-wide text-center"
        style={{ fontFamily: "'CoupDePoker', 'Anton', 'Impact', sans-serif", fontWeight: 800 }}
      >
        A new Dawn, A new beginning
      </p>
      <p
        className="text-booming-orange text-center"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: "'beirut', 'Cairo', sans-serif", fontWeight: 700 }}
      >
        فجر جديد، بداية جديدة
      </p>
    </div>
  );
}