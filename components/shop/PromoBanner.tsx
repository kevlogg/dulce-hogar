export function PromoBanner() {
  return (
    <div className="bg-white border-y border-[#E0D4C4]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Argentina Flag - Three Stripes */}
        <div className="flex gap-0 mb-6 h-12 rounded overflow-hidden shadow-sm">
          <div className="flex-1 bg-[#74B9FF]" />
          <div className="flex-1 bg-white flex items-center justify-center">
            <span className="text-lg">🇦🇷</span>
          </div>
          <div className="flex-1 bg-[#74B9FF]" />
        </div>

        {/* Promo Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Promo 1 */}
          <div className="bg-gradient-to-br from-[#F7F3EE] to-[#EFEBE3] p-4 rounded-lg border border-[#C9A87C]">
            <h3 className="text-[#2C1A10] font-bold text-sm mb-1">
              PROMO MUNDIAL
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              10% de descuento en sofás y combos mesa + sillas
            </p>
            <div className="text-[#C9A87C] font-semibold text-xs">
              ¡Aprovechá ahora!
            </div>
          </div>

          {/* Promo 2 */}
          <div className="bg-gradient-to-br from-[#F7F3EE] to-[#EFEBE3] p-4 rounded-lg border border-[#C9A87C]">
            <h3 className="text-[#2C1A10] font-bold text-sm mb-1">
              CUOTAS FIJAS
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              Financiación en 3 y 6 cuotas sin interés
            </p>
            <div className="text-[#C9A87C] font-semibold text-xs">
              Sin sorpresas
            </div>
          </div>

          {/* Promo 3 */}
          <div className="bg-gradient-to-br from-[#F7F3EE] to-[#EFEBE3] p-4 rounded-lg border border-[#C9A87C]">
            <h3 className="text-[#2C1A10] font-bold text-sm mb-1">
              DESCUENTO EN EFECTIVO
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              25% de descuento pagando en efectivo
            </p>
            <div className="text-[#C9A87C] font-semibold text-xs">
              ¡Máximo ahorro!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
