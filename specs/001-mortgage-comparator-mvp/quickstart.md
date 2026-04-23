# Quickstart: MVP de comparador y simulador de hipotecas

## Objetivo

Preparar la implementación y validación del MVP definido en `spec.md`, `plan.md`,
`research.md`, `data-model.md` y `contracts/openapi.yaml`.

## 1. Orden recomendado de implementación

1. Crear el workspace (`apps/api`, `apps/web`, `packages/domain`).
2. Implementar tipos y fórmulas base en `packages/domain`.
3. Añadir reglas de validación, flags de calidad y DTOs explicables.
4. Construir endpoints REST y persistencia opcional.
5. Construir UI de captura, comparación, recomendación y asequibilidad.
6. Cubrir historias P1-P3 con tests de unidad, contrato, integración y E2E.

## 2. Primer corte técnico

### Backend/API

- Exponer:
  - `POST /api/v1/analyses`
  - `POST /api/v1/analyses/{analysisId}/compare`
  - `POST /api/v1/analyses/{analysisId}/affordability`
  - `GET /api/v1/analyses/{analysisId}`
  - `DELETE /api/v1/analyses/{analysisId}`
- Proteger todos los endpoints salvo `POST /api/v1/analyses` con la cookie opaca `analysis_session`.
- Validar payloads con Zod y comprobar contradicciones antes de calcular.

### Dominio

- Implementar primero:
  - `calculateEstimatedInstallment`
  - `calculateTotalRealCost`
  - `rankScenariosByTotalCost`
  - `calculateBreakEven`
  - `calculateAffordability`
  - `deriveDataQualityStatus`

### Frontend

- Formulario dividido por bloques:
  - hipoteca actual,
  - oferta alternativa,
  - costes asociados,
  - perfil familiar,
  - preferencia de retención.
- Vistas:
  - tabla comparativa,
  - panel de recomendación,
  - panel de asequibilidad posterior a la recomendación,
  - lista de advertencias/hipótesis.

## 3. Validación funcional mínima

### Escenario A — comparación completa

- Introducir una hipoteca actual válida.
- Introducir una oferta alternativa con y sin bonificaciones.
- Añadir costes de cambio.
- Resultado esperado:
  - aparecen 3 escenarios;
  - se muestra cuota estimada, coste total real y coste final pagado;
  - el ranking se ordena por coste total real;
  - se muestran diferencias absoluta y porcentual frente al escenario actual;
  - cada salida incluye referencias versionadas de fórmulas y reglas.

### Escenario A2 — comparación sin bonificaciones

- Introducir una hipoteca actual válida.
- Introducir una oferta alternativa solo con variante sin bonificaciones.
- Resultado esperado:
  - aparecen exactamente 2 escenarios (`current` y `alternative_without_bonus`);
  - no aparece `alternative_with_bonus`;
  - el ranking sigue ordenado por coste total real.

### Escenario B — break-even

- Usar costes de cambio suficientemente altos para que no se alcance el equilibrio.
- Resultado esperado:
  - la recomendación explica que no compensa cambiar;
  - el sistema identifica los costes que bloquean el break-even.

### Escenario C — asequibilidad

- Añadir ingresos y obligaciones del hogar.
- Resultado esperado:
  - la evaluación usa el escenario objetivo de la recomendación, no un selector manual;
  - se muestra el ratio de endeudamiento;
  - la clasificación es `asumible`, `ajustada` o `no_asumible` según umbral;
  - la explicación indica entradas usadas y umbral aplicado.

### Escenario D — datos incompletos

- Omitir un dato no crítico o marcar un ingreso variable.
- Resultado esperado:
  - la salida queda marcada como estimación condicionada;
  - la UI y API indican qué dato falta o qué hipótesis se asumió;
  - la clasificación de asequibilidad sigue siendo una de las tres permitidas si el ratio puede calcularse.

### Escenario E — contradicción material

- Introducir cuota actual incompatible con capital pendiente/plazo/tipo.
- Resultado esperado:
  - el sistema bloquea la recomendación final;
  - devuelve un error accionable antes de comparar.

### Escenario F — rendimiento mínimo

- Ejecutar 30 comparaciones con 10 solicitudes concurrentes usando un fixture fijo del MVP.
- Resultado esperado:
  - `POST /api/v1/analyses/{analysisId}/compare` mantiene p95 < 500 ms;
  - el resultado queda registrado como evidencia de validación técnica del MVP.

## 4. Criterios de hecho para pasar a `/speckit.tasks`

- `plan.md` cerrado sin `NEEDS CLARIFICATION`.
- `research.md` documenta decisiones de stack, precisión, privacidad y pruebas.
- `data-model.md` cubre entidades, relaciones, validaciones y estados.
- `contracts/openapi.yaml` define contratos externos del MVP.
- `.github/copilot-instructions.md` referencia el plan activo.

## 5. Riesgos a vigilar durante implementación

- no mezclar `number` nativo con dinero;
- no rankear por cuota mensual;
- no guardar datos sensibles por defecto;
- no usar `analysisId` como único control de acceso;
- no omitir explicación de bonificaciones, costes o supuestos;
- no reintroducir `insufficient_data` como clasificación de asequibilidad;
- no dejar sin pruebas cambios en fórmulas o umbrales.
