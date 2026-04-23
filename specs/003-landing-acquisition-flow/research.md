# Research — landing pública y flujo primario de adquisición

## Contexto

El feature 003 convierte `batalla-ias` en una homepage pública orientada a tráfico frío sin alterar la verdad de negocio del comparador hipotecario. La semántica del caso de uso sigue anclada en `specs/001-mortgage-comparator-mvp/spec.md`, mientras que la ejecución visual final depende de `specs/002-mortgage-redesign/`. La investigación resuelve cómo dejar preparado el funnel, la IA y la medición antes de que 002 cierre.

## Decisión 1: Integrar 003 en `apps/web` y no crear otra app

**Decision**: La implementación futura de 003 debe vivir dentro de `apps/web`, añadiendo routing SPA para separar homepage pública y comparador existente.

**Rationale**: El repositorio ya tiene una única app web (`apps/web`) que monta directamente `MortgageAnalysisPage` desde `apps/web/src/app.tsx`. Añadir una landing y un handoff dentro de la misma app minimiza duplicación, preserva el acceso al comparador existente y evita introducir otra superficie técnica para un producto que sigue teniendo un único caso de uso central.

**Alternatives considered**:
- Crear una segunda app para marketing/acquisition — rechazada porque duplicaría despliegue, navegación y estilos sin necesidad.
- Mantener la homepage dentro de la página actual del comparador — rechazada porque sigue imponiendo una experiencia depth-first demasiado exigente para tráfico frío.

## Decisión 2: Mantener un único caso de uso ejecutable y usar “breadth signal” solo como contexto

**Decision**: La homepage puede mostrar amplitud de valor (comparación, ahorro/break-even, asequibilidad, preparación), pero solo debe ofrecer un flujo primario ejecutable: entrar al comparador de hipoteca actual vs alternativa.

**Rationale**: `landing-gap-analysis.md` demuestra que la entrada actual es demasiado profunda para tráfico frío, pero el spec 003 prohíbe ampliar alcance hacia productos nuevos, herramientas paralelas o búsqueda de hipoteca desde cero. La mejor traducción de ese gap es enseñar el valor completo del producto sin multiplicar las rutas reales de interacción.

**Alternatives considered**:
- Replicar el modelo “micro-tools” de hipoteca-2 — rechazada porque 003 no debe inventar nuevos productos.
- Hacer una homepage puramente hero + CTA — rechazada porque no aporta suficiente contexto, confianza ni preparación.

## Decisión 3: Adoptar una IA explanation-first de 8 bloques funcionales

**Decision**: La homepage pública debe estructurarse, como mínimo, en ocho bloques funcionales: hero/propuesta, señales de confianza, propuesta de valor, breadth signal del caso de uso, bloque explicativo, preparación de datos, CTA principal + secundaria y pie/contexto.

**Rationale**: Esta estructura recoge los hallazgos de `landing-gap-analysis.md` y los adapta al alcance real del producto. Permite explicar qué problema resuelve `batalla-ias`, qué obtendrá la persona, qué se compara exactamente, qué información necesitará y cuáles son los límites, antes de pedir interacción profunda.

**Alternatives considered**:
- Landing corta de 2-3 bloques — rechazada porque sacrifica explicación y confianza.
- Reutilizar la hero actual y poner el formulario inmediatamente debajo — rechazada porque mantiene la fricción que el feature pretende resolver.

## Decisión 4: Formalizar el funnel con cinco señales observables y sin PII

**Decision**: El feature debe definir un micro-funnel de cinco señales: atención inicial, comprensión de propuesta, intención, entrada cualificada e inicio del caso de uso, con instrumentación anónima.

**Rationale**: El spec 003 pide evidencia explícita para validar el modelo de negocio. Para que esa evidencia sea operativa, cada etapa del funnel necesita una definición observable, un evento y un umbral asociado, pero sin introducir logging de datos financieros ni comportamiento invasivo incompatible con la constitución.

**Alternatives considered**:
- Medir solo clics en CTA — rechazada porque no distingue comprensión real de curiosidad superficial.
- Medir con payloads ricos incluyendo datos del formulario — rechazada por minimización de datos y riesgo de privacidad.

## Decisión 5: 001 es ancla funcional permanente; 002 es bloqueo de implementación visual

**Decision**: El plan debe tratar a 001 como baseline permanente de semántica financiera y a 002 como baseline pendiente de ejecución visual, responsive y de componentes.

**Rationale**: 003 existe precisamente para preparar el funnel sin mezclar alcance con 002. Por tanto, claims, límites y promesas ya pueden cerrarse hoy porque dependen de 001, mientras que estilos, layout final, componentes y decisiones de marca solo deben cerrarse cuando 002 apruebe sus artefactos.

**Alternatives considered**:
- Esperar a cerrar 002 antes de documentar 003 — rechazada porque bloquea trabajo funcional seguro que puede adelantarse ya.
- Diseñar visualmente 003 al margen de 002 — rechazada porque rompería la gobernanza de diseño acordada.

## Decisión 6: Reutilizar el comparador actual como destino del handoff

**Decision**: El CTA principal de la homepage debe conducir al comparador ya existente en `apps/web/src/pages/mortgage-analysis-page.tsx`, y no a una experiencia nueva de datos o backend.

**Rationale**: El comparador actual ya incorpora los conceptos de comparación, recomendación, asequibilidad, fallback, retención y honestidad operativa. 003 no necesita rehacer ese destino: necesita preparar mejor a la persona antes de entrar y clarificar si está lista para empezar o qué datos le faltan.

**Alternatives considered**:
- Crear un formulario reducido independiente para acquisition — rechazada porque duplicaría semántica y validación.
- Llevar a una pantalla intermedia compleja antes del comparador — rechazada porque añade fricción innecesaria.

## Decisión 7: Crear contratos explícitos de homepage, señales y dependencias

**Decision**: Los artefactos de diseño funcional deben incluir tres contratos: homepage pública, señales del funnel y matriz de dependencias entre 001/002/003.

**Rationale**: 003 necesita dejar clara la frontera entre producto, diseño y futura implementación. Los contratos convierten la planificación en algo ejecutable y revisable por frontend, diseño, contenido y negocio, sin depender de interpretación informal.

**Alternatives considered**:
- Dejar todo en la prosa de `plan.md` — rechazada porque dificulta revisión operativa.
- Crear documentos demasiado genéricos de UX — rechazada porque la implementación necesita artefactos más trazables.
