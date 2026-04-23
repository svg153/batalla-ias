<!--
Sync Impact Report
- Version change: template → 1.0.0
- Modified principles:
  - Placeholder Principle 1 → I. Exactitud financiera verificable
  - Placeholder Principle 2 → II. Explicabilidad de cálculos y decisiones
  - Placeholder Principle 3 → III. Seguridad y privacidad de datos financieros y familiares
  - Placeholder Principle 4 → IV. Decisión basada en coste total real
  - Placeholder Principle 5 → V. Validación rigurosa de reglas de negocio
- Added sections:
  - Product & Decision Scope
  - Engineering Workflow
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: README.md
- Follow-up TODOs:
  - None
-->
# batalla-ias Constitution

## Core Principles

### I. Exactitud financiera verificable
Todos los cálculos hipotecarios MUST producir resultados reproducibles, con fórmulas,
supuestos y unidades explícitas. Las cuotas, intereses, TIN/TAE derivada, coste total,
bonificaciones, gastos iniciales y costes de cambio MUST calcularse con precisión decimal
y reglas de redondeo definidas por caso de uso. Ninguna funcionalidad puede publicar un
resultado financiero si no existe una fuente de verdad documentada y una batería de pruebas
que cubra casos nominales, límites y regresiones. Rationale: una desviación pequeña en una
hipoteca genera decisiones erróneas con impacto económico material.

### II. Explicabilidad de cálculos y decisiones
Cada recomendación, comparación u optimización MUST poder explicarse paso a paso en lenguaje
comprensible para producto, ingeniería y usuario final. El sistema MUST conservar el detalle
de entradas, fórmula aplicada, reglas disparadas, costes incluidos y motivo de cualquier
conclusión como "compensa cambiar" o "no es asumible". Las interfaces y APIs MUST devolver
salidas aptas para auditoría funcional, sin cajas negras ni scores opacos sin desglose.
Rationale: la confianza del usuario depende de entender por qué el sistema llega a cada
resultado.

### III. Seguridad y privacidad de datos financieros y familiares
Los datos financieros, familiares y de endeudamiento MUST tratarse como sensibles por
defecto. El sistema MUST aplicar minimización de datos, control de acceso, transporte seguro,
protección de secretos y redacción de datos sensibles en logs, métricas y analíticas. Ningún
entorno de desarrollo, prueba o demostración puede reutilizar datos reales sin anonimización
explícita y aprobada. Rationale: el producto maneja información patrimonial y familiar cuya
exposición puede causar daño económico y reputacional.

### IV. Decisión basada en coste total real
Toda comparación hipotecaria MUST fundamentarse en el coste total real del escenario, no en
una cuota aislada ni en un único tipo de interés. El análisis MUST incluir, cuando aplique,
bonificaciones, diferenciales, seguros vinculados, comisiones, agencia, notaría, tasación,
gestoría, impuestos u otros gastos operativos, además del horizonte temporal relevante y el
punto de equilibrio del cambio. También MUST evaluar capacidad de pago con ingresos
familiares, gastos declarados y coeficiente de endeudamiento. Rationale: una decisión
aparentemente barata puede ser peor cuando se consideran todos los costes y restricciones
reales.

### V. Validación rigurosa de reglas de negocio
Cada regla de negocio MUST estar versionada, ser trazable a una fuente y validarse con tests
automatizados antes de entrar en producción. Esto incluye reglas de elegibilidad,
bonificaciones, límites de endeudamiento, disparadores de recomendación y tratamiento de
excepciones. Cualquier cambio en fórmulas, umbrales o reglas MUST incluir pruebas de contrato,
integración o regresión según impacto, además de revisión de producto o dominio cuando afecte
a decisiones financieras. Rationale: el dominio hipotecario cambia y necesita evidencia
explícita de que el software sigue aplicando la política correcta.

## Product & Decision Scope

batalla-ias es una aplicación web fullstack de gestión, comparación y optimización de
hipotecas. Toda especificación de funcionalidad MUST cubrir como mínimo: escenario actual,
escenario alternativo, comparación con y sin bonificaciones, coste total final esperado,
momento en el que compensa cambiar de hipoteca, evaluación de asequibilidad y desglose de
todos los gastos asociados. Si una historia de usuario no necesita alguno de estos elementos,
el documento correspondiente MUST justificarlo de forma explícita.

Las entradas del dominio MUST identificar origen, vigencia y supuestos. Cuando falten datos,
la aplicación MUST marcar la salida como estimación condicionada y mostrar qué dato falta o
qué hipótesis se asumió. Los cálculos monetarios y porcentuales MUST distinguir entre dato
introducido por usuario, dato inferido y dato derivado por fórmula.

## Engineering Workflow

Toda feature MUST pasar por especificación, plan, tareas y validación de cumplimiento con esta
constitución antes de considerarse lista. El plan MUST documentar fuentes de verdad para
fórmulas y reglas, riesgos de privacidad, estrategia de pruebas y cómo se explicará el
resultado al usuario. Las tareas MUST incluir trabajo explícito para pruebas de exactitud
financiera, validación de reglas de negocio y controles de seguridad/privacidad cuando la
feature toque cálculos, recomendaciones o datos sensibles.

Los cambios se aceptan solo si demuestran resultados verificables. Como mínimo, cada entrega
relevante MUST incluir pruebas automatizadas para cálculos y reglas afectadas, revisión de
errores de redondeo, validación de escenarios límite y evidencia de que los costes totales y
la asequibilidad se calculan con datos completos. Los defectos detectados en producción MUST
generar una regresión automatizada antes de corregirse.

## Governance

Esta constitución prevalece sobre hábitos locales, plantillas previas y decisiones ad hoc.
Toda pull request, plan o revisión funcional MUST verificar cumplimiento explícito de los
cinco principios y dejar constancia de cualquier excepción aprobada.

Las enmiendas requieren: (1) describir el cambio propuesto y la razón de negocio o ingeniería,
(2) actualizar esta constitución y cualquier plantilla o guía afectada en el mismo cambio,
(3) registrar el impacto en versionado mediante el Sync Impact Report, y (4) obtener
aprobación del responsable del repositorio o persona delegada por Sergio Valverde.

La política de versionado de la constitución sigue Semantic Versioning: MAJOR para cambios
incompatibles en gobernanza o eliminación/redefinición de principios; MINOR para nuevos
principios, nuevas secciones normativas o ampliaciones materiales; PATCH para aclaraciones,
redacción y mejoras no semánticas. Las revisiones de cumplimiento MUST ejecutarse al crear o
actualizar spec.md, plan.md y tasks.md, y antes de liberar cambios que afecten cálculos,
recomendaciones o tratamiento de datos sensibles.

**Version**: 1.0.0 | **Ratified**: 2026-04-23 | **Last Amended**: 2026-04-23
