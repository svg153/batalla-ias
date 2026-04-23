# Modelo de Datos — landing pública y flujo primario de adquisición

## 1. Alcance

Este feature no introduce nuevas entidades hipotecarias de negocio. Define las entidades funcionales necesarias para planificar la homepage pública, el funnel de adquisición, la preparación del usuario y la coordinación de dependencias entre 001, 002 y 003.

## 2. Entidades

### A. Visitante de tráfico frío

Persona que llega a la homepage sin conocimiento previo del producto.

**Campos**
- `visitorId` (anónimo / de sesión)
- `originChannel`
- `deviceType`
- `knowledgeLevel` (`none`, `partial`, `already-comparing`)
- `intentState` (`exploring`, `understanding`, `ready_to_start`, `not_ready`)

**Relaciones**
- consume una `Homepage pública`
- avanza o abandona un `Flujo primario de adquisición`
- produce una o más `Señales de validación`

### B. Homepage pública

Superficie pública principal orientada a descubrimiento, confianza y handoff.

**Campos**
- `routePath`
- `primaryPromise`
- `contentBlocks[]`
- `primaryCta`
- `secondaryCta`
- `trustSignals[]`
- `limitationsSummary`

**Reglas**
- debe explicar el caso de uso principal antes del CTA
- debe reforzar límites y requisitos de datos
- no puede prometer productos o servicios fuera del alcance de 001

### C. Bloque de contenido

Unidad funcional de la IA pública.

**Campos**
- `blockId` (`hero`, `trust`, `value`, `breadth-signal`, `explanation`, `preparation`, `cta`, `footer-context`)
- `purpose`
- `mustShow[]`
- `copyTone`
- `dependsOn002` (`true`/`false`)

**Relaciones**
- pertenece a una `Homepage pública`
- puede detonar una `Señal de validación`

### D. CTA de entrada

Llamada a la acción que conecta la homepage con el caso de uso principal.

**Campos**
- `ctaType` (`primary`, `secondary`)
- `label`
- `targetRoute`
- `intent`
- `preparationHint`

**Reglas**
- el CTA primario debe llevar al flujo principal de comparación
- el CTA secundario puede apoyar preparación o ejemplo, pero no competir con el principal

### E. Flujo primario de adquisición

Recorrido desde la homepage hasta el inicio real del comparador.

**Campos**
- `flowId`
- `stages[]`
- `handoffRoute`
- `requiredPreparation[]`
- `optionalPreparation[]`
- `exitReasons[]`

**Relaciones**
- inicia en una `Homepage pública`
- desemboca en el `Handoff al comparador`
- se mide por varias `Señales de validación`

### F. Estado de preparación

Describe si la persona ya puede iniciar el análisis o qué necesita reunir.

**Campos**
- `readinessState` (`ready`, `missing-current-data`, `missing-alternative-offer`, `missing-cost-context`, `needs-orientation`)
- `missingInputs[]`
- `whyItMatters`
- `nextAction`

**Reglas**
- no puede presentarse como bloqueo absoluto si aún hay valor en orientación/preparación
- no puede presentar un resultado final cuando faltan datos críticos

### G. Handoff al comparador

Transición entre acquisition y el flujo profundo de análisis.

**Campos**
- `sourceRoute`
- `targetRoute`
- `entryMode` (`direct-analysis`, `prepared-analysis`, `example-first`)
- `preservedContext[]`
- `implementationDependency`

**Relaciones**
- depende de `Homepage pública`
- reutiliza el comparador existente en `apps/web/src/pages/mortgage-analysis-page.tsx`

### H. Señal de validación

Evento observable que permite evaluar si la homepage genera atención útil, comprensión y progreso cualificado.

**Campos**
- `signalId`
- `stage` (`attention`, `comprehension`, `intent`, `qualified-entry`, `analysis-start`)
- `eventName`
- `successMetric`
- `threshold`
- `privacyLevel`

**Reglas**
- no debe contener PII ni importes hipotecarios
- debe corresponder a un objetivo del spec

### I. Dependencia de implementación

Describe si una parte de 003 puede planificarse ya o queda bloqueada por 002.

**Campos**
- `dependencyId`
- `sourceFeature` (`001`, `002`, `003`)
- `dependencyType` (`semantic-baseline`, `visual-blocker`, `parallel-planning`, `implementation-gate`)
- `scope`
- `status` (`ready-now`, `blocked-until-002`, `permanent-baseline`)
- `notes`

## 3. Relaciones clave

```text
Visitante de tráfico frío
  └── Homepage pública
        ├── Bloque de contenido
        ├── CTA de entrada
        └── Flujo primario de adquisición
              ├── Estado de preparación
              ├── Handoff al comparador
              └── Señal de validación

Dependencia de implementación
  ├── fija anclajes con 001
  ├── identifica bloqueos con 002
  └── aclara trabajo paralelo de 003
```

## 4. Transiciones de estado

### Estado de intención del visitante

```text
exploring
  -> understanding
  -> ready_to_start
  -> not_ready
```

### Estado de preparación

```text
needs-orientation
  -> missing-current-data
  -> missing-alternative-offer
  -> missing-cost-context
  -> ready
```

### Estado de dependencia

```text
permanent-baseline   (001)
ready-now            (003 planificación)
blocked-until-002    (ejecución visual)
```

### Etapas del funnel

```text
attention
  -> comprehension
  -> intent
  -> qualified-entry
  -> analysis-start
```

## 5. Nota de implementación

La implementación futura de 003 no necesita un nuevo modelo de datos hipotecario. Debe reutilizar los tipos y contratos existentes del comparador en `apps/web/src/features/mortgage-analysis/types.ts` y en `apps/api`, mientras usa este modelo como capa de planificación para IA, handoff, validación y dependencias.
