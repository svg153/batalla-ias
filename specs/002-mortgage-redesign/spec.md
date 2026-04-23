# Feature Specification: Rediseño editorial del comparador hipotecario

**Feature Branch**: `[002-mortgage-redesign]`  
**Created**: 2026-04-23  
**Status**: Ready for Planning  
**Input**: User description: "Rediseño del comparador/simulador hipotecario existente para preservar la verdad de negocio mientras se mejora la documentación de diseño, la coherencia UI/UX y la ejecución frontend del producto web."

Este feature redefine la presentación y la guía de experiencia del comparador hipotecario existente, no su semántica financiera. El alcance se limita al producto web actual en `apps/web` y debe conservar las reglas ya aprobadas sobre conteo de escenarios, ranking por coste total real, visibilidad de costes de cambio y bonificaciones, prerrequisitos de asequibilidad, trazabilidad, retención y estados de calidad de datos definidos en `specs/001-mortgage-comparator-mvp/`.

La dirección visual objetivo es **Editorial Financial Desk**: una evolución del producto actual que combine densidad editorial de lectura deliberada con claridad financiera estructurada. El análisis de precedentes en `VoltAgent/awesome-design-md` debe traducirse en una mezcla sobria de densidad editorial tipo WIRED, legibilidad y confianza fintech tipo Wise, y estructura informativa tipo IBM; se descartan patrones de marketing brillante, hero-first o de captación superficial que resten protagonismo a la evidencia financiera.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender la comparación sin perder evidencia (Priority: P1)

Como persona o unidad familiar que ya tiene una hipoteca, quiero revisar la comparación entre mi situación actual y una oferta concreta dentro de una interfaz más clara y jerarquizada, para identificar con rapidez cuál escenario tiene menor coste real sin perder el detalle que justifica la recomendación.

**Why this priority**: El valor principal del rediseño está en mejorar la comprensión de una decisión financiera de alto impacto sin alterar la verdad del cálculo. Si la comparación no gana claridad visual manteniendo la evidencia, el rediseño falla en su objetivo principal.

**Independent Test**: Puede probarse cargando un análisis válido con hipoteca actual, oferta base y, cuando exista, variante con bonificaciones; la historia queda satisfecha si la pantalla rediseñada permite reconocer el número real de escenarios, su ranking por coste total real y los costes incluidos sin depender de elementos promocionales o explicación oculta.

**Acceptance Scenarios**:

1. **Given** un análisis válido con escenario actual, alternativa base y alternativa con bonificaciones, **When** la persona abre los resultados rediseñados, **Then** ve el ranking por coste total real, el conteo honesto de escenarios y un desglose visible de costes y bonificaciones sin que la cuota mensual sustituya al coste total como señal principal.
2. **Given** una oferta sin bonificaciones explícitas, **When** la comparación se muestra en la interfaz rediseñada, **Then** solo aparecen los escenarios "actual" y "alternativa base" y la interfaz no sugiere un tercer escenario inexistente.
3. **Given** un análisis con datos inferidos o incompletos no bloqueantes, **When** se muestran los resultados, **Then** la pantalla marca de forma visible las hipótesis, los datos faltantes y el impacto potencial sobre la precisión antes de presentar una conclusión.

---

### User Story 2 - Leer la recomendación y la asequibilidad con honestidad en cualquier dispositivo (Priority: P2)

Como titular de una hipoteca que compara una alternativa concreta, quiero que la recomendación y la comprobación de asequibilidad sigan un relato explicativo, accesible y responsive, para poder entender ahorro neto, punto de equilibrio, costes de cambio y capacidad de pago tanto en escritorio como en móvil.

**Why this priority**: La recomendación solo es útil si mantiene honestidad financiera y se puede leer bien en todos los contextos de uso. Esta historia protege la decisión final frente a rediseños que escondan costes, condiciones o advertencias.

**Independent Test**: Puede probarse con un conjunto de estados de recomendación y asequibilidad en escritorio y móvil; la historia queda satisfecha si siempre permanecen visibles ahorro neto, punto de equilibrio, costes de cambio, prerrequisitos de asequibilidad y metadatos de retención/propiedad, y si los controles siguen siendo utilizables por teclado y lectores de pantalla.

**Acceptance Scenarios**:

1. **Given** una comparación válida cuyo escenario recomendado compensa el cambio, **When** la persona revisa la recomendación rediseñada, **Then** la interfaz muestra juntos ahorro neto, punto de equilibrio y costes de cambio, además de la explicación de por qué el escenario recomendado gana por coste total real.
2. **Given** que la asequibilidad solo puede evaluarse después de una comparación válida y sobre el escenario recomendado, **When** la persona entra en esa sección, **Then** la pantalla conserva ese prerrequisito, identifica qué escenario se está evaluando y expone la clasificación de asequibilidad con sus datos de soporte.
3. **Given** un viewport móvil, **When** la persona navega por comparación, recomendación y asequibilidad, **Then** la evidencia esencial, los estados de calidad de datos, el estado fallback/local preview y los metadatos de retención no quedan enterrados exclusivamente en acordeones cerrados, pestañas o tooltips.

---

### User Story 3 - Gobernar el rediseño con documentación reusable y ejecución alineada (Priority: P3)

Como equipo de producto, diseño y frontend, quiero disponer de artefactos explícitos de diseño y UX y aplicarlos después a la interfaz real, para que el rediseño del comparador pueda revisarse, implementarse y mantenerse sin reescribir la lógica de negocio ni degradar la validación existente.

**Why this priority**: El rediseño no debe depender de interpretación tácita. Documentar la dirección y luego aplicarla a `apps/web` reduce ambigüedad, mejora coherencia entre pantallas y protege futuras iteraciones.

**Independent Test**: Puede probarse revisando que el feature genera `design.md` y `ux-study.md` en la carpeta del feature, que ambos documentos cubren la dirección aprobada y que la interfaz actualizada del comparador refleja esos artefactos en los bloques y estados críticos definidos.

**Acceptance Scenarios**:

1. **Given** el inicio del trabajo de rediseño, **When** el equipo prepara el feature, **Then** existen en la carpeta del feature un `design.md` y un `ux-study.md` que documentan la dirección visual, las decisiones UX, el análisis de precedentes y los guardarraíles de honestidad del comparador.
2. **Given** que los artefactos de diseño y UX han sido aprobados, **When** se implementa el rediseño en `apps/web`, **Then** la UI entregada sigue la dirección documentada y conserva intactas las secciones y reglas de negocio bloqueadas por el equipo.
3. **Given** una revisión posterior del producto, **When** diseño o frontend comparan la implementación con los artefactos del feature, **Then** pueden identificar de forma trazable la jerarquía visual, el comportamiento responsive, los estados de validación y los componentes críticos exigidos por el rediseño.

---

### Edge Cases

- Una alternativa con bonificaciones aparenta ser más atractiva por cuota, pero empeora el coste total real por productos vinculados; el rediseño debe hacerlo evidente sin ambigüedad.
- Los costes de cambio superan el ahorro durante todo el horizonte evaluado; la recomendación debe seguir mostrando el punto de equilibrio como inexistente dentro del periodo.
- El análisis está en fallback o vista local previa; la interfaz debe informar claramente ese estado y sus limitaciones de persistencia o trazabilidad.
- Faltan datos clave o existen contradicciones; la pantalla debe resaltar el problema y diferenciar entre bloqueo, estimación condicionada y resultado válido.
- En móvil, el espacio disponible se reduce; la interfaz debe mantener visibles el ranking, los costes de cambio, las advertencias y la base de la recomendación sin enterrarlos en revelaciones opcionales.
- La persona revisa metadatos de sesión, propiedad, expiración o purga; el rediseño debe mantener estos elementos localizables y comprensibles.
- Un estado de accesibilidad depende hoy de color, icono o hover; el rediseño debe añadir señales redundantes y navegación utilizable sin ratón.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST tratar este feature como un rediseño del comparador hipotecario existente, no como una reescritura de semántica de producto, y MUST preservar las reglas ya aprobadas sobre escenarios, ranking por coste total real, recomendación, asequibilidad, retención y trazabilidad.
- **FR-002**: El feature MUST generar en su misma carpeta dos artefactos obligatorios de documentación, `design.md` y `ux-study.md`, antes de considerar aceptado el rediseño visual del producto.
- **FR-003**: `design.md` MUST documentar la dirección **Editorial Financial Desk**, incluyendo principios visuales, sistema de jerarquía, patrones de componentes, comportamiento responsive, reglas de visibilidad de evidencia y anti-patrones que eviten una deriva hacia UI glossy o de captación.
- **FR-004**: `ux-study.md` MUST documentar contexto de decisión, perfil de usuario, flujos de lectura deliberada, necesidades de confianza, riesgos de mala interpretación y criterios de comportamiento para escritorio y móvil.
- **FR-005**: La documentación de diseño MUST incluir un análisis explícito de precedentes procedente de `https://github.com/VoltAgent/awesome-design-md` y justificar por qué el producto adopta una combinación de densidad editorial, claridad fintech estructurada y soporte de lectura tipo hoja de cálculo, descartando patrones centrados en marketing o hero sections.
- **FR-006**: La implementación posterior en `apps/web` MUST seguir los artefactos aprobados y actualizar la interfaz real del comparador para que la UI entregada refleje la dirección visual, de marca y UX definida por el feature.
- **FR-007**: El flujo de captura rediseñado MUST conservar bloques explícitos para retención/acceso, horizonte, hipoteca actual, oferta base, variante opcional con bonificaciones, costes de cambio y perfil del hogar.
- **FR-008**: La interfaz de resultados rediseñada MUST conservar secciones distintas de comparación, recomendación y asequibilidad, manteniendo el prerrequisito de que la asequibilidad solo aparece tras una comparación válida y sobre el escenario objetivo recomendado.
- **FR-009**: La señal principal de decisión MUST seguir siendo el coste total real; la UI MUST NOT presentar la cuota mensual como criterio dominante cuando entre en conflicto con el coste real total.
- **FR-010**: La recomendación MUST mostrar de forma conjunta y visible ahorro neto, punto de equilibrio y costes de cambio, además de explicar el motivo del ranking y el impacto de productos vinculados o bonificaciones.
- **FR-011**: La UI rediseñada MUST mantener honestidad de conteo de escenarios y MUST representar `alternative_with_bonus` únicamente cuando la oferta lo incluya de forma explícita.
- **FR-012**: La UI rediseñada MUST exponer de forma visible costes de cambio, costes de productos vinculados, supuestos, datos faltantes, estados de calidad, fallback/local preview, semántica de propiedad de sesión, expiración, purga y referencias de trazabilidad.
- **FR-013**: En móvil, la evidencia esencial para tomar la decisión MUST permanecer visible en la lectura principal o expandida por defecto y MUST NOT depender exclusivamente de acordeones cerrados, pestañas ocultas o tooltips.
- **FR-014**: El rediseño MUST establecer una jerarquía visual consistente en la que cada pantalla crítica permita identificar primero qué se está comparando, cuál es el criterio de ranking, cuál es la recomendación y qué advertencias condicionan la lectura.
- **FR-015**: El rediseño MUST mantener una postura explanation-first y MUST NOT introducir mensajes, llamadas a la acción o recursos visuales que desplacen u oculten la evidencia financiera, las advertencias o las limitaciones del análisis.
- **FR-016**: La interfaz MUST utilizar semántica accesible y señales redundantes para estados, incluyendo estructura clara de encabezados, etiquetas comprensibles, orden lógico de navegación, foco visible y estados que no dependan solo del color.
- **FR-017**: El rediseño MUST definir reglas de comportamiento responsive para los bloques y componentes críticos, garantizando que la información imprescindible conserve legibilidad, prioridad y contexto desde móvil estrecho hasta escritorio amplio.
- **FR-018**: El rediseño MUST preservar y extender la validación existente, añadiendo cobertura a nivel de componente para la nueva UI y manteniendo o ampliando la cobertura end-to-end de comparación, recomendación, asequibilidad, fallback, retención y estados de calidad.
- **FR-019**: El feature MUST incluir criterios de aceptación trazables que permitan revisar si la implementación final en `apps/web` respeta los artefactos `design.md` y `ux-study.md` en todos los bloques y estados críticos.

### Required Evidence

- Debe existir un `design.md` en la carpeta del feature con principios visuales, jerarquía, sistema de componentes, reglas responsive, anti-patrones y análisis comparado de precedentes de `awesome-design-md`.
- Debe existir un `ux-study.md` en la carpeta del feature con personas objetivo, decisiones de lectura, fricciones, riesgos de interpretación, mapa de contenidos y criterios de visibilidad por dispositivo.
- Debe existir evidencia de que la implementación final en `apps/web` cubre al menos los bloques de captura, comparación, recomendación, asequibilidad, fallback/local preview y metadatos de retención/propiedad.
- Para cada pantalla crítica, debe existir evidencia visible del criterio de ranking, el conteo real de escenarios, el desglose de costes y la explicación de la recomendación.
- Para cada estado móvil crítico, debe existir evidencia de que los datos esenciales no quedan ocultos exclusivamente tras interacciones opcionales.
- Para cada estado de calidad de datos o trazabilidad, debe existir evidencia de etiquetas, mensajes o bloques visibles que permitan entender el alcance y la fiabilidad del resultado.
- Para accesibilidad y regresión, debe existir evidencia de pruebas sobre componentes rediseñados y de preservación o ampliación de los recorridos end-to-end ya bloqueados por el equipo.

### Key Entities *(include if feature involves data)*

- **Bloque de Captura**: Conjunto visible de entradas y metadatos necesarios para construir un análisis, incluyendo acceso/retención, horizonte, hipoteca actual, oferta base, variante con bonificaciones, costes de cambio y perfil del hogar.
- **Sección de Resultado**: Unidad mayor de la experiencia rediseñada que agrupa comparación, recomendación o asequibilidad con su jerarquía y evidencia correspondiente.
- **Evidencia Financiera Visible**: Información necesaria para justificar una decisión, como coste total real, ahorro neto, punto de equilibrio, costes de cambio, supuestos, datos faltantes y trazabilidad.
- **Estado de Calidad y Persistencia**: Estado que comunica fallback/local preview, validez de datos, propiedad de la sesión, expiración, purga o limitaciones del análisis.
- **Paquete de Dirección de Diseño**: Conjunto formado por `design.md` y `ux-study.md` que define la intención del rediseño y sus reglas de aplicación en la interfaz real.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100% de las pantallas críticas de aceptación, una persona revisora puede identificar en menos de 30 segundos qué escenarios se comparan, cuál lidera por coste total real y qué advertencias condicionan la lectura.
- **SC-002**: El 100% de los casos de aceptación del rediseño preservan la honestidad del producto existente: conteo real de escenarios, ranking por coste total real, visibilidad de bonus trap/cost breakdown, prerrequisitos de asequibilidad, fallback claro, metadatos de retención visibles y trazabilidad del resultado.
- **SC-003**: El 100% de los estados críticos revisados en móvil y escritorio mantienen visibles ahorro neto, punto de equilibrio, costes de cambio, estados de calidad y metadatos de persistencia sin depender exclusivamente de elementos colapsados o de hover.
- **SC-004**: Todas las pantallas y recorridos críticos rediseñados pueden completarse solo con teclado y las revisiones de accesibilidad del feature no registran incidencias críticas ni graves en comparación, recomendación, asequibilidad y estados de soporte.
- **SC-005**: `design.md` y `ux-study.md` quedan aprobados dentro de la carpeta del feature y cubren el 100% de los bloques, componentes y estados críticos que después aparecen en la implementación final de `apps/web`.
- **SC-006**: El 100% de los estados con datos faltantes, inferidos o en fallback muestran de forma explícita sus limitaciones antes de que la persona interprete la recomendación o la asequibilidad como definitivas.
- **SC-007**: La cobertura de validación del rediseño incluye pruebas para el 100% de los componentes críticos nuevos o modificados y preserva o amplía los recorridos end-to-end bloqueados para comparación, recomendación, asequibilidad, fallback, retención y accesibilidad semántica.

## Assumptions

- El rediseño mantiene el producto en español y orientado a personas u hogares con una hipoteca existente que comparan su situación frente a una oferta concreta.
- La lógica de negocio, los cálculos financieros y los bloqueos de honestidad ya aprobados en el MVP siguen siendo la fuente de verdad y este feature no cambia su significado, solo su documentación y presentación.
- La dirección **Editorial Financial Desk** es una evolución del producto actual, no un reset completo de identidad, por lo que se permite refinar la marca y la experiencia sin convertir el comparador en una landing de captación.
- La mejor referencia externa para este feature es una combinación sobria de densidad editorial tipo WIRED, claridad fintech tipo Wise y estructura de lectura corporativa tipo IBM; referencias más promocionales o expresivas sirven solo como contraste negativo.
- `design.md` y `ux-study.md` deben vivir en la misma carpeta del feature para que planificación, implementación y revisión futura partan de una sola fuente contextual.
- La implementación final del rediseño sucede después de aprobar la documentación y debe concentrarse en `apps/web`, manteniendo compatibilidad con la validación base ya existente.
