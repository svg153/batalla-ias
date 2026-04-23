# Plan de Implementación: landing pública y flujo primario de adquisición

**Branch**: `[003-landing-acquisition-flow]` | **Date**: 2026-04-23 | **Spec**: `specs/003-landing-acquisition-flow/spec.md`  
**Input**: Feature specification from `/specs/003-landing-acquisition-flow/spec.md`

## Summary

Preparar la homepage pública y el funnel primario de adquisición de `batalla-ias` como una capa de entrada explanation-first hacia el caso de uso central ya definido en `specs/001-mortgage-comparator-mvp/spec.md`: comparar una hipoteca actual frente a una alternativa para decidir si compensa cambiar. La implementación futura debe apoyarse en `apps/web`, añadiendo una entrada pública y un handoff limpio al comparador existente, pero queda explícitamente bloqueada en su ejecución visual por los outputs aprobados de `specs/002-mortgage-redesign/` (dirección de marca, jerarquía visual, patrones responsive y lenguaje de interacción). Este plan deja resuelto qué puede planificarse ya en paralelo, qué depende de 002 y cómo mantener alineada toda promesa pública con la verdad financiera de 001.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18, CSS, Node >=20  
**Primary Dependencies**: React 18, TanStack React Query 5, Vite 5, Vitest 3, Playwright 1.52; incorporación prevista de un router SPA en `apps/web` durante implementación  
**Storage**: N/A para la homepage pública; el flujo futuro reutilizará la sesión/opacidad y los endpoints `/api/v1/analyses` ya existentes en `apps/api`  
**Testing**: Vitest + Playwright en `apps/web`; validación adicional de copy, IA, eventos del funnel y contratos de navegación/medición  
**Target Platform**: Aplicación web responsive en `apps/web` publicada en Vercel  
**Project Type**: Monorepo pnpm con frontend web (`apps/web`), API Express (`apps/api`) y dominio compartido (`packages/domain`)  
**Performance Goals**: Mantener la entrada pública ligera y comprensible para tráfico frío, sin introducir pasos extra antes del CTA principal; preservar la expectativa existente del MVP para creación de análisis y comparación al handoff hacia el comparador  
**Constraints**: No cambiar semántica financiera; no introducir nuevos productos ni backend adicional; toda promesa pública debe ser coherente con 001; la implementación visual final depende de 002; la instrumentación debe evitar PII y respetar minimización de datos  
**Scale/Scope**: Una homepage pública, un funnel primario de adquisición y su handoff al comparador existente en `apps/web`, más contratos de contenido, señales y dependencias para coordinar producto/diseño/frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Financial Accuracy Gate**: PASS. Este feature no redefine fórmulas ni umbrales hipotecarios. La fuente de verdad sigue en `packages/domain/src/formulas/calculate-estimated-installment.ts`, `packages/domain/src/formulas/calculate-total-real-cost.ts`, `packages/domain/src/rules/rank-scenarios-by-total-cost.ts`, `packages/domain/src/validation/analysis-input.ts` y en la semántica aprobada de `specs/001-mortgage-comparator-mvp/spec.md`. El trabajo del feature 003 consiste en encuadrar, explicar y conducir a ese caso de uso sin reinterpretar cálculos.
- **Explainability Gate**: PASS. La homepage y el funnel se diseñan como explanation-first: problema, valor, qué se compara, qué datos harán falta, qué límites existen y qué obtiene la persona antes del CTA principal. Los contratos de contenido y funnel exigen que toda afirmación pública sea trazable a 001 y que la experiencia avise cuando falte información o aún no corresponda emitir una conclusión.
- **Privacy & Security Gate**: PASS. La landing no debe capturar PII financiera innecesaria ni ampliar retención. La instrumentación propuesta se limita a señales anónimas de comportamiento del funnel; cualquier handoff posterior reutiliza la sesión opaca y los mensajes de retención/posesión ya definidos por 001 y servidos por `apps/api`.
- **Total Cost Reality Gate**: PASS. Aunque la homepage no calcula por sí misma, debe reforzar que la decisión se basa en coste total real, costes de cambio, bonificaciones, límites y datos suficientes, nunca en una cuota aislada ni en una promesa agresiva de ahorro. Cualquier simplificación editorial debe remitir al análisis completo del comparador y no ocultar condiciones materiales.
- **Business Rule Validation Gate**: PASS. No se introducen reglas hipotecarias nuevas. Las reglas a validar son de coherencia pública: el caso de uso sigue siendo “hipoteca actual vs alternativa”, el escenario con bonificaciones solo existe si aplica, la asequibilidad ocurre después de una comparación válida y el contenido público no amplía alcance hacia búsqueda de hipotecas nuevas, asesoramiento o generación de ofertas. La validación futura debe cubrir contratos de contenido, navegación, medición y handoff.

## Project Structure

### Documentation (this feature)

```text
specs/003-landing-acquisition-flow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-homepage-contract.md
│   ├── funnel-signals-contract.md
│   └── dependency-matrix.md
└── tasks.md            # se generará después con /speckit.tasks
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── app.tsx
│   ├── pages/
│   │   └── mortgage-analysis-page.tsx
│   ├── features/
│   │   └── mortgage-analysis/
│   ├── components/
│   ├── services/
│   └── styles.css
├── tests/
│   └── e2e/
└── package.json

apps/api/
├── src/
│   ├── routes/analyses.ts
│   ├── modules/analyses/
│   └── middleware/privacy.ts
└── package.json

packages/domain/
├── src/
│   ├── formulas/
│   ├── rules/
│   ├── validation/
│   └── types/
└── package.json
```

**Structure Decision**: Mantener el split actual del monorepo. La implementación futura de 003 se concentrará en `apps/web` (nueva homepage pública, routing SPA y handoff al comparador), reutilizando sin cambios semánticos `apps/api` y `packages/domain`. La coordinación con 002 se documenta como dependencia de diseño, no como dependencia de lógica.

## Phase 0 Research Summary

### Decisions

1. **Integración técnica prevista**: implementar 003 dentro de `apps/web`, añadiendo una homepage pública y routing SPA, en lugar de crear otra app o tocar backend/dominio.
2. **Entrada principal**: el CTA primario debe llevar al recorrido de comparación existente, no a micro-herramientas independientes ni a productos nuevos; la homepage puede mostrar “breadth signal” y preparación, pero solo un use case ejecutable.
3. **IA base**: adoptar una estructura editorial pública con bloques de problema, propuesta de valor, señales de confianza, explicación de qué se compara, preparación de datos, límites y CTA principal, apoyándose en `landing-gap-analysis.md`.
4. **Medición**: formalizar un micro-funnel de cinco señales observables (atención, comprensión, intención, entrada cualificada e inicio real del caso de uso) con eventos anónimos y sin PII.
5. **Dependencias**: 001 fija el significado financiero y los límites del caso de uso; 002 fija la ejecución visual final, responsive y de componentes; 003 puede avanzar ya en contenido, IA, handoff, medición y gobernanza.
6. **Contratos necesarios**: un contrato de homepage pública, un contrato de señales del funnel y una matriz de dependencias bastan para desbloquear implementación futura y coordinación entre producto/diseño/frontend.

### Trabajo seguro en paralelo antes de cerrar 002

- Definir IA, mapa de contenidos y jerarquía del funnel.
- Documentar copy explanation-first y claims permitidos/prohibidos.
- Diseñar el handoff funcional desde homepage hacia el comparador actual.
- Definir eventos, umbrales y dashboards de validación del modelo de negocio.
- Establecer la matriz de dependencias: qué hereda de 001, qué espera de 002 y qué puede construirse en paralelo.

### Trabajo bloqueado por 002

- Tokens visuales definitivos, tipografía y paleta de marca.
- Sistema de componentes y patrones de interacción de la homepage.
- Reglas finales de responsive/layout para hero, bloques de confianza y CTA.
- Ejecución visual del handoff sobre el comparador rediseñado.

## Phase 1 Design Outputs

- `research.md`: decisiones técnicas y de producto para IA, funnel, medición y dependencias.
- `data-model.md`: entidades de planificación del funnel público, handoff y señales de validación.
- `contracts/public-homepage-contract.md`: arquitectura funcional y editorial de la homepage.
- `contracts/funnel-signals-contract.md`: eventos, definiciones y criterios de éxito del funnel.
- `contracts/dependency-matrix.md`: límites entre 001, 002 y 003, incluyendo trabajo paralelo seguro.
- `quickstart.md`: guía operativa para implementar 003 cuando 002 haya madurado lo suficiente.

## Implementation Alignment in `apps/web`

### Current-to-target mapping

| Área actual | Archivo(s) actuales | Evolución prevista para 003 |
|---|---|---|
| Entry point único | `apps/web/src/app.tsx` | Introducir routing SPA para separar homepage pública y flujo de análisis existente |
| Página principal actual | `apps/web/src/pages/mortgage-analysis-page.tsx` | Mantener como destino del CTA/handoff; no convertirla en landing de tráfico frío |
| Formulario actual | `apps/web/src/features/mortgage-analysis/analysis-form.tsx` | Reutilizar como punto de entrada profundo o fase posterior del handoff, sin redefinir sus semánticas |
| Comparación / recomendación / asequibilidad | `apps/web/src/features/mortgage-analysis/*`, `apps/web/src/pages/mortgage-analysis-page.tsx` | Seguir siendo el destino funcional gobernado por 001 y visualmente dependiente de 002 |
| Estilos compartidos | `apps/web/src/styles.css` | Extender con la homepage pública solo cuando 002 cierre tokens/reglas visuales |
| API y sesión | `apps/api/src/routes/analyses.ts`, `apps/api/src/modules/analyses/*` | Reutilización sin cambios funcionales; 003 no añade endpoints ni lógica de negocio |

### Recommended implementation shape

1. **Fase de foundation post-002**
   - Añadir router en `apps/web/src/app.tsx`.
   - Crear una página pública nueva (`apps/web/src/pages/landing-page.tsx` o equivalente).
   - Mantener `MortgageAnalysisPage` como pantalla de análisis existente.

2. **Fase de homepage**
   - Implementar bloques de contenido y confianza definidos en el contrato de homepage.
   - Añadir CTA principal al comparador y CTA secundaria de preparación/ejemplo.
   - Mantener el relato explanation-first antes de cualquier promesa de ahorro.

3. **Fase de handoff**
   - Guiar a la persona hacia el flujo principal con expectativas claras sobre datos mínimos.
   - Mostrar qué necesita preparar si aún no dispone de oferta alternativa o datos suficientes.
   - Evitar crear rutas o productos paralelos que compitan con el comparador principal.

4. **Fase de medición**
   - Instrumentar eventos del funnel sin PII.
   - Medir comprensión, intención y progreso cualificado.
   - Reconciliar resultados con los criterios de éxito del spec.

## Validation Strategy

### Contract / content validation

- Verificar que el contenido público:
  - nombra correctamente el caso de uso central (hipoteca actual vs alternativa),
  - prioriza coste total real y costes de cambio,
  - no promete resultados definitivos sin datos suficientes,
  - no amplía alcance a hipoteca nueva, asesoramiento o generación de ofertas.

### Navigation / handoff validation

- Asegurar que el CTA primario conduce al flujo correcto.
- Comprobar que la homepage no desvía a herramientas secundarias antes del caso de uso principal.
- Verificar rutas raíz/análisis y estados de preparación cuando falten datos.

### Funnel validation

- Medir al menos cinco señales observables:
  - atención inicial,
  - comprensión de propuesta,
  - inicio del flujo principal,
  - progreso cualificado,
  - confianza percibida.
- Instrumentar dashboards y red flags sin capturar datos financieros sensibles.

### Regression / implementation validation

- Mantener las validaciones existentes del comparador en `apps/web`, `apps/api` y `packages/domain`.
- Añadir pruebas futuras de routing, CTA, handoff, instrumentación y visibilidad de mensajes de preparación/límites.
- Tratar cualquier desalineación con 001 o dependencia visual no resuelta con 002 como blocker de implementación.

## Acceptance Traceability

| Requisito / evidencia | Consecuencia de implementación futura |
|---|---|
| Mapa de contenidos de homepage | Nuevos bloques públicos en `apps/web` con jerarquía estable y CTA principal al comparador |
| Recorrido primario definido | Routing SPA + handoff explícito desde landing al flujo de análisis |
| Coherencia con 001 | Copy, claims y preparación de datos deben mapear a reglas/limitaciones ya existentes |
| Dependencia explícita de 002 | Tokens visuales, layout final y patrones UI se bloquean hasta aprobación de 002 |
| Señales de validación del negocio | Instrumentación anónima y dashboards definidos antes de implementación |
| Evitar desvíos a recorridos secundarios | La IA pública puede mostrar amplitud, pero solo un flujo primario ejecutable |

## Post-Design Constitution Check

- **Financial Accuracy Gate**: PASS. El diseño de artefactos mantiene la homepage como capa explicativa; la lógica financiera y su validación siguen residiendo en 001 y en el paquete de dominio.
- **Explainability Gate**: PASS. La propuesta exige bloque de explicación, preparación de datos, límites y trust content antes del CTA principal.
- **Privacy & Security Gate**: PASS. Se documenta instrumentación anónima y se preservan las expectativas de posesión/retención ya definidas por 001.
- **Total Cost Reality Gate**: PASS. El funnel público enfatiza coste total real y costes de cambio; cualquier simplificación comercial queda prohibida por contrato.
- **Business Rule Validation Gate**: PASS. No se alteran reglas de negocio; se añaden contratos de coherencia, dependencia y medición para evitar drift.

## Complexity Tracking

No constitution violations require justification.
