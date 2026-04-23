# Contrato — matriz de dependencias 001 / 002 / 003

## 1. Propósito

Hacer explícito qué hereda 003 de 001, qué espera de 002 y qué puede avanzarse ya sin bloquear la implementación futura.

## 2. Dependencias permanentes de 001

| Área | Dependencia | Estado |
|---|---|---|
| Caso de uso principal | Comparar hipoteca actual vs alternativa | Permanente |
| Señal principal de decisión | Coste total real por encima de cuota aislada | Permanente |
| Límites del producto | Sin búsqueda de hipoteca nueva, sin ofertas generadas, sin asesoramiento absoluto | Permanente |
| Estados de calidad | resultado válido / estimación condicionada / bloqueo | Permanente |
| Secuencia funcional | comparación -> recomendación -> asequibilidad | Permanente |
| Privacidad/posesión | sesión opaca, retención y mensajes de ownership ya definidos | Permanente |

## 3. Bloqueos dependientes de 002

| Área | Lo que falta | Estado |
|---|---|---|
| Sistema visual | tokens, tipografía final, color, composición | Bloqueado hasta 002 |
| Componentes | hero, cards, CTA, responsive, patrones de interacción | Bloqueado hasta 002 |
| Jerarquía de layout | traducción visual final de los bloques de la homepage | Bloqueado hasta 002 |
| Copy/tono final | ajuste editorial/brand final | Bloqueado hasta 002 |
| Handoff visual | integración final con el comparador rediseñado | Bloqueado hasta 002 |

## 4. Trabajo seguro en paralelo dentro de 003

| Área | Entregable | Estado |
|---|---|---|
| IA pública | mapa de bloques, orden funcional, CTA principal/secundaria | Listo ahora |
| Funnel | etapas, señales, red flags y dashboards | Listo ahora |
| Copy funcional | claims permitidos/prohibidos, explicación de límites y preparación | Listo ahora |
| Handoff lógico | definición de rutas y transición hacia el comparador | Listo ahora |
| Gobernanza | separación de alcance entre 002 y 003 | Listo ahora |

## 5. Gate recomendado para empezar implementación

003 puede pasar de planificación a implementación cuando se cumplan estas condiciones mínimas:

1. 002 tiene aprobados artefactos suficientes de diseño/UX para homepage y componentes base.
2. 003 mantiene trazabilidad explícita con 001 en todos los claims públicos.
3. el destino del CTA principal en `apps/web` sigue siendo el comparador existente, no una experiencia paralela.
4. existe una definición cerrada de señales del funnel y política de privacidad de analítica.

## 6. Regla de gobernanza

Si una decisión cambia:

- **qué promete el producto** -> revisar contra 001
- **cómo se ve o se comporta visualmente** -> revisar contra 002
- **cómo se estructura, mide o conduce la entrada pública** -> revisar contra 003
