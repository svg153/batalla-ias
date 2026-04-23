# Research: MVP de comparador y simulador de hipotecas

## Decision 1: Monorepo fullstack en TypeScript

- **Decision**: Adoptar un monorepo pnpm con `apps/web`, `apps/api` y `packages/domain`
  en TypeScript 5.x sobre Node.js 20 LTS y React 18.
- **Rationale**: Unifica tipos, DTOs y reglas de negocio; evita duplicar fórmulas entre
  frontend y backend y permite una única fuente de verdad para el dominio hipotecario.
- **Alternatives considered**:
  - Python + React: fuerte para cálculo, pero duplica contexto y contratos.
  - Next.js fullstack: mezcla UI y dominio demasiado pronto para un dominio regulado.

## Decision 2: Motor de dominio desacoplado con aritmética decimal

- **Decision**: Centralizar fórmulas, reglas y validaciones en `packages/domain` usando
  `Decimal.js`, cálculo interno a 4 decimales y salida monetaria HALF_UP a 2 decimales.
- **Rationale**: La constitución exige exactitud financiera verificable y pruebas de regresión;
  evitar `number` nativo reduce deriva por coma flotante.
- **Alternatives considered**:
  - `number`/float nativo: no aceptable para dinero.
  - Lógica mezclada en controladores o componentes: dificulta auditoría y regresión.

## Decision 3: API REST JSON con contratos explícitos

- **Decision**: Exponer una API REST versionada bajo `/api/v1` para crear, comparar,
  recuperar y borrar análisis hipotecarios.
- **Rationale**: Encaja con el flujo lineal del MVP, facilita contract testing y obliga a
  documentar campos explicables, flags de calidad de datos y preferencia de retención.
- **Alternatives considered**:
  - GraphQL: más flexible pero innecesariamente complejo para el MVP.
  - RPC ad hoc: reduce claridad y gobernanza contractual.

## Decision 4: Modelo de persistencia, acceso y privacidad por defecto

- **Decision**: Persistir solo análisis que el usuario pida guardar; emitir un token opaco
  `analysis_session` al crear el análisis, guardar solo su hash en servidor, aplicar 4 horas de
  inactividad máxima a `session_only` y 30 días máximos a `save_analysis`.
- **Rationale**: Minimiza exposición de datos financieros y familiares, cumple FR-017 a FR-020 y
  evita introducir autenticación de cuentas antes de tiempo sin dejar el acceso sin control.
- **Alternatives considered**:
  - Guardar todo para analítica: viola minimización.
  - No guardar nunca: limita evolución futura y debugging funcional.
  - Usar solo `analysisId` como clave de acceso: insuficiente para datos sensibles.

## Decision 5: Fórmulas y reglas de negocio del MVP

- **Decision**: Implementar como mínimo:
  - cuota por amortización francesa,
  - coste total real por escenario,
  - ahorro acumulado y punto de equilibrio,
  - ratio de endeudamiento y clasificación `asumible/ajustada/no_asumible`,
  - flags `complete`, `conditional_estimate` y `blocked`.
- **Rationale**: Cubre FR-004 a FR-015 y alinea la comparación con coste total real y
  explicabilidad, no con cuota aislada.
- **Alternatives considered**:
  - Recomendación basada solo en cuota o TAE: insuficiente para el producto.
  - Posponer asequibilidad: rompe la tercera historia de usuario del MVP.

## Decision 6: Explicabilidad como parte del contrato

- **Decision**: Cada respuesta de comparación o recomendación incluirá:
  - inputs usados,
  - valores inferidos,
  - métricas calculadas,
  - costes incluidos,
  - reglas disparadas,
  - hipótesis y limitaciones visibles,
  - referencias versionadas de fórmulas y reglas.
- **Rationale**: La constitución y la spec exigen salidas aptas para auditoría funcional.
- **Alternatives considered**:
  - Mantener detalle solo en logs internos: insuficiente para usuario y revisión de producto.
  - Devolver solo un score o mensaje final: no cumple explicabilidad.

## Decision 7: Estrategia de validación y pruebas

- **Decision**: Aplicar pirámide de pruebas con:
  - unit tests en fórmulas/reglas,
  - contract tests de OpenAPI,
  - integration tests API + persistencia,
  - E2E Playwright para P1-P3 y edge cases,
  - performance smoke para el endpoint de comparación,
  - datasets dorados para regresión.
- **Rationale**: El dominio hipotecario requiere detectar desviaciones pequeñas y preservar la
  coherencia del ranking, punto de equilibrio y clasificación de asequibilidad.
- **Alternatives considered**:
  - Solo E2E: demasiado frágil y lento.
  - Solo unit tests: no valida contratos ni flujo completo.

## Decision 8: Costes incluidos y omisiones justificadas

- **Decision**: Incluir intereses, comisiones, productos vinculados, seguros asociados,
  agencia, notaría, tasación, gestoría/cancelación/subrogación y otros costes declarados.
- **Rationale**: Asegura comparación por coste total real y evita recomendaciones sesgadas.
- **Alternatives considered**:
  - Excluir costes no recurrentes: falsea el break-even.
  - Incluir impuestos de compraventa por defecto: sale del alcance del cambio hipotecario del MVP.

## Decision 9: Estructura funcional del trabajo

- **Decision**: Ordenar la implementación en seis bloques: scaffold, motor de dominio,
  validación, API, frontend y hardening/E2E.
- **Rationale**: Permite que `/speckit.tasks` genere trabajo dependiente del dominio primero,
  reduciendo retrabajo entre capas.
- **Alternatives considered**:
  - Empezar por UI: arriesga contratos inestables.
  - Empezar por base de datos: fuerza el modelo antes de cerrar fórmulas y reglas.

## Decision 10: Flujo canónico de asequibilidad

- **Decision**: La asequibilidad del MVP se calcula solo después de una comparación válida y
  siempre sobre el escenario objetivo de la recomendación vigente; no habrá selector manual de
  escenario para esta evaluación.
- **Rationale**: Reduce ambigüedad de producto, simplifica el contrato API/UI y evita resultados
  desconectados de la recomendación principal.
- **Alternatives considered**:
  - Permitir elegir cualquier escenario: añade complejidad y rompe el flujo principal del MVP.
  - Evaluar siempre la oferta alternativa bonificada: ignora casos en los que no conviene cambiar.
