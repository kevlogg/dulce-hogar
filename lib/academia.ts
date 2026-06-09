export type Modulo = {
  numero: number
  titulo: string
  descripcion: string
  duracion: string
  temas: string[]
  pdf: string
}

export const MODULOS: Modulo[] = [
  {
    numero: 1,
    titulo: "Tu sitio web es el punto de partida, no el destino",
    descripcion: "Por qué tener un sitio web no es suficiente y qué hacer desde el primer día para que realmente funcione para tu negocio.",
    duracion: "20 min",
    temas: ["Tipos de tráfico web", "El embudo de ventas digital", "5 acciones desde hoy"],
    pdf: "/academia/modulo-01-sitio-web-punto-de-partida.pdf",
  },
  {
    numero: 2,
    titulo: "Redes sociales como motor de tráfico",
    descripcion: "Cómo convertir tus perfiles en una fuente constante de visitas calificadas a tu sitio web, sin ser experto en marketing.",
    duracion: "25 min",
    temas: ["Qué red elegir según tu negocio", "La anatomía de un post que convierte", "Calendario de contenido simple"],
    pdf: "/academia/modulo-02-redes-sociales-motor-trafico.pdf",
  },
  {
    numero: 3,
    titulo: "Aparecer en Google sin pagar publicidad",
    descripcion: "Cómo configurar Google Mi Negocio, generar reseñas auténticas y posicionarte en búsquedas locales.",
    duracion: "20 min",
    temas: ["Configuración de Google Mi Negocio", "Cómo conseguir reseñas", "Los 3 factores de ranking local"],
    pdf: "/academia/modulo-03-google-sin-pagar.pdf",
  },
  {
    numero: 4,
    titulo: "Publicidad paga: cuándo y cómo empezar",
    descripcion: "Cómo invertir en Meta Ads y Google Ads sin tirar el dinero: presupuestos mínimos y métricas que importan.",
    duracion: "25 min",
    temas: ["Meta Ads vs Google Ads", "Presupuesto mínimo efectivo", "Las 5 métricas que importan"],
    pdf: "/academia/modulo-04-publicidad-paga.pdf",
  },
  {
    numero: 5,
    titulo: "WhatsApp y atención al cliente digital",
    descripcion: "Cómo convertir WhatsApp Business en tu canal de ventas más potente con mensajes automáticos y catálogo.",
    duracion: "20 min",
    temas: ["WhatsApp Business completo", "Mensajes automáticos que venden", "Técnicas de cierre por chat"],
    pdf: "/academia/modulo-05-whatsapp-atencion-cliente.pdf",
  },
  {
    numero: 6,
    titulo: "Email marketing y fidelización de clientes",
    descripcion: "Cómo construir una lista de contactos desde cero y usarla para que tus clientes vuelvan y te recomienden.",
    duracion: "25 min",
    temas: ["Construir la lista de email", "Los 5 tipos de email esenciales", "Herramientas gratuitas para empezar"],
    pdf: "/academia/modulo-06-email-marketing-fidelizacion.pdf",
  },
  {
    numero: 7,
    titulo: "Cómo saber si tu sitio está funcionando",
    descripcion: "Google Analytics sin tecnicismos: las 4 métricas que realmente importan y cómo tomar decisiones con datos.",
    duracion: "15 min",
    temas: ["Instalar Google Analytics", "Las 4 métricas críticas", "Con qué frecuencia revisar"],
    pdf: "/academia/modulo-07-medir-si-funciona.pdf",
  },
  {
    numero: 8,
    titulo: "Contenido que atrae y convierte",
    descripcion: "Qué publicar, cómo escribirlo y cómo crear un sistema de contenido que trabaje para tu negocio todos los días.",
    duracion: "25 min",
    temas: ["Cómo encontrar ideas de contenido", "El sistema de reutilización", "La estructura AIDA"],
    pdf: "/academia/modulo-08-contenido-atrae-convierte.pdf",
  },
  {
    numero: 9,
    titulo: "Herramientas gratuitas que todo negocio debería usar",
    descripcion: "Una selección curada de apps y plataformas gratuitas para diseño, gestión, comunicación y ventas.",
    duracion: "20 min",
    temas: ["Herramientas de diseño y redes", "Email y analítica sin costo", "Plan de implementación progresivo"],
    pdf: "/academia/modulo-09-herramientas-gratuitas.pdf",
  },
]
