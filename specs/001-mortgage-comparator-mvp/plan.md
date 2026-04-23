# Implementation Plan: MVP de comparador y simulador de hipotecas

**Branch**: `[001-mortgage-comparator-mvp]` | **Date**: 2026-04-23 | **Spec**: [`specs/001-mortgage-comparator-mvp/spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/001-mortgage-comparator-mvp/spec.md`

## Summary

Entregar un MVP web fullstack capaz de capturar una hipoteca actual y una oferta alternativa,
comparar siempre los escenarios `current` y `alternative_without_bonus`, añadir
`alternative_with_bonus` solo cuando la oferta lo defina explícitamente, rankear por coste total
real, determinar si compensa cambiar, estimar el punto de equilibrio y evaluar la asequibilidad
del escenario objetivo de la recomendación. La implementación se estructurará como una
aplicación web en monorepo con frontend React, API REST en Node/Express y un paquete de dominio
aislado para fórmulas, reglas, validaciones, catálogo versionado de políticas y salidas
explicables auditables.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS, React 18  
**Primary Dependencies**: React, Vite, Express, Zod, Decimal.js, TanStack Query, PostgreSQL, Vitest, Supertest, Playwright  
**Storage**: PostgreSQL 16 para `save_analysis`; análisis `session_only` ligados a cookie/token opaco con expiración por inactividad de 4 horas y `save_analysis` con TTL máximo de 30 días  
**Testing**: Vitest (unidad/regresión), Supertest + validación OpenAPI (contrato/integración), Playwright (E2E)  
**Target Platform**: Navegadores modernos y despliegue Linux en contenedor  
**Project Type**: Aplicación web fullstack en monorepo pnpm workspace  
**Performance Goals**: p95 < 500 ms para cálculo de comparación; LCP < 2 s en vista principal; recorrido completo < 5 min para usuario  
**Constraints**: aritmética decimal exacta; respuestas explicables; no retener datos sensibles por defecto; acceso a análisis por token opaco ligado a cookie segura; secretos solo vía entorno/secret manager; soportar un análisis con una hipoteca actual y una oferta alternativa  
**Scale/Scope**: MVP para decenas de usuarios concurrentes, un análisis por sesión, sin integraciones bancarias automáticas

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design and still compliant.*

- **Financial Accuracy Gate — PASS**
  - Fórmulas afectadas: cuota estimada por amortización francesa, coste total real, coste final pagado,
    ahorro acumulado, punto de equilibrio y ratio de endeudamiento.
  - Implementación prevista: `packages/domain/src/formulas/*`, `packages/domain/src/rules/*`,
    `packages/domain/src/validation/*`.
  - Precisión: `Decimal.js` con cálculo interno a 4 decimales y redondeo HALF_UP a 2 decimales para salida.
  - Evidencia: fixtures dorados, pruebas de bordes, regresiones de redondeo y tests por regla.
- **Explainability Gate — PASS**
  - Cada escenario devolverá entradas usadas, datos inferidos, fórmula aplicada, costes incluidos,
    bonificaciones, reglas disparadas, hipótesis, `policyVersion` y referencias versionadas a las
    fórmulas y reglas aplicadas.
  - UI y API exponen resumen, desglose detallado y trazas funcionales aptas para auditoría.
- **Privacy & Security Gate — PASS**
  - Datos sensibles: capital pendiente, cuota actual, plazo restante, ingresos netos, obligaciones recurrentes.
  - Decisiones: token opaco de posesión emitido al crear el análisis, cookie `analysis_session`
    `Secure` + `HttpOnly` + `SameSite=Lax` fuera de local, retención `session_only` hasta fin de
    sesión o 4 horas de inactividad, retención `save_analysis` hasta 30 días, borrado explícito y
    redacción de logs.
  - Controles: IDs opacos, hash del token en servidor, límites de acceso al análisis, HTTPS fuera
    de local, sanitización de payloads y no registrar importes sensibles ni secretos en texto plano.
- **Total Cost Reality Gate — PASS**
  - Costes incluidos: intereses, comisiones, seguros/productos vinculados, agencia, notaría, tasación,
    gestoría/cancelación/subrogación si aplican, y otros costes declarados.
  - Asequibilidad: ingresos netos, obligaciones recurrentes y cuota del escenario evaluado.
  - Omisiones justificadas: impuestos o costes de compraventa no ligados al cambio hipotecario quedan fuera
    del cálculo base del MVP salvo que se declaren como "otros costes asociados".
- **Business Rule Validation Gate — PASS**
  - Reglas: ranking por coste total real, clasificación de endeudamiento (<=35%, >35% y <=40%, >40%),
    bloqueo por datos críticos faltantes/contradictorios, estimación condicionada, break-even cuando
    ahorro acumulado >= costes de cambio, comparación de dos escenarios cuando no haya bonificaciones
    y flujo canónico de asequibilidad sobre el escenario objetivo recomendado.
  - Validación: unit tests por fórmula/regla, contract tests de payloads y campos explicables,
    integration/E2E para tres historias de usuario y casos límite.

### Post-Design Constitution Check

La fase de diseño mantiene la conformidad:

- `research.md` resuelve tecnología, precisión, privacidad y estrategia de pruebas sin dejar
  `NEEDS CLARIFICATION`.
- `data-model.md` distingue datos introducidos, inferidos y calculados.
- `contracts/openapi.yaml` fuerza explicabilidad, trazabilidad versionada, semántica de acceso por
  cookie y TTLs de retención.
- `quickstart.md` incluye validación funcional para comparación, recomendación, asequibilidad,
  escenario sin bonificaciones y performance smoke.

## Project Structure

### Documentation (this feature)

```text
specs/001-mortgage-comparator-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── api/
│   ├── src/
│   │   ├── modules/
│   │   │   └── analyses/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── app.ts
│   └── tests/
│       ├── contract/
│       └── integration/
└── web/
    ├── src/
    │   ├── features/
    │   │   └── mortgage-analysis/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── tests/
        └── e2e/

packages/
└── domain/
    ├── src/
    │   ├── formulas/
    │   ├── rules/
    │   ├── validation/
    │   ├── explainability/
    │   └── types/
    └── tests/
        ├── unit/
        └── regression/
```

**Structure Decision**: Se adopta una estructura web fullstack con `apps/api`, `apps/web` y
`packages/domain` para aislar cálculos y reglas del dominio hipotecario del transporte HTTP y
de la UI. Esto maximiza exactitud verificable, reutilización entre frontend/backend y pruebas
regresivas centradas en negocio.

## Implementation Architecture

### Component Map

1. **Frontend Web (`apps/web`)**
   - Formularios de captura para hipoteca actual, oferta alternativa, costes y perfil familiar.
   - Tabla comparativa de escenarios con ranking, diferencias y badges de completitud.
   - Vista de recomendación con punto de equilibrio y explicación textual.
2. **API REST (`apps/api`)**
   - Orquesta validación, persistencia opcional y ejecución del motor de dominio.
   - Expone endpoints para crear análisis, comparar escenarios, recalcular asequibilidad,
     recuperar y borrar análisis.
3. **Motor de dominio (`packages/domain`)**
   - Cálculo puro y determinista de cuotas, costes, ranking, break-even y asequibilidad.
   - Reglas de negocio versionables y validaciones de consistencia.
   - DTOs explicables con trazabilidad de inputs, supuestos y reglas disparadas.
4. **Persistencia**
   - PostgreSQL para análisis guardados, resultados resumidos y metadatos mínimos de auditoría.
   - Datos efímeros por defecto cuando el usuario no solicita guardar el análisis.

### Access Control, Retention & Secret Model

- **Propiedad del análisis (MVP)**: no hay cuentas de usuario; la propiedad se define por la
  posesión del token opaco `analysis_session` emitido en `POST /api/v1/analyses`.
- **Transporte**: el token se entrega y reutiliza como cookie `Secure`, `HttpOnly`,
  `SameSite=Lax`; solo en desarrollo local puede relajarse `Secure`.
- **Autorización**: `analysisId` nunca concede acceso por sí solo. Cada GET/POST/DELETE sobre un
  análisis exige cookie válida y hash coincidente del token en servidor.
- **Retención `session_only`**: cookie de sesión y expiración por inactividad de 4 horas desde
  `lastAccessedAt`; purga física máxima 15 minutos después de `expiresAt`.
- **Retención `save_analysis`**: cookie persistente y análisis accesible hasta 30 días desde
  `createdAt`; purga física máxima 24 horas después de `expiresAt` o de un DELETE explícito.
- **Secretos**: claves de firma/pepper de token y credenciales de base de datos solo desde
  variables de entorno o secret manager; nunca en repositorio, fixtures ni bundle cliente.

### Data Flow

1. Usuario captura datos del análisis y elige `session_only` o `save_analysis`.
2. Frontend valida formato y obligatoriedad básica.
3. `POST /api/v1/analyses` crea el análisis, emite el token opaco `analysis_session` y persiste
   el hash del token con los metadatos de retención.
4. API ejecuta validación semántica y contradicciones antes de comparar.
5. Si hay datos críticos faltantes o inconsistentes, devuelve errores accionables.
6. Si los datos son suficientes, el motor de dominio genera:
   - escenarios calculados,
   - ranking por coste total real,
   - recomendación de cambio,
   - explicación, flags de calidad y trazas versionadas.
7. La asequibilidad se evalúa solo después de una comparación válida y siempre sobre el
   `targetScenarioType` definido por la recomendación vigente.
8. Frontend presenta resultado, advertencias y evidencia visible.
9. La API actualiza `lastAccessedAt`, aplica el TTL correspondiente y purga cuando el análisis
   expira o se elimina.

## Domain Rules & Formula Sources

### Canonical Policy Package

- **Policy version**: `mortgage-mvp/es-ES@2026.04.23-v1`
- Cada respuesta calculada expone `policyVersion` y `traceReferences[]`.

### Formula Inventory

| Code | Version | Formula | Source |
|------|---------|---------|--------|
| `FORMULA_INSTALLMENT_FRENCH` | `1.0.0` | Cuota estimada por amortización francesa con interés mensual derivado de tipo anual | `spec.md` §Functional Requirements FR-004; constitución §I |
| `FORMULA_TOTAL_REAL_COST` | `1.0.0` | Intereses + costes iniciales + costes recurrentes + costes de cambio + otros costes declarados | `spec.md` §Functional Requirements FR-004 a FR-009; constitución §IV |
| `FORMULA_FINAL_AMOUNT_PAID` | `1.0.0` | Total desembolsado en el horizonte evaluado | `spec.md` §Functional Requirements FR-004; constitución §IV |
| `FORMULA_BREAK_EVEN` | `1.0.0` | Primer periodo en que ahorro acumulado >= costes de cambio | `spec.md` §Functional Requirements FR-008 a FR-009; constitución §IV |
| `FORMULA_DEBT_RATIO` | `1.0.0` | `(cuota del escenario recomendado + obligaciones recurrentes) / ingresos netos` | `spec.md` §Functional Requirements FR-010 a FR-011; constitución §IV |

### Rule Set

| Code | Version | Rule | Source |
|------|---------|------|--------|
| `RULE_COMPARE_SCENARIO_SET` | `1.0.0` | Siempre comparar `current` y `alternative_without_bonus`; añadir `alternative_with_bonus` solo si existe entrada explícita de bonificación | `spec.md` §Functional Requirements FR-002 a FR-005; constitución §IV |
| `RULE_RANK_BY_TOTAL_REAL_COST` | `1.0.0` | Rankear por `totalRealCost`, nunca por cuota aislada | `spec.md` §Functional Requirements FR-007; constitución §IV |
| `RULE_RECOMMEND_SWITCH` | `1.0.0` | Recomendar mantener/cambiar según ahorro neto, break-even y calidad del análisis | `spec.md` §Functional Requirements FR-008 a FR-009; constitución §V |
| `RULE_AFFORDABILITY_TARGET` | `1.0.0` | La asequibilidad usa siempre el `targetScenarioType` de la recomendación vigente | `spec.md` §Functional Requirements FR-010; constitución §V |
| `RULE_AFFORDABILITY_THRESHOLDS` | `1.0.0` | `asumible` <= 35%, `ajustada` > 35% y <= 40%, `no_asumible` > 40% | `spec.md` §Functional Requirements FR-011; constitución §V |
| `RULE_DATA_QUALITY` | `1.0.0` | `conditional_estimate` para supuestos no bloqueantes y `blocked` para datos críticos faltantes/contradictorios | `spec.md` §Functional Requirements FR-015 a FR-016; constitución §V |

## Validation Strategy

### Input Validation

- Tipos, rangos y unidades en frontend y backend.
- Valores monetarios > 0 salvo categorías permitidas a 0.
- Tipos de interés dentro de rango configurable del MVP.
- Horizonte en meses mayor que 0 y no superior al plazo restante si el usuario no justifica lo contrario.

### Consistency Validation

- Detectar contradicciones entre cuota actual, capital pendiente, plazo restante y tipo aplicable.
- Detectar costes duplicados o categorías incoherentes.
- Requerir explicación visible para hipótesis cuando falten datos no críticos.

### Test Strategy

- **Unit**: fórmulas, redondeo, clasificación, detección de contradicciones, flags de completitud.
- **Contract**: shape de requests/responses, campos explicables obligatorios, códigos de error y enums.
- **Integration**: flujo API con persistencia opcional, acceso por cookie/token, TTLs y borrado.
- **E2E**: historias P1-P3, edge cases de bonificaciones engañosas, ausencia de bonificación, falta de datos y no break-even.
- **Performance smoke**: lote fijo de 30 comparaciones con 10 solicitudes concurrentes para validar p95 < 500 ms.
- **Regression**: datasets dorados para evitar desviaciones en importes, ratios y ranking.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Error de redondeo o fórmula | Recomendación financiera errónea | Aritmética decimal, fixtures dorados y revisión específica de fórmulas |
| Ranking sesgado por cuota y no por coste total | Violación de producto y constitución | DTO de ranking basado en `totalRealCost`, tests de invariantes y contrato |
| Retención indebida de datos sensibles | Riesgo de privacidad | Retención por sesión por defecto, borrado explícito y logs redactados |
| Acceso indebido a un análisis por conocer su ID | Exposición de datos sensibles | Cookie/token opaco por análisis, hash en servidor y `analysisId` no suficiente |
| Salidas opacas | Pérdida de confianza y no conformidad | Contrato obligatorio con desglose, reglas disparadas y supuestos |
| Scope creep de integraciones o casos avanzados | Retraso del MVP | Limitar a una comparación actual vs oferta alternativa, sin integraciones bancarias |

## Delivery Phases

### Phase 0 — Research (completed in this plan)

- Confirmar stack, precisión, privacidad y estrategia de pruebas.
- Resolver necesidades de clarificación y fijar decisiones en `research.md`.

### Phase 1 — Design (completed in this plan)

- Modelar entidades y estados en `data-model.md`.
- Definir contratos externos en `contracts/openapi.yaml`.
- Documentar recorrido de implementación y validación en `quickstart.md`.

### Phase 2 — Ordered Work for `/speckit.tasks`

1. **Scaffold del monorepo**
   - `apps/api`, `apps/web`, `packages/domain`, configuración de pnpm, TypeScript y lint.
2. **Motor de dominio**
   - Tipos, fórmulas, reglas, rounding, explainability DTOs y datasets dorados.
3. **Validación**
   - Esquemas compartidos, detección de contradicciones, clasificación de errores y flags condicionados.
4. **API**
   - Endpoints, persistencia opcional, políticas de retención, middleware y tests de contrato.
5. **Frontend**
   - Formulario del análisis, comparación, recomendación y asequibilidad con explicación visible.
6. **Pruebas end-to-end y hardening**
   - E2E P1-P3, logs redactados, borrado de datos efímeros y métricas mínimas.

## Complexity Tracking

No se registran excepciones ni violaciones de la constitución en esta fase.
