# Contrato — señales del funnel público

## 1. Propósito

Definir las señales observables que validarán si la homepage pública genera atención útil, comprensión, intención cualificada y entrada real al caso de uso principal.

## 2. Reglas de privacidad

- no registrar PII
- no registrar importes, ingresos, cuotas ni datos hipotecarios
- limitar payloads a identificadores de sesión anónimos, contexto de dispositivo/origen y acción observada

## 3. Etapas del funnel

| Etapa | Evento principal | Definición | Umbral objetivo |
|---|---|---|---|
| Atención | `landing_viewed` | La persona llega y ve la homepage pública | volumen base |
| Comprensión | `value_prop_acknowledged` | La persona llega a una señal observable de comprensión (scroll a bloque clave, interacción con explicación o CTA tras tiempo mínimo) | SC-001: ≥ 80% de comprensión en revisión cualitativa |
| Intención | `primary_cta_engaged` | La persona encuentra e interactúa con el CTA principal | SC-002: ≥ 70% |
| Entrada cualificada | `funnel_preparation_progressed` | La persona avanza en preparación o handoff entendiendo qué datos necesita | SC-003: ≥ 60% |
| Inicio del caso de uso | `analysis_flow_started` | La persona entra al flujo real del comparador / inicia el análisis | señal de validación del negocio |

## 4. Señales secundarias

| Evento | Uso |
|---|---|
| `trust_signal_viewed` | Medir qué bloques de confianza se consumen |
| `preparation_help_opened` | Saber cuánta gente necesita ayuda antes de empezar |
| `secondary_cta_engaged` | Medir interés por ejemplo/contexto sin confundirlo con CTA principal |
| `funnel_exit_with_missing_data` | Detectar abandono por falta de oferta alternativa o datos |
| `route_handoff_completed` | Confirmar transición completa al comparador |

## 5. Red flags

- alta atención con baja comprensión
- alta comprensión con baja interacción en CTA principal
- muchos abandonos por falta de oferta alternativa sin haber mostrado orientación útil
- fuerte brecha móvil vs escritorio
- eventos demasiado ricos que comprometan minimización de datos

## 6. Dashboard mínimo esperado

### A. Funnel overview

- vistas de landing
- comprensión
- clic CTA principal
- progreso cualificado
- inicio del flujo real

### B. Comprensión y confianza

- consumo de bloques explicativos
- interacción con trust signals
- uso de CTA secundaria

### C. Preparación y abandono

- abandonos por datos faltantes
- pasos del handoff con más fricción
- ratio de salida sabiendo qué preparar

## 7. Dependencias de implementación

- los nombres finales de eventos pueden adaptarse al stack analítico, pero no cambiar su significado
- el diseño visual de disparadores y bloques depende de 002
- la definición funcional y los umbrales pueden cerrarse ya en 003
