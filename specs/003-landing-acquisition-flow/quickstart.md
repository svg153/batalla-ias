# Quickstart — implementación futura de la landing pública

## 1. Lee primero el paquete del feature

Orden recomendado:

1. `specs/003-landing-acquisition-flow/spec.md`
2. `specs/003-landing-acquisition-flow/plan.md`
3. `specs/003-landing-acquisition-flow/research.md`
4. `specs/003-landing-acquisition-flow/data-model.md`
5. `specs/003-landing-acquisition-flow/contracts/public-homepage-contract.md`
6. `specs/003-landing-acquisition-flow/contracts/funnel-signals-contract.md`
7. `specs/003-landing-acquisition-flow/contracts/dependency-matrix.md`
8. `specs/002-mortgage-redesign/plan.md`
9. `specs/001-mortgage-comparator-mvp/spec.md`

## 2. No negociables

- no reescribir la semántica hipotecaria de 001
- no convertir la landing en otro producto financiero
- mantener el caso de uso principal: hipoteca actual vs alternativa
- explicar qué datos hacen falta antes de pedirlos
- priorizar coste total real, límites y honestidad sobre mensajes de ahorro agresivos
- no cerrar la ejecución visual hasta disponer de outputs aprobados de 002
- no instrumentar PII ni datos financieros en analítica

## 3. Áreas principales de implementación futura

**Frontend web**

- `apps/web/src/app.tsx`
- `apps/web/src/pages/mortgage-analysis-page.tsx`
- nueva página pública en `apps/web/src/pages/`
- nuevos bloques/feature folder en `apps/web/src/features/` o `apps/web/src/components/`
- `apps/web/src/styles.css`

**Reutilización sin cambios semánticos**

- `apps/web/src/features/mortgage-analysis/*`
- `apps/web/src/services/analysis-api.ts`
- `apps/api/src/routes/analyses.ts`
- `packages/domain/src/formulas/*`
- `packages/domain/src/rules/*`
- `packages/domain/src/validation/*`

## 4. Secuencia recomendada

### Paso 1 — Esperar gate mínimo de 002

No empezar implementación visual hasta tener, como mínimo:

- jerarquía visual aprobada
- tokens base y patrones de componentes
- reglas responsive de la homepage
- directrices de copy/tono cerradas

### Paso 2 — Crear foundation técnica

1. añadir routing SPA en `apps/web/src/app.tsx`
2. crear la ruta de homepage pública
3. mantener la ruta del comparador como destino del CTA principal
4. validar que el comparador existente sigue accesible sin drift funcional

### Paso 3 — Implementar la homepage por bloques

Seguir el contrato de homepage:

1. hero / propuesta principal
2. señales de confianza
3. propuesta de valor
4. breadth signal del caso de uso
5. explicación de qué se compara
6. preparación de datos y límites
7. CTA principal + secundaria
8. pie/contexto operativo

### Paso 4 — Implementar el handoff

- conducir al flujo correcto del comparador
- explicar qué falta si la persona aún no está lista
- evitar duplicar el formulario o crear productos paralelos

### Paso 5 — Instrumentar y validar

- añadir eventos del funnel sin PII
- comprobar comprensión, intención y progreso cualificado
- revisar que todos los claims siguen alineados con 001

## 5. Validación esperada

### Contratos

- homepage pública implementada según `public-homepage-contract.md`
- señales del funnel implementadas según `funnel-signals-contract.md`
- dependencias respetadas según `dependency-matrix.md`

### Navegación

- la ruta raíz muestra la homepage pública
- el CTA principal lleva al comparador
- no hay desvíos hacia recorridos secundarios antes del caso principal

### Contenido

- claims coherentes con 001
- mensajes explanation-first
- límites y preparación visibles antes de prometer resultados

### Analítica

- atención, comprensión, intención, entrada cualificada e inicio de análisis medidos
- eventos sin PII ni importes financieros

## 6. Comandos útiles

Desde la raíz:

- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`

Frontend:

- `corepack pnpm --filter @batalla-ias/web check`
- `corepack pnpm --filter @batalla-ias/web test`
- `corepack pnpm --filter @batalla-ias/web test:e2e`

API:

- `corepack pnpm --filter @batalla-ias/api test`

## 7. Definition of done de 003

La feature estará lista cuando:

- exista una homepage pública coherente con 001 y visualmente alineada con 002
- el handoff al comparador sea directo y sin ambigüedad
- la homepage explique qué hace el producto, qué necesita y cuáles son sus límites
- las señales del funnel estén instrumentadas y revisables
- no se hayan introducido nuevas reglas financieras, nuevos endpoints ni nuevos productos
