/**
 * Preguntas frecuentes: si el usuario hace una pregunta típica,
 * se devuelve la respuesta automática sin usar el modelo.
 * Hay dos conjuntos: público (web) y cliente (escritorio), con preguntas distintas.
 */

export interface FaqItem {
  /** Preguntas o frases que activan esta respuesta (se compara en minúsculas, sin acentos) */
  triggers: string[];
  /** Respuesta automática */
  answer: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/** FAQs para la web pública: quiénes somos, servicios, precios, contacto, etc. */
export const CHAT_FAQS_PUBLIC: FaqItem[] = [
  {
    triggers: [
      "qué servicios ofrecen",
      "que servicios ofrecen",
      "qué ofrecen",
      "que ofrecen",
      "servicios",
      "qué hacen",
      "que hacen",
      "qué es startupven",
      "que es startupven",
      "qué es stvn",
      "quienes son",
      "quiénes son",
    ],
    answer:
      "En Startupven ofrecemos tres niveles: Launch (validar ideas y arrancar presencia digital con arquitectura definida), Build (editor visual, CMS, ecommerce y más control) y Scale (sistemas a medida, SaaS e infraestructura escalable). Puedes ver el detalle aquí: [Ver servicios](/servicios).",
  },
  {
    triggers: [
      "precio",
      "precios",
      "cuánto cuesta",
      "cuanto cuesta",
      "coste",
      "costo",
      "tarifa",
      "presupuesto",
      "cuánto vale",
      "cuanto vale",
    ],
    answer:
      "Los costes dependen del nivel (Launch, Build o Scale) y del alcance de tu proyecto. Lo mejor es que nos cuentes tu idea por contacto o en este chat y te enviamos una propuesta concreta.",
  },
  {
    triggers: [
      "contacto",
      "contactar",
      "cómo los contacto",
      "como los contacto",
      "escribir",
      "hablar",
      "correo",
      "email",
      "teléfono",
      "telefono",
    ],
    answer:
      "Puedes escribirnos desde la página de contacto o usar el botón de contacto que ves en la web. Aquí puedes ir directo: [Ir a Contacto](/contacto). Respondemos con información concreta sobre alcance, plazos y condiciones.",
  },
  {
    triggers: [
      "proyectos",
      "qué proyectos tienen",
      "que proyectos tienen",
      "portafolio",
      "trabajos",
      "casos",
      "referencias",
    ],
    answer:
      "Puedes ver sistemas y plataformas que hemos diseñado y construido aquí: [Ver proyectos](/proyectos). Si quieres algo similar o a medida, cuéntanos tu idea.",
  },
  {
    triggers: [
      "plazo",
      "plazos",
      "cuánto tardan",
      "cuanto tardan",
      "tiempo de entrega",
      "cuándo está listo",
      "cuando esta listo",
      "duración",
    ],
    answer:
      "Los plazos dependen del tipo de proyecto (Launch, Build o Scale) y del alcance. Tras conocer tu necesidad te indicamos tiempos realistas y siguientes pasos.",
  },
  {
    triggers: [
      "área de clientes",
      "area de clientes",
      "escritorio",
      "acceso",
      "login",
      "entrar",
      "mi cuenta",
      "registrarme",
      "darme de alta",
    ],
    answer:
      "Si ya eres cliente, puedes entrar desde Área de clientes (o Escritorio) con tu usuario. Si aún no tienes cuenta, contáctanos y te indicamos cómo darte de alta.",
  },
  {
    triggers: [
      "launch",
      "build",
      "scale",
      "diferencia entre",
      "qué es launch",
      "que es launch",
      "qué es build",
      "que es build",
      "qué es scale",
      "que es scale",
    ],
    answer:
      "Launch es para validar ideas y tener presencia digital con arquitectura definida. Build añade editor visual, CMS y ecommerce para más autonomía. Scale es para sistemas a medida, SaaS e infraestructura escalable. Detalle completo aquí: [Ver servicios](/servicios).",
  },
  {
    triggers: [
      "donde están",
      "dónde están",
      "ubicación",
      "ubicacion",
      "oficina",
      "dirección",
      "direccion",
    ],
    answer:
      "Trabajamos de forma remota. Para coordinación y reuniones usamos videollamadas. Si necesitas hablar con nosotros: [Ir a Contacto](/contacto).",
  },
  {
    triggers: [
      "tecnologías",
      "tecnologias",
      "qué tecnologías",
      "que tecnologias",
      "stack",
      "con qué trabajan",
      "con que trabajan",
    ],
    answer:
      "Usamos tecnologías modernas y escalables según el proyecto: desde sitios estáticos y CMS hasta plataformas con APIs y bases de datos. El stack concreto se define según tu necesidad. Más info: [Ver servicios](/servicios).",
  },
];

/** FAQs para el área de clientes: soporte, facturación, dominios, tickets, etc. */
export const CHAT_FAQS_CLIENT: FaqItem[] = [
  {
    triggers: [
      "ticket",
      "tickets",
      "soporte",
      "abrir ticket",
      "crear ticket",
      "donde abro un ticket",
      "dónde abro un ticket",
      "solicitud",
      "consulta técnica",
      "consulta tecnica",
    ],
    answer:
      "Puedes abrir un ticket de soporte desde el menú del escritorio: Tickets. Ahí verás los que ya tienes y el botón para crear uno nuevo. El equipo te responderá en el mismo hilo.",
  },
  {
    triggers: [
      "factura",
      "facturas",
      "facturación",
      "facturacion",
      "pagar",
      "pago",
      "cómo pago",
      "como pago",
      "donde pago",
      "dónde pago",
    ],
    answer:
      "Las facturas y el estado de pago de tus proyectos están en la sección Proyectos del escritorio. Si tienes algo pendiente de pago, ahí verás la referencia y los datos para abonar.",
  },
  {
    triggers: [
      "dominio",
      "dominios",
      "renovar dominio",
      "vencimiento dominio",
      "mi dominio",
    ],
    answer:
      "En el escritorio, en la sección Dominios, puedes ver tus dominios, fechas de vencimiento y estado. Para renovar o cambiar algo, abre un ticket de soporte y te lo gestionamos.",
  },
  {
    triggers: [
      "cambiar contraseña",
      "cambiar contrasena",
      "olvidé contraseña",
      "olvide contrasena",
      "recuperar acceso",
    ],
    answer:
      "Para cambiar tu contraseña entra en Mi cuenta dentro del escritorio. Si no puedes acceder, usa la opción de recuperar contraseña en la pantalla de login o contacta por soporte.",
  },
  {
    triggers: [
      "estado de mi proyecto",
      "estado del proyecto",
      "cómo va mi proyecto",
      "como va mi proyecto",
      "avance",
    ],
    answer:
      "El estado de tu proyecto lo gestiona el equipo. Si quieres un update, abre un ticket de soporte desde Tickets en el escritorio y te respondemos con el estado actual.",
  },
  {
    triggers: [
      "billetera",
      "saldo",
      "retirar",
      "retiro",
      "balance",
    ],
    answer:
      "Tu saldo y movimientos están en la sección Billetera del escritorio. Desde ahí puedes solicitar un retiro si aplica a tu cuenta. Para dudas sobre montos o plazos, abre un ticket de soporte.",
  },
  {
    triggers: [
      "mensualidad",
      "mensualidades",
      "cuota",
      "cuotas",
      "próximo pago",
      "proximo pago",
    ],
    answer:
      "En Proyectos del escritorio verás las facturas y fechas de vencimiento asociadas a tus servicios. Si tienes dudas sobre una cuota concreta, abre un ticket de soporte indicando el proyecto o referencia.",
  },
  {
    triggers: [
      "acceso al panel",
      "no puedo entrar",
      "no me deja entrar",
      "error al iniciar sesión",
      "error al iniciar sesion",
    ],
    answer:
      "Si no puedes acceder al escritorio, revisa usuario y contraseña. Si olvidaste la contraseña, usa recuperar en la pantalla de login. Si el problema sigue, abre un ticket desde la web de contacto indicando tu email y te ayudamos.",
  },
  {
    triggers: [
      "cambiar email",
      "cambiar correo",
      "actualizar email",
      "actualizar correo",
    ],
    answer:
      "Puedes actualizar tu email desde Mi cuenta en el escritorio. Si necesitas cambiar a un email que ya existe o hay algún bloqueo, abre un ticket de soporte.",
  },
  {
    triggers: [
      "hosting",
      "servidor",
      "subir archivos",
      "ftp",
      "acceso al servidor",
    ],
    answer:
      "El acceso a hosting o servidor depende de tu tipo de proyecto (Launch, Build o Scale). Para credenciales, subida de archivos o FTP, abre un ticket de soporte y te enviamos los datos o los pasos según tu plan.",
  },
];

/** Preguntas sugeridas para la web pública */
export const SUGGESTED_QUESTIONS_PUBLIC = [
  "¿Qué servicios ofrecen?",
  "¿Cuánto cuesta?",
  "¿Cómo los contacto?",
  "¿Qué proyectos tienen?",
  "¿Cuánto tardan?",
  "¿Qué es Launch / Build / Scale?",
  "¿Dónde está el área de clientes?",
];

/** Preguntas sugeridas para el área de clientes (más técnicas) */
export const SUGGESTED_QUESTIONS_CLIENT = [
  "¿Cómo abro un ticket de soporte?",
  "¿Dónde veo mis facturas?",
  "¿Cómo cambio mi contraseña?",
  "¿Dónde están mis dominios?",
  "¿Cuál es el estado de mi proyecto?",
  "¿Cómo solicito un retiro de billetera?",
  "¿Cómo actualizo mi email?",
];

export type ChatFaqContext = "public" | "client";

function getFaqList(context: ChatFaqContext): FaqItem[] {
  return context === "client" ? CHAT_FAQS_CLIENT : CHAT_FAQS_PUBLIC;
}

/**
 * Comprueba si el texto del usuario coincide con una pregunta frecuente.
 * Devuelve la respuesta automática o null si no hay match.
 * @param context "public" para web, "client" para escritorio
 */
export function matchFaq(userText: string, context: ChatFaqContext = "public"): string | null {
  const normalized = normalize(userText);
  if (!normalized) return null;
  const list = getFaqList(context);
  for (const faq of list) {
    for (const trigger of faq.triggers) {
      if (normalized.includes(normalize(trigger)) || normalize(trigger).includes(normalized)) {
        return faq.answer;
      }
    }
  }
  return null;
}

/** Preguntas sugeridas según contexto (para no romper imports existentes) */
export function getSuggestedQuestions(context: ChatFaqContext): string[] {
  return context === "client" ? SUGGESTED_QUESTIONS_CLIENT : SUGGESTED_QUESTIONS_PUBLIC;
}

/** @deprecated Usa getSuggestedQuestions(context) o SUGGESTED_QUESTIONS_PUBLIC */
export const SUGGESTED_QUESTIONS = SUGGESTED_QUESTIONS_PUBLIC;
