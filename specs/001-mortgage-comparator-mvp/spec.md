# Feature Specification: MVP de comparador y simulador de hipotecas

**Feature Branch**: `[001-mortgage-comparator-mvp]`  
**Created**: 2026-04-23  
**Status**: Ready for Implementation  
**Input**: User description: "MVP de comparador y simulador de hipotecas con análisis de coste total y asequibilidad para una aplicación web fullstack de gestión/comparación/optimización de hipotecas."

Usuarios principales del MVP: personas o unidades familiares que desean comparar su hipoteca actual con una oferta alternativa y entender si les conviene cambiar, así como cuál sería el coste total real y si la nueva cuota es asumible.

Alcance del MVP: una comparación por análisis entre una hipoteca actual y una oferta alternativa. El sistema siempre compara el escenario actual y la oferta alternativa sin bonificaciones, y solo añade la variante con bonificaciones cuando la oferta la define de forma explícita. La asequibilidad se evalúa después de la comparación sobre el escenario objetivo de la recomendación de cambio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comparar escenarios hipotecarios (Priority: P1)

Como persona que está revisando su hipoteca, quiero introducir los datos de mi hipoteca actual y de una oferta alternativa para comparar, en un mismo análisis, el escenario actual, la oferta sin bonificaciones y, cuando exista, la oferta con bonificaciones, de forma que pueda decidir cuál tiene el menor coste total real.

**Why this priority**: Es el núcleo del producto y la base de todas las decisiones posteriores. Sin una comparación consistente entre escenarios, el resto del MVP no aporta valor accionable.

**Independent Test**: Se puede probar de forma independiente introduciendo una hipoteca actual y una oferta alternativa, verificando que el sistema devuelve siempre los escenarios "actual" y "alternativa sin bonificaciones", y añade "alternativa con bonificaciones" solo cuando la oferta incluye bonificaciones explícitas. La evidencia mínima es una tabla comparativa con importes, gastos incluidos y diferencia absoluta y porcentual frente al escenario actual.

**Acceptance Scenarios**:

1. **Given** una hipoteca actual y una oferta alternativa con costes y bonificaciones completos, **When** la persona solicita la comparación, **Then** el sistema muestra los escenarios "actual", "alternativa sin bonificaciones" y "alternativa con bonificaciones" con su cuota estimada, coste total real y coste final pagado.
2. **Given** una oferta alternativa en la que las bonificaciones reducen el tipo aplicado pero añaden costes recurrentes, **When** el sistema calcula el resultado, **Then** el ranking final refleja el coste total real y no solo la cuota mensual.
3. **Given** que falta un dato relevante para la precisión del cálculo, **When** la persona intenta finalizar el análisis, **Then** el sistema informa qué dato falta y marca el resultado como estimación condicionada o impide emitir recomendación final, según el impacto del dato ausente.
4. **Given** una oferta alternativa sin bonificaciones definidas, **When** la persona solicita la comparación, **Then** el sistema compara únicamente "actual" y "alternativa sin bonificaciones" y no genera un escenario adicional vacío o implícito.

---

### User Story 2 - Saber si compensa cambiar de hipoteca (Priority: P2)

Como titular de una hipoteca vigente, quiero saber si compensa cambiar a otra hipoteca y en qué momento se recuperan los gastos del cambio, para tomar una decisión económica fundamentada.

**Why this priority**: Después de comparar escenarios, la siguiente decisión de mayor valor es saber si el ahorro neto justifica los costes de cambiar. Esta historia convierte el cálculo en una recomendación accionable.

**Independent Test**: Se puede probar con una comparación ya calculada y un conjunto completo de costes de cambio, verificando que el sistema indica si el cambio compensa o no, cuál es el ahorro neto esperado y en qué mes o año se alcanza el punto de equilibrio cuando existe. La evidencia mínima es un desglose de ahorro acumulado frente a gastos iniciales.

**Acceptance Scenarios**:

1. **Given** una oferta alternativa cuyo ahorro acumulado supera los gastos de cambio dentro del horizonte analizado, **When** la persona revisa la recomendación, **Then** el sistema indica que compensa cambiar y muestra el momento estimado en el que se recuperan los gastos.
2. **Given** una oferta alternativa cuyo ahorro no cubre agencia, notaría, comisiones y otros costes asociados durante el horizonte analizado, **When** se genera la recomendación, **Then** el sistema indica que no compensa cambiar y explica qué costes impiden alcanzar el punto de equilibrio.
3. **Given** dos escenarios con ahorro muy similar, **When** uno de ellos requiere productos vinculados con mayor coste total, **Then** la recomendación prioriza el escenario con menor coste total real, aunque su cuota aislada no sea la más baja.

---

### User Story 3 - Evaluar asequibilidad del hogar (Priority: P3)

Como hogar que está estudiando una nueva hipoteca, quiero conocer si el escenario recomendado tras la comparación es asumible según nuestros ingresos familiares y nivel de endeudamiento, para evitar comprometer una operación que no encaja con nuestra capacidad de pago.

**Why this priority**: El MVP no solo debe identificar la opción más barata, sino también evitar decisiones inviables. La asequibilidad completa la recomendación financiera mínima del producto.

**Independent Test**: Se puede probar completando primero la comparación, introduciendo después ingresos familiares netos y obligaciones recurrentes, y comprobando que el sistema evalúa el escenario objetivo de la recomendación, clasifica el resultado como asumible, ajustado o no asumible y muestra el coeficiente de endeudamiento junto con advertencias de calidad de datos cuando proceda. La evidencia mínima es el cálculo visible del ratio y la identificación del escenario evaluado.

**Acceptance Scenarios**:

1. **Given** una comparación válida cuyo escenario objetivo recomendado tiene una cuota compatible con el ingreso del hogar, **When** el sistema calcula la asequibilidad, **Then** clasifica la hipoteca como asumible y muestra el coeficiente de endeudamiento resultante para ese escenario recomendado.
2. **Given** un hogar cuyo coeficiente de endeudamiento con la cuota del escenario recomendado supera el umbral máximo definido para el MVP, **When** se evalúa la asequibilidad, **Then** el sistema clasifica la hipoteca como no asumible y explica el motivo.
3. **Given** un hogar con ingresos variables u obligaciones inferidas mediante una hipótesis explícita, **When** se solicita la evaluación, **Then** el sistema calcula la clasificación aplicable, la marca como estimación condicionada y muestra el impacto de las hipótesis aplicadas.
4. **Given** que faltan ingresos netos u obligaciones recurrentes necesarios para calcular el ratio, **When** se solicita la evaluación de asequibilidad, **Then** el sistema bloquea la evaluación y explica qué dato crítico falta antes de emitir una clasificación.

---

### Edge Cases

- La persona introduce datos contradictorios entre cuota actual, plazo restante y capital pendiente; el sistema debe señalar la inconsistencia antes de comparar.
- Las bonificaciones reducen el tipo nominal, pero el coste adicional de seguros o productos vinculados empeora el coste total real.
- La oferta alternativa no incluye bonificaciones; el sistema debe comparar solo "actual" y "alternativa sin bonificaciones" sin inventar un tercer escenario.
- Los gastos de cambio son tan altos que no se alcanza punto de equilibrio dentro del horizonte analizado.
- El hogar supera el umbral máximo de endeudamiento incluso en el escenario más barato.
- Hay valores cero, negativos o fuera de rango en importes, plazo, tipo de interés, ingresos u obligaciones.
- El análisis usa una proyección parcial del plazo restante; el sistema debe indicar claramente que el resultado depende del horizonte elegido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir capturar los datos mínimos de la hipoteca actual: capital pendiente, plazo restante, tipo aplicable, cuota actual cuando exista, comisiones relevantes y gastos asociados al mantenimiento o cancelación.
- **FR-002**: El sistema MUST permitir capturar una oferta alternativa con un escenario obligatorio sin bonificaciones y un escenario con bonificaciones opcional, solo cuando la oferta incluya condiciones de bonificación explícitas.
- **FR-003**: El sistema MUST registrar de forma separada los gastos asociados al análisis, incluyendo como mínimo agencia, notaría y otros costes asociados declarados por la persona usuaria.
- **FR-004**: El sistema MUST calcular para cada escenario la cuota estimada, el coste total real y el coste final pagado durante el horizonte de evaluación seleccionado.
- **FR-005**: El sistema MUST comparar siempre los escenarios "hipoteca actual" y "alternativa sin bonificaciones", y MUST añadir "alternativa con bonificaciones" únicamente cuando la oferta alternativa incluya bonificaciones definidas.
- **FR-006**: El sistema MUST mostrar un desglose visible de qué costes, bonificaciones, productos vinculados, comisiones y supuestos se han incluido en cada escenario.
- **FR-007**: El sistema MUST ordenar los escenarios por coste total real y mostrar la diferencia absoluta y porcentual frente al escenario actual.
- **FR-008**: El sistema MUST determinar si compensa cambiar de hipoteca comparando el ahorro acumulado esperado con todos los gastos de cambio incluidos en el análisis.
- **FR-009**: El sistema MUST informar el momento estimado de punto de equilibrio cuando el ahorro acumulado supera los gastos de cambio dentro del horizonte evaluado, o indicar explícitamente que no se alcanza cuando corresponda.
- **FR-010**: El sistema MUST exigir que exista una comparación válida antes de evaluar asequibilidad y MUST evaluar la asequibilidad del escenario objetivo definido por la recomendación de cambio vigente del análisis.
- **FR-011**: El sistema MUST calcular y mostrar el coeficiente de endeudamiento resultante y clasificar la hipoteca como "asumible" si el ratio es de hasta el 35%, "ajustada" si supera el 35% y no excede el 40%, y "no asumible" si supera el 40%; la falta o incertidumbre de datos se expresa mediante el estado de calidad del resultado, no con una cuarta clasificación.
- **FR-012**: El sistema MUST explicar cada recomendación en lenguaje comprensible, incluyendo entradas usadas, costes considerados, supuestos aplicados, umbrales de endeudamiento y motivo del resultado final.
- **FR-013**: El sistema MUST devolver en cada salida calculada referencias trazables de fórmulas y reglas aplicadas, incluyendo identificador, versión y documento fuente.
- **FR-014**: El sistema MUST diferenciar claramente entre datos introducidos por la persona usuaria, datos inferidos y valores calculados.
- **FR-015**: El sistema MUST detectar valores inválidos, faltantes o contradictorios antes de emitir una recomendación final y debe indicar qué corrección o dato adicional se necesita.
- **FR-016**: El sistema MUST marcar cualquier salida basada en hipótesis no bloqueantes como estimación condicionada y mostrar qué dato ausente o supuesto limita la precisión del resultado.
- **FR-017**: El sistema MUST proteger cada análisis mediante un token opaco de posesión emitido al crearlo; conocer `analysisId` por sí solo MUST NOT conceder acceso de lectura, recálculo o borrado.
- **FR-018**: El sistema MUST requerir HTTPS fuera de entornos locales, MUST redactar importes, ingresos, obligaciones y tokens en logs/analítica/errores, y MUST obtener secretos de ejecución únicamente desde variables de entorno o un gestor de secretos.
- **FR-019**: El sistema MUST retener los análisis `session_only` hasta el fin de la sesión del navegador o un máximo de 4 horas de inactividad, lo que ocurra antes, y los análisis `save_analysis` durante un máximo de 30 días desde su creación salvo borrado previo.
- **FR-020**: El sistema MUST purgar los análisis `session_only` en un plazo máximo de 15 minutos tras su expiración y los análisis `save_analysis` en un plazo máximo de 24 horas tras su expiración o solicitud de borrado.

### Required Evidence

- Para cada cálculo de escenario, el sistema debe poder mostrar el desglose de coste total real y coste final pagado con todas las categorías de gasto incluidas.
- Para cada comparación, debe existir una tabla o vista equivalente que evidencie el ranking de escenarios y la diferencia frente al escenario actual.
- Para cada recomendación de cambio, debe existir evidencia del ahorro acumulado, los gastos de cambio considerados y el punto de equilibrio o su ausencia.
- Para cada evaluación de asequibilidad, debe existir evidencia del ingreso familiar usado, las obligaciones recurrentes, la cuota considerada, el escenario recomendado evaluado y el coeficiente de endeudamiento resultante.
- Para cada salida condicionada, debe existir evidencia visible de los datos faltantes o de las hipótesis aplicadas.
- Para cada salida calculada, debe existir evidencia visible de las referencias de fórmula y regla aplicadas, con identificador, versión y documento fuente.
- Para cada flujo que maneje datos financieros o familiares, debe quedar identificado qué datos sensibles se capturan, qué token de acceso protege el análisis y cuál es su expectativa de retención y purga en el MVP.

### Key Entities *(include if feature involves data)*

- **Análisis Hipotecario**: Agrupa los datos de una comparación concreta entre una hipoteca actual y una oferta alternativa, junto con horizonte, supuestos y resultados.
- **Escenario Hipotecario**: Representa una variante comparable dentro del análisis, como hipoteca actual, alternativa sin bonificaciones o alternativa con bonificaciones.
- **Coste Asociado**: Representa un gasto individual que afecta al coste total real, como agencia, notaría, comisión, seguro vinculado u otro concepto declarado.
- **Perfil Financiero Familiar**: Representa ingresos netos, obligaciones recurrentes y otros datos necesarios para calcular la asequibilidad y el coeficiente de endeudamiento.
- **Recomendación de Cambio**: Representa la conclusión del análisis sobre si compensa cambiar, el ahorro neto esperado, el punto de equilibrio y la explicación asociada.
- **Sesión de Acceso al Análisis**: Representa el token opaco de posesión asociado a un análisis del MVP, su expiración y su ámbito de acceso.
- **Referencia Trazable**: Representa la fuente versionada de una fórmula o regla aplicada en un cálculo expuesto al usuario o a la API.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los casos de aceptación del MVP muestran coste total real, coste final pagado y ranking de escenarios coherentes con las reglas documentadas en esta especificación.
- **SC-002**: Una persona usuaria puede completar un análisis hipotecario inicial, desde la introducción de datos hasta la recomendación final, en menos de 5 minutos usando solo la información solicitada por el flujo.
- **SC-003**: El 100% de las recomendaciones de cambio indican de forma explícita si compensa cambiar y si existe o no punto de equilibrio dentro del horizonte analizado.
- **SC-004**: El 100% de los escenarios de asequibilidad cubiertos por aceptación quedan clasificados correctamente como asumible, ajustada o no asumible según los umbrales definidos, con `conditional_estimate` o bloqueo cuando aplique por calidad de datos.
- **SC-005**: El 100% de las salidas generadas con datos incompletos identifican de forma visible los datos faltantes o las hipótesis aplicadas antes de mostrar el resultado.
- **SC-006**: Ningún flujo de aceptación expone datos financieros o familiares fuera del análisis autorizado ni los retiene más allá de la expectativa declarada para el MVP.
- **SC-007**: El 100% de las respuestas calculadas de comparación, recomendación y asequibilidad incluyen referencias trazables de fórmulas y reglas con versión y fuente documental.
- **SC-008**: En un lote fijo de 30 comparaciones ejecutado con 10 solicitudes concurrentes en el entorno local de referencia del equipo, `POST /api/v1/analyses/{analysisId}/compare` mantiene un p95 inferior a 500 ms.
- **SC-009**: El 100% de las ofertas sin bonificaciones generan exactamente dos escenarios comparables y no muestran un escenario con bonificaciones vacío o derivado.

## Assumptions

- El MVP cubre una única comparación por análisis entre una hipoteca actual y una única oferta alternativa.
- Los importes monetarios del MVP se expresan en euros y los ingresos y obligaciones del hogar se introducen en formato mensual neto.
- El horizonte de evaluación puede coincidir con el plazo restante o con un periodo menor elegido por la persona usuaria, siempre que el sistema lo indique de forma explícita.
- Los costes no enumerados de forma específica pueden introducirse en la categoría "otros costes asociados" para no ocultar impacto económico relevante.
- El MVP no incluye asesoramiento legal personalizado, contratación de productos, integración automática con bancos ni verificación documental de ingresos.
- El MVP no incluye cuentas de usuario; la posesión del token opaco emitido al crear el análisis define su acceso durante la vida útil del mismo.
- Si la persona usuaria no solicita guardar el análisis, la expectativa por defecto es no conservar datos sensibles más allá de la sesión activa del análisis o 4 horas de inactividad.
- `save_analysis` es una retención temporal de conveniencia del MVP y no un archivo permanente; su TTL máximo es de 30 días.
- La asequibilidad se calcula únicamente después de la comparación y sobre el escenario objetivo de la recomendación de cambio vigente.
