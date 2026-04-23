# Feature Specification: Landing pública y flujo primario de adquisición hipotecaria

**Feature Branch**: `[003-landing-acquisition-flow]`  
**Created**: 2026-04-23  
**Status**: Ready for Planning  
**Input**: User description: "Planificar una homepage pública y el flujo primario de adquisición para batalla-ias, tomando como referencia la landing y el recorrido principal de hipoteca-2, con foco en validación de modelo de negocio, explicación financiera honesta y entrada al caso de uso principal: comparar una hipoteca actual frente a una alternativa para saber si cambiar merece la pena."

Este feature define el artefacto de planificación para convertir batalla-ias en una homepage pública publicable, orientada a tráfico frío y preparada para validar interés real de mercado. Su alcance cubre la landing/homepage, la narrativa de adquisición, los puntos de confianza y el recorrido de entrada hacia el caso de uso principal del producto.

La semántica financiera y la verdad de negocio continúan ancladas en `specs/001-mortgage-comparator-mvp/`. La expresión visual, de marca y de lenguaje de diseño depende de las decisiones que cierre `specs/002-mortgage-redesign/`. Por tanto, este feature debe quedar listo para planificación antes del cierre de 002, pero su implementación deberá apoyarse en los outputs aprobados de 002.

Recomendación de gobierno: este feature debe mantenerse separado de 002 para evitar mezclar en un mismo alcance la definición de lenguaje de diseño con la definición del funnel público de adquisición, del relato de conversión y del punto de entrada al caso de uso principal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender la propuesta y entrar al caso de uso correcto (Priority: P1)

Como persona que llega por primera vez a batalla-ias y ya tiene una hipoteca, quiero entender rápidamente qué problema resuelve el producto y poder iniciar desde la homepage el recorrido correcto para comparar mi hipoteca actual con una alternativa, para saber si cambiar merece la pena sin perderme en herramientas profundas o secundarias.

**Why this priority**: Sin una homepage pública orientada a descubrimiento, el producto sigue siendo difícil de entender para tráfico frío y no puede validar si existe interés real en el mercado. Esta historia convierte la entrada al producto en una propuesta clara y accionable.

**Independent Test**: Puede probarse mostrando la homepage a una persona que no conoce el producto y verificando que identifica el caso de uso principal, entiende que se compara una hipoteca vigente frente a una alternativa y encuentra un punto de entrada directo al flujo principal sin depender de navegación secundaria.

**Acceptance Scenarios**:

1. **Given** una persona que llega por primera vez a la homepage sin contexto previo, **When** revisa la propuesta principal, **Then** entiende que batalla-ias le ayuda a decidir si le compensa cambiar su hipoteca comparando la actual con una alternativa concreta.
2. **Given** una persona interesada en saber si cambiar le merece la pena, **When** busca cómo empezar, **Then** encuentra un punto de entrada principal al flujo de comparación sin tener que interpretar herramientas profundas, jerga interna o navegación dispersa.
3. **Given** una persona que todavía no está lista para iniciar el análisis, **When** recorre la homepage, **Then** encuentra explicación suficiente sobre qué obtendrá, qué datos necesitará y cuáles son los límites del resultado antes de comprometerse con el flujo.

---

### User Story 2 - Avanzar por un flujo de adquisición honesto y de baja fricción (Priority: P2)

Como visitante con interés real en optimizar mi hipoteca, quiero que la entrada desde la landing hacia el caso de uso principal sea progresiva, explicativa y honesta, para poder avanzar con confianza hacia la comparación entre mi hipoteca actual y una oferta alternativa sin recibir promesas exageradas ni pasos irrelevantes.

**Why this priority**: La validación del modelo de negocio no depende solo de atraer visitas, sino de convertir interés en progreso cualificado hacia el caso de uso central. Si el flujo de entrada no es claro, el producto no podrá distinguir entre curiosidad superficial e intención real.

**Independent Test**: Puede probarse con personas que llegan desde la homepage y verificar que el recorrido de entrada explica qué información es necesaria, diferencia lo obligatorio de lo opcional, mantiene el foco en la comparación principal y no promete un resultado definitivo cuando faltan datos relevantes.

**Acceptance Scenarios**:

1. **Given** una persona que inicia el recorrido desde la homepage, **When** avanza hacia el caso de uso principal, **Then** el flujo le explica qué información mínima necesita para comparar su hipoteca actual con una alternativa y por qué esa información es relevante.
2. **Given** una persona que no dispone todavía de todos los datos para completar la comparación, **When** intenta continuar, **Then** la experiencia le indica qué le falta preparar y evita presentar como definitivo un resultado que depende de datos ausentes.
3. **Given** una persona sensible a mensajes comerciales en productos financieros, **When** revisa la homepage y el flujo de entrada, **Then** percibe una narrativa explanation-first que prioriza límites, supuestos, confianza y utilidad práctica por encima de promesas de ahorro no contextualizadas.

---

### User Story 3 - Validar si la homepage pública genera interés cualificado (Priority: P3)

Como responsable de producto y negocio, quiero que este feature defina con claridad qué señales de evidencia debe producir la homepage pública y su flujo primario, para poder evaluar si batalla-ias atrae atención útil, genera intención cualificada y merece avanzar hacia publicación e iteraciones posteriores.

**Why this priority**: El objetivo de este feature no es solo rediseñar una entrada, sino validar si existe una propuesta publicable capaz de sostener aprendizaje de mercado. Sin evidencia definida, no se podrá decidir con criterio si la homepage cumple su papel.

**Independent Test**: Puede probarse revisando la especificación y confirmando que define señales observables de atracción, comprensión, inicio del flujo principal, progreso cualificado y confianza percibida, además de dejar explícita la dependencia de implementación respecto a 002.

**Acceptance Scenarios**:

1. **Given** que el equipo revisa la preparación del lanzamiento público, **When** analiza este feature, **Then** encuentra definidos los resultados y señales que permitirán distinguir atención, intención cualificada y progreso hacia el caso de uso principal.
2. **Given** que 002 todavía está abierto, **When** el equipo usa esta especificación para planificar, **Then** la dependencia de decisiones de diseño y marca queda explícita sin bloquear la definición funcional del funnel público.
3. **Given** una revisión de alcance entre equipos, **When** se compara este feature con 002, **Then** queda documentado que la homepage pública y el flujo de adquisición se gobiernan como un feature separado para mantener limpieza de alcance y entrega.

---

### Edge Cases

- Una persona llega con tráfico frío y asume que el producto sirve para buscar una hipoteca nueva desde cero; la homepage debe aclarar que el caso de uso principal actual es comparar una hipoteca existente frente a una alternativa.
- Una persona no dispone todavía de una oferta alternativa concreta; la experiencia debe ayudarle a entender qué necesitará para comparar, sin inventar capacidades nuevas ni fingir una recomendación completa.
- La narrativa de captación podría empujar a mensajes demasiado agresivos de ahorro; el feature debe impedir que la homepage sacrifique honestidad financiera o explicación de límites por conversión superficial.
- Las decisiones finales de marca y lenguaje visual de 002 pueden cambiar antes de implementación; este feature debe seguir siendo válido porque define el funnel y la función, no la ejecución visual definitiva.
- Una persona llega directamente a una herramienta profunda o a una sección secundaria; la experiencia pública debe permitir reorientarla al caso de uso principal sin duplicar productos ni crear recorridos paralelos confusos.
- La homepage genera interés, pero no progreso cualificado; el feature debe distinguir entre atención superficial y señales útiles de validación del modelo de negocio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST definir una homepage pública orientada a tráfico frío que actúe como puerta de entrada principal al producto, en lugar de depender de una experiencia inicial centrada en herramientas profundas.
- **FR-002**: La homepage MUST comunicar en lenguaje claro que el caso de uso principal de batalla-ias es ayudar a decidir si compensa cambiar una hipoteca existente comparándola con una alternativa.
- **FR-003**: La homepage y el flujo de adquisición MUST preservar una postura explanation-first y de honestidad financiera, evitando mensajes que prometan ahorro, conveniencia o resultados sin explicar condiciones, supuestos y límites.
- **FR-004**: La homepage MUST incluir contenido de confianza y educación suficiente para que una persona nueva entienda qué problema resuelve el producto, qué valor recibe y qué información necesitará antes de iniciar el flujo principal.
- **FR-005**: El punto de entrada principal desde la homepage MUST conducir al recorrido primario de comparación entre hipoteca actual y alternativa, y MUST priorizar ese recorrido sobre herramientas, navegaciones o casos de uso secundarios.
- **FR-006**: El flujo de adquisición MUST definir una entrada progresiva y de baja fricción hacia el caso de uso principal, explicando antes de pedirlos los datos mínimos necesarios para continuar.
- **FR-007**: El flujo de adquisición MUST diferenciar entre información obligatoria, información opcional y preparación recomendada, para reducir fricción sin degradar la comprensión del resultado esperado.
- **FR-008**: Cuando falten datos clave para completar la comparación principal, la experiencia MUST indicar qué información falta, por qué importa y qué puede hacer la persona después, sin presentar una conclusión definitiva improcedente.
- **FR-009**: El feature MUST mantener como alcance exclusivo la landing/homepage pública, la narrativa de adquisición, los puntos de confianza y el entry-point UX hacia el caso de uso principal, y MUST NOT introducir alcance ajeno como nuevas capacidades backend o nuevos productos financieros no necesarios para ese recorrido.
- **FR-010**: Este feature MUST tomar `specs/001-mortgage-comparator-mvp/` como fuente de verdad de negocio para las reglas y promesas del caso de uso principal.
- **FR-011**: Este feature MUST tomar `specs/002-mortgage-redesign/` como fuente de dependencia para decisiones finales de marca, lenguaje visual y diseño de interacción una vez dichas decisiones estén cerradas.
- **FR-012**: La especificación MUST dejar explícito que la implementación depende de los outputs aprobados de 002, aunque la definición funcional del feature quede lista antes del cierre de 002.
- **FR-013**: La arquitectura de contenido de la homepage MUST priorizar, como mínimo, problema, propuesta de valor, explicación del caso de uso principal, construcción de confianza, límites de la herramienta y llamada a la acción hacia el flujo principal.
- **FR-014**: La homepage MUST reforzar que el resultado prometido al usuario es entender si cambiar su hipoteca merece la pena, no recibir asesoramiento absoluto ni una promesa de ahorro garantizado.
- **FR-015**: Si una persona todavía no dispone de una oferta alternativa o de datos completos, la experiencia MUST ofrecer preparación y orientación contextual para el caso de uso principal, sin ampliar el alcance a generar ofertas, precalificaciones u otros servicios no definidos en 001.
- **FR-016**: El feature MUST definir expectativas de evidencia para validar el modelo de negocio, distinguiendo al menos señales de atracción, comprensión, inicio del flujo principal, progreso cualificado y confianza percibida.
- **FR-017**: El feature MUST recomendar de forma explícita su separación respecto a 002 para mantener gobernanza limpia de alcance, secuencia de entrega y responsabilidad entre diseño base y funnel público.
- **FR-018**: Cualquier afirmación de la homepage o del flujo de adquisición sobre comparación, ahorro, conveniencia o decisión MUST ser coherente con el comportamiento y las limitaciones ya establecidas en 001.

### Required Evidence

- Debe existir un mapa de contenidos de la homepage que identifique propuesta principal, explicación del caso de uso, bloques de confianza, límites y llamadas a la acción.
- Debe existir una definición visible del recorrido primario desde la homepage hasta el inicio de la comparación entre hipoteca actual y alternativa, incluyendo pasos, decisiones y posibles puntos de abandono.
- Debe existir evidencia de que el relato público mantiene consistencia con `specs/001-mortgage-comparator-mvp/` en cuanto a qué se compara, qué se promete y qué límites se explican.
- Debe existir una matriz de dependencia que deje claro qué aspectos funcionales pueden planificarse ya y qué decisiones visuales o de marca quedan supeditadas a `specs/002-mortgage-redesign/`.
- Debe existir una definición explícita de las señales que servirán para validar el modelo de negocio, distinguiendo atención inicial, comprensión de propuesta, inicio del flujo principal, progreso cualificado y confianza.
- Debe existir evidencia de cómo la homepage evita desviar a tráfico frío hacia herramientas o recorridos secundarios antes de presentar el caso de uso principal.
- Debe existir evidencia de que la experiencia explica qué datos hacen falta para el caso de uso principal y cómo se comporta cuando la persona todavía no puede completarlo.

### Key Entities *(include if feature involves data)*

- **Visitante de tráfico frío**: Persona que llega sin conocimiento previo del producto y necesita comprender rápidamente propuesta, utilidad y siguiente paso.
- **Homepage pública**: Experiencia inicial orientada a descubrimiento, confianza y entrada al caso de uso principal.
- **Flujo primario de adquisición**: Recorrido desde la homepage hasta el inicio del caso de uso principal de comparar una hipoteca actual frente a una alternativa.
- **Intención cualificada**: Señal de que la persona no solo muestra curiosidad, sino que entiende la propuesta y avanza con interés real hacia la comparación.
- **Señal de validación**: Evidencia observable que permite evaluar si la homepage pública aporta atención útil, comprensión, confianza y progreso hacia el caso de uso principal.
- **Dependencia de diseño**: Conjunto de decisiones de marca, lenguaje visual y sistema de interacción que este feature utilizará cuando 002 las deje cerradas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En revisiones con personas que no conocen batalla-ias, al menos el 80% identifica en menos de 15 segundos que el producto ayuda a decidir si cambiar una hipoteca existente mediante comparación con una alternativa.
- **SC-002**: Al menos el 70% de las personas evaluadoras que entienden la propuesta principal encuentran sin ayuda el punto de entrada al flujo primario desde la homepage.
- **SC-003**: Al menos el 60% de las personas que inician el recorrido primario completan la etapa inicial de entrada o salen sabiendo con claridad qué información les falta para continuar.
- **SC-004**: El 100% de las afirmaciones principales revisadas en la homepage y el flujo de entrada mantienen coherencia con las limitaciones, promesas y semántica financiera ya definidas en `specs/001-mortgage-comparator-mvp/`.
- **SC-005**: El feature deja definidas al menos cinco señales observables para validar el modelo de negocio, cubriendo atención, comprensión, inicio del flujo principal, progreso cualificado y confianza percibida.
- **SC-006**: El 100% de las revisiones de alcance entre equipos identifican sin ambigüedad que este feature se gobierna separado de 002 y que su implementación depende de outputs de diseño y marca aún no cerrados en 002.
- **SC-007**: El 100% de los recorridos de aceptación muestran una narrativa explanation-first en la que límites, condiciones y utilidad práctica aparecen antes de cualquier interpretación de ahorro garantizado o mensaje comercial agresivo.

## Assumptions

- `specs/001-mortgage-comparator-mvp/` sigue siendo la fuente de verdad para el caso de uso principal y este feature no cambia su semántica financiera.
- `specs/002-mortgage-redesign/` sigue siendo la fuente de decisiones de lenguaje visual, marca y diseño base, aunque este feature pueda definirse antes de que 002 se cierre.
- La implementación de este feature comenzará después de disponer de outputs suficientemente aprobados de 002, aunque la planificación funcional se cierre ahora.
- El caso de uso principal para tráfico público sigue siendo comparar una hipoteca existente frente a una alternativa conocida para decidir si cambiar merece la pena.
- Este feature no amplía el producto a búsqueda de hipotecas nuevas, generación automática de ofertas ni nuevos servicios financieros ajenos al caso de uso principal.
- La experiencia pública debe servir para validar interés de mercado y aprendizaje de negocio, no para mezclar en el mismo entregable la definición del sistema de diseño y del funnel de adquisición.
