# Data Model: MVP de comparador y simulador de hipotecas

## 1. AnálisisHipotecario

Entidad raíz que agrupa entradas, horizonte, resultados y metadatos de retención.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador opaco del análisis |
| `status` | enum | yes | `draft`, `validated`, `compared`, `saved`, `expired`, `deleted` |
| `retentionPreference` | enum | yes | `session_only`, `save_analysis` |
| `accessMode` | enum | yes | `analysis_session_cookie` para el MVP |
| `policyVersion` | string | yes | Versión del catálogo de fórmulas/reglas aplicado al análisis |
| `horizonMonths` | integer | yes | Horizonte usado para coste total y break-even |
| `currency` | string | yes | `EUR` en el MVP |
| `currentMortgage` | relation | yes | Referencia al escenario actual |
| `alternativeOffer` | relation | yes | Referencia a la oferta alternativa |
| `householdProfile` | relation | no | Perfil familiar para asequibilidad |
| `comparisonResult` | relation | no | Resultado agregado de comparación |
| `createdAt` | datetime | yes | Creación del análisis |
| `updatedAt` | datetime | yes | Última modificación |
| `lastAccessedAt` | datetime | yes | Último acceso que refresca el TTL de `session_only` |
| `expiresAt` | datetime | yes | Expiración calculada según `retentionPreference` |
| `purgeAfter` | datetime | yes | Fecha límite de purga física tras expirar o borrarse |
| `ownerTokenHash` | string | yes | Hash del token opaco emitido al crear el análisis; nunca se expone |

### Validation

- `horizonMonths > 0`
- `currency = EUR`
- `retentionPreference = save_analysis` solo si el flujo solicita persistencia explícita
- `accessMode = analysis_session_cookie`
- `retentionPreference = session_only` implica `expiresAt <= lastAccessedAt + 4h`
- `retentionPreference = save_analysis` implica `expiresAt <= createdAt + 30 días`
- `purgeAfter <= expiresAt + 15 min` para `session_only`
- `purgeAfter <= expiresAt + 24 h` para `save_analysis`
- No puede pasar a `compared` si faltan datos críticos de la hipoteca actual u oferta alternativa

### State Transitions

`draft -> validated -> compared -> saved`  
`draft|validated|compared -> expired`  
`draft|validated|compared|saved -> deleted`

## 2. EscenarioHipotecario

Representa una variante hipotecaria comparable dentro del análisis.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador del escenario |
| `analysisId` | UUID | yes | Análisis al que pertenece |
| `scenarioType` | enum | yes | `current`, `alternative_without_bonus`, `alternative_with_bonus` |
| `loanPurpose` | enum | yes | `current_mortgage`, `switch_offer` |
| `pendingPrincipal` | decimal(15,4) | yes | Capital pendiente |
| `remainingMonths` | integer | yes | Plazo restante |
| `nominalAnnualRate` | decimal(8,4) | yes | Tipo nominal anual |
| `currentInstallment` | decimal(15,4) | no | Cuota declarada, cuando exista |
| `estimatedInstallment` | decimal(15,4) | no | Cuota calculada |
| `finalAmountPaid` | decimal(15,4) | no | Total pagado en el horizonte |
| `totalRealCost` | decimal(15,4) | no | Coste total real del escenario |
| `linkedProductsMonthlyCost` | decimal(15,4) | no | Coste mensual de productos vinculados |
| `bonificationRateDelta` | decimal(8,4) | no | Reducción de tipo por bonificaciones |
| `dataQualityStatus` | enum | yes | `complete`, `conditional_estimate`, `blocked` |
| `assumptions` | json | no | Hipótesis visibles aplicadas |

### Validation

- `pendingPrincipal > 0`
- `remainingMonths > 0`
- `nominalAnnualRate >= 0`
- `currentInstallment`, si existe, debe ser consistente con el resto o disparar validación de contradicción
- `scenarioType = alternative_with_bonus` requiere datos de bonificación y/o costes vinculados

## 3. CosteAsociado

Coste individual que impacta el escenario o el cambio hipotecario.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador del coste |
| `analysisId` | UUID | yes | Análisis al que pertenece |
| `scenarioId` | UUID | no | Escenario afectado, cuando aplique |
| `costType` | enum | yes | `agency`, `notary`, `appraisal`, `management`, `cancellation_fee`, `opening_fee`, `insurance`, `linked_product`, `other` |
| `timing` | enum | yes | `upfront`, `monthly`, `annual`, `one_off_switch` |
| `amount` | decimal(15,4) | yes | Importe monetario |
| `includedInTotalCost` | boolean | yes | Si computa al coste total real |
| `description` | string | no | Texto visible para el usuario |
| `sourceType` | enum | yes | `user_provided`, `inferred`, `calculated` |

### Validation

- `amount >= 0`
- `description` obligatoria cuando `costType = other`
- `timing = monthly|annual` para seguros y productos vinculados recurrentes

## 4. PerfilFinancieroFamiliar

Datos necesarios para evaluar asequibilidad.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador del perfil |
| `analysisId` | UUID | yes | Análisis al que pertenece |
| `netMonthlyIncome` | decimal(15,4) | yes | Ingresos netos mensuales del hogar |
| `monthlyObligations` | decimal(15,4) | yes | Otras obligaciones recurrentes |
| `incomeStability` | enum | no | `stable`, `variable`, `unknown` |
| `dataQualityStatus` | enum | yes | `complete`, `conditional_estimate`, `blocked` |
| `notes` | string | no | Hipótesis o aclaraciones |

### Validation

- `netMonthlyIncome > 0`
- `monthlyObligations >= 0`
- Si `incomeStability = variable`, la explicación debe indicar hipótesis o advertencia

## 5. ResultadoComparacion

Resultado agregado del análisis comparativo.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador del resultado |
| `analysisId` | UUID | yes | Relación con el análisis |
| `rankedScenarioIds` | UUID[] | yes | Escenarios ordenados por coste total real |
| `absoluteDifferenceVsCurrent` | json | yes | Diferencias por escenario vs actual |
| `percentageDifferenceVsCurrent` | json | yes | Variaciones porcentuales vs actual |
| `bestScenarioId` | UUID | yes | Escenario con menor coste total real |
| `scenarioCount` | integer | yes | `2` sin bonificaciones, `3` cuando existe variante bonificada |
| `qualityStatus` | enum | yes | `complete`, `conditional_estimate`, `blocked` |
| `policyVersion` | string | yes | Versión del catálogo de fórmulas/reglas aplicada al resultado |
| `traceReferences` | relation[] | yes | Fórmulas y reglas versionadas aplicadas al resultado |
| `explanation` | text | yes | Resumen entendible del ranking |

### Validation

- Deben existir exactamente dos escenarios para comparar cuando no haya bonificaciones y exactamente tres cuando exista variante bonificada
- El ranking se basa en `totalRealCost`
- `qualityStatus = blocked` impide recomendación final de cambio

## 6. RecomendacionCambio

Conclusión sobre si compensa cambiar.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador de la recomendación |
| `analysisId` | UUID | yes | Relación con el análisis |
| `recommendedAction` | enum | yes | `keep_current`, `switch_without_bonus`, `switch_with_bonus`, `insufficient_data` |
| `targetScenarioType` | enum | no | `current`, `alternative_without_bonus`, `alternative_with_bonus` |
| `qualityStatus` | enum | yes | `complete`, `conditional_estimate`, `blocked` |
| `policyVersion` | string | yes | Versión del catálogo de fórmulas/reglas aplicada a la recomendación |
| `isSwitchWorthIt` | boolean | yes | Si compensa cambiar |
| `breakEvenMonth` | integer | no | Mes en que se recuperan costes |
| `breakEvenReached` | boolean | yes | Si se alcanza en el horizonte |
| `netSavingsAtHorizon` | decimal(15,4) | yes | Ahorro neto esperado |
| `blockingReasons` | string[] | no | Razones de bloqueo |
| `traceReferences` | relation[] | yes | Fórmulas y reglas versionadas aplicadas a la recomendación |
| `explanation` | text | yes | Motivo claro y audit-friendly |
| `triggeredRules` | string[] | yes | Reglas disparadas |

### Validation

- Si `breakEvenReached = false`, `breakEvenMonth` debe ser `null`
- `recommendedAction = insufficient_data` cuando `qualityStatus = blocked`
- `recommendedAction = keep_current` implica `targetScenarioType = current`
- `recommendedAction = switch_without_bonus` implica `targetScenarioType = alternative_without_bonus`
- `recommendedAction = switch_with_bonus` implica `targetScenarioType = alternative_with_bonus`

## 7. EvaluacionAsequibilidad

Clasificación del escenario objetivo definido por la recomendación vigente.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `id` | UUID | yes | Identificador de la evaluación |
| `analysisId` | UUID | yes | Relación con el análisis |
| `scenarioId` | UUID | yes | Escenario evaluado, derivado de `targetScenarioType` |
| `evaluatedScenarioType` | enum | yes | `current`, `alternative_without_bonus`, `alternative_with_bonus` |
| `monthlyPaymentConsidered` | decimal(15,4) | yes | Cuota usada en el ratio |
| `netMonthlyIncome` | decimal(15,4) | yes | Ingreso usado |
| `monthlyObligations` | decimal(15,4) | yes | Obligaciones usadas |
| `debtRatio` | decimal(8,4) | yes | Ratio calculado |
| `classification` | enum | no | `asumible`, `ajustada`, `no_asumible` |
| `dataQualityStatus` | enum | yes | `complete`, `conditional_estimate`, `blocked` |
| `policyVersion` | string | yes | Versión del catálogo de fórmulas/reglas aplicada a la evaluación |
| `blockingReasons` | string[] | no | Razones por las que no puede emitirse clasificación |
| `traceReferences` | relation[] | yes | Fórmulas y reglas versionadas aplicadas a la evaluación |
| `explanation` | text | yes | Motivo y advertencias |
| `triggeredRules` | string[] | yes | Umbrales aplicados |

### Validation

- `classification = asumible` si `debtRatio <= 0.35`
- `classification = ajustada` si `0.35 < debtRatio <= 0.40`
- `classification = no_asumible` si `debtRatio > 0.40`
- `dataQualityStatus = conditional_estimate` si se usan hipótesis explícitas sobre estabilidad de ingresos u obligaciones
- `dataQualityStatus = blocked` si falta una comparación válida o faltan ingresos/obligaciones críticos; en ese caso `classification = null` y `blockingReasons` es obligatorio

## 8. ReferenciaTrazable

Fuente versionada de una fórmula o regla aplicada.

### Fields

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `code` | string | yes | Identificador estable, por ejemplo `FORMULA_TOTAL_REAL_COST` |
| `kind` | enum | yes | `formula`, `rule` |
| `version` | string | yes | Versión semántica de la referencia aplicada |
| `sourceDocument` | string | yes | Documento fuente dentro del feature package o la constitución |
| `sourceSection` | string | yes | Sección o ancla concreta del documento fuente |
| `summary` | string | yes | Descripción breve de lo que valida o calcula |

## Relationships

- `AnálisisHipotecario 1 -> N EscenarioHipotecario`
- `AnálisisHipotecario 1 -> N CosteAsociado`
- `AnálisisHipotecario 1 -> 0..1 PerfilFinancieroFamiliar`
- `AnálisisHipotecario 1 -> 0..1 ResultadoComparacion`
- `AnálisisHipotecario 1 -> 0..1 RecomendacionCambio`
- `AnálisisHipotecario 1 -> 0..1 EvaluacionAsequibilidad`
- `ResultadoComparacion 1 -> N ReferenciaTrazable`
- `RecomendacionCambio 1 -> N ReferenciaTrazable`
- `EvaluacionAsequibilidad 1 -> N ReferenciaTrazable`

## Audit / Explainability Notes

- Toda entidad calculada debe conservar `sourceType`, `policyVersion` y `traceReferences`.
- Las respuestas deben distinguir claramente entre valor introducido, inferido o calculado.
- Las hipótesis y datos faltantes deben reflejarse en `dataQualityStatus`, `assumptions`,
  `blockingReasons` y `explanation`.
- `ownerTokenHash` protege el acceso al análisis y nunca se expone en API, logs o UI.
