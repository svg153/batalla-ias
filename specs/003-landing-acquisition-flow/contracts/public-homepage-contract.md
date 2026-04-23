# Contrato — homepage pública y arquitectura funcional

## 1. Propósito

Definir qué debe mostrar la homepage pública, en qué orden funcional y con qué límites, para que la implementación futura mantenga foco de adquisición sin romper la verdad de negocio del comparador hipotecario.

## 2. Ruta y objetivo

- **Ruta prevista**: `/`
- **Objetivo principal**: conducir a tráfico frío hacia el caso de uso “comparar mi hipoteca actual frente a una alternativa para saber si compensa cambiar”
- **Destino del CTA principal**: ruta del comparador existente en `apps/web`

## 3. Bloques obligatorios

### A. Hero / propuesta principal

**Debe mostrar**
- qué problema resuelve el producto
- que el caso de uso principal es comparar una hipoteca actual frente a una alternativa
- CTA principal visible

**No debe mostrar**
- promesas de ahorro garantizado
- mensajes genéricos de “mejor hipoteca”

### B. Señales de confianza

**Debe mostrar**
- honestidad sobre cómo se decide
- referencia a coste total real / costes de cambio / transparencia
- expectativa básica de privacidad/sesión

### C. Propuesta de valor

**Debe mostrar**
- qué obtiene la persona si entra al flujo
- comparación, recomendación y asequibilidad como resultados del producto

### D. Breadth signal del caso de uso

**Debe mostrar**
- amplitud del valor del producto sin crear herramientas paralelas
- señales de comparación, ahorro/break-even y asequibilidad

### E. Explicación del caso de uso

**Debe mostrar**
- qué se compara exactamente
- qué costes y límites importan
- por qué no basta con mirar la cuota

### F. Preparación de datos

**Debe mostrar**
- datos mínimos para empezar
- diferencia entre obligatorio, opcional y recomendado
- qué hacer si no se dispone de oferta alternativa o datos completos

### G. CTA principal + CTA secundaria

**CTA principal**
- llevar al comparador
- copy inequívoco y orientado a la acción real

**CTA secundaria**
- puede ofrecer ejemplo, preparación o más contexto
- no puede competir con el flujo principal

### H. Pie / contexto operativo

**Debe mostrar**
- límites del producto
- recordatorio de que no sustituye asesoramiento absoluto
- contexto mínimo de privacidad / sesión / consistencia con la verdad financiera

## 4. Jerarquía funcional obligatoria

```text
problema
  -> propuesta de valor
  -> confianza
  -> explicación del caso de uso
  -> preparación de datos
  -> CTA principal
```

No se debe pedir interacción profunda antes de explicar problema, valor y límites.

## 5. Claims permitidos y prohibidos

### Permitidos

- “Compara tu hipoteca actual con una alternativa”
- “Entiende si compensa cambiar”
- “Mira el coste total real y los costes de cambio”
- “Te diremos qué datos faltan si aún no puedes completar el análisis”

### Prohibidos

- “Te encontramos la mejor hipoteca”
- “Te garantizamos ahorro”
- “Aprueba o contrata aquí”
- “Calcula desde cero una hipoteca nueva” como promesa principal

## 6. Dependencias

- **Depende de 001** para semántica, claims y límites de negocio
- **Depende de 002** para ejecución visual, componentes, tokens y responsive final
- **Puede cerrarse ya** en contenido, IA, CTA, handoff y estructura del funnel
