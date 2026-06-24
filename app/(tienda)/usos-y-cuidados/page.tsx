import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Usos y Cuidados | Dulce Hogar",
  description: "Consejos para el cuidado y mantenimiento de tus muebles Dulce Hogar.",
};

const cuidados = [
  {
    icon: "🔥",
    titulo: "Protegé la madera del calor",
    texto: "No apoyés objetos calientes directamente sobre superficies de madera. Usá individuales, posavasos o bases térmicas para evitar manchas permanentes que no tienen reparación.",
  },
  {
    icon: "💧",
    titulo: "Limpiá las manchas en el momento",
    texto: "Ante un derrame, actuá de inmediato con un paño limpio o papel absorbente. Presioná suavemente sin frotar para evitar que la mancha se expanda o penetre en la madera.",
  },
  {
    icon: "🧹",
    titulo: "Productos de limpieza adecuados",
    texto: "Evitá limpiadores con amoníaco o productos abrasivos, ya que opacan y dañan los acabados con el tiempo. Lo ideal es un paño de microfibra ligeramente húmedo seguido de uno seco.",
  },
  {
    icon: "🚫",
    titulo: "No arrastres los muebles",
    texto: "Levantá los muebles en lugar de arrastrarlos para evitar dañar las patas y desalinear la estructura. Si necesitás moverlos frecuentemente, colocá tapas de fieltro en las patas.",
  },
  {
    icon: "⚖️",
    titulo: "Respetá la función de cada mueble",
    texto: "No te pares ni te sientes sobre mesas, cómodas, estantes o cajones. Cada pieza está diseñada para un uso específico; forzarla puede generar deformaciones o roturas.",
  },
  {
    icon: "💧",
    titulo: "Cuidado con la humedad",
    texto: "Mantené los muebles alejados de paredes húmedas o con condensación. La exposición prolongada a la humedad puede dañar la madera, generar hongos y deteriorar los acabados.",
  },
  {
    icon: "🌿",
    titulo: "Difusores y plantas",
    texto: "Colocá difusores de aromas y macetas sobre bases cerámicas o superficies impermeables para evitar que los líquidos o la condensación manchen la madera.",
  },
];

export default function UsosYCuidadosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">← Volver al inicio</Link>
        <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mt-4 mb-2">Dulce Hogar</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Usos y Cuidados
        </h1>
        <p className="text-[#A0724A] mt-3 leading-relaxed">
          Tus muebles son una inversión. Con el cuidado adecuado van a mantener su belleza y funcionalidad por muchos años.
        </p>
      </div>

      <div className="space-y-4">
        {cuidados.map((item) => (
          <div key={item.titulo} className="bg-white border border-[#E0D4C4] rounded-2xl p-5 flex gap-4">
            <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <h2 className="font-bold text-[#2C1A10] mb-1">{item.titulo}</h2>
              <p className="text-sm text-[#3D2B1F] leading-relaxed">{item.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#F7F3EE] border border-[#E0D4C4] rounded-2xl p-6 text-center">
        <p className="text-[#3D2B1F] text-sm mb-4">¿Tenés alguna duda sobre el cuidado de tu mueble?</p>
        <a
          href="https://wa.me/5491126917777?text=Hola!%20Tengo%20una%20consulta%20sobre%20el%20cuidado%20de%20mis%20muebles"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1ead54] transition-all"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
