# batalla-ias

Aplicación web fullstack de gestión, comparación y optimización de hipotecas.

## Workspace inicial

El repositorio ya arranca como monorepo pnpm con una base backend en `apps/api`
y tipos/validación compartidos en `packages/domain`.

### Comandos

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

### Spec Kit oficial (Copilot + Git)

El repo ya usa la integración oficial `copilot` de `github/spec-kit` y la extensión
oficial `git` (`Git Branching Workflow`). Para evitar drift con un `specify` global
antiguo, el repositorio expone un wrapper fijado a la release oficial `v0.8.0`.

```bash
corepack pnpm speckit:setup
corepack pnpm speckit -- check
corepack pnpm speckit -- integration list
corepack pnpm speckit -- extension list
corepack pnpm speckit:upgrade:copilot
```

- `speckit:setup` valida `uvx`, comprueba la integración `copilot` y deja activa la
  extensión oficial `git`.
- `pnpm speckit -- <comando>` siempre ejecuta la CLI oficial de `github/spec-kit`
  fijada por el repo, sin depender de la versión global instalada.
- Para el flujo Squad/Spec Kit, reutiliza `speckit.git.feature`,
  `speckit.git.validate` y `speckit.git.commit` en lugar de inventar lógica de ramas.

### Piloto comunitario `ci-guard` (advisory only)

Ripley tenía razón sobre el gap, pero el upstream necesita barandilla: el repo ahora incluye
un piloto **comunitario / no verificado / no bloqueante** de `ci-guard`.

```bash
corepack pnpm speckit:ci:setup
corepack pnpm speckit:ci:status
```

- La fuente reproducible vive en `.specify/community/ci-guard-pilot/` y está fijada al
  upstream `spec-kit-ci-guard` commit `856bce5924fbdbb519e5aa61f796bf8aca6f1f36`.
- Se instala por separado porque el manifiesto upstream `v1.0.0` no pasa la validación de la
  CLI oficial fijada por el repo; el piloto local corrige solo esa incompatibilidad de namespace.
- `.speckit-ci.yml` deja el modo en **guidance** (`fail_*: false`): útil para revisar drift y
  trazabilidad, no para fingir una merge gate que este repo no ha aprobado.
- Tras `speckit:ci:setup`, humanos y Squad pueden invocar `speckit.ci-guard.check`,
  `speckit.ci-guard.drift` y `speckit.ci-guard.report`; usa `speckit.ci-guard.gate`
  solo para ajustar el perfil advisory del repo, no para endurecerlo en silencio.

### Despliegue en Vercel

- `vercel.json` publica la app Vite de `apps/web` directamente desde la raíz del monorepo.
- El despliegue solo sirve el frontend estático; no intenta subir la API Express a Vercel.
- Si el mismo origen no tiene `/api/v1`, la UI lo muestra como vista previa local visible en lugar de fingir backend real.

### Backend foundation actual

- API Express bootable en `apps/api/src/server.ts`
- endpoints iniciales:
  - `POST /api/v1/analyses`
  - `GET /api/v1/analyses/:analysisId`
  - `DELETE /api/v1/analyses/:analysisId`
- `compare` y `affordability` quedan registrados pero responden `501` hasta que
  aterrice la orquestación de dominio
- retención por defecto en memoria de proceso con `expiresAt` para
  `session_only`
- si se solicita `save_analysis` sin PostgreSQL configurado, la API lo expone
  explícitamente como fallback en memoria mediante `retentionMetadata`

## Constitución de proyecto

La gobernanza de producto e ingeniería vive en
`.specify/memory/constitution.md`.

Principios operativos clave:

- exactitud financiera verificable;
- explicabilidad de cálculos y decisiones;
- seguridad y privacidad de datos financieros y familiares;
- comparación basada en coste total real;
- validación rigurosa de reglas de negocio.
