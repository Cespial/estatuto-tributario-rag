# Release Runbook

## 1. Objetivo

Este runbook define el flujo estándar para publicar cambios en producción con rollback controlado.

## 2. Requisitos previos

- Rama base: `main`
- CI en verde en el PR (`lint:strict`, `typecheck`, `build:ci`)
- Preview de Vercel validado
- Variables de entorno sincronizadas por entorno (Development / Preview / Production)

## 3. Flujo de release

1. Crear rama de trabajo desde `main`.
2. Implementar cambios y abrir PR.
3. Validar checks automáticos de GitHub Actions.
4. Validar Preview URL de Vercel:
   - Home (`/`)
   - Chat (`/asistente`)
   - Calculadoras críticas (`/calculadoras/debo-declarar`, `/calculadoras/renta`, `/calculadoras/retencion`)
   - Explorador (`/explorador`)
5. Aprobar PR y merge a `main`.
6. Verificar deployment de producción en Vercel.

## 4. Smoke tests post-deploy (15 minutos)

1. Carga inicial de landing y navegación principal.
2. Envío de una pregunta al chat (`/asistente`).
3. Cálculo básico en una calculadora prioritaria.
4. Revisión de console/network para errores críticos.
5. Confirmar endpoints API esenciales (`/api/chat`, `/api/comparar/resumen`).

## 5. Rollback

1. Abrir Vercel Dashboard > proyecto > Deployments.
2. Ubicar último deployment estable anterior.
3. Ejecutar `Promote to Production` sobre ese deployment.
4. Crear incidente interno con causa raíz y plan de corrección.

## 6. Hotfix

1. Crear rama `hotfix/<descripcion>` desde `main`.
2. Aplicar fix mínimo.
3. Abrir PR y correr pipeline completo.
4. Merge inmediato tras aprobación.
5. Ejecutar smoke tests rápidos.

## 7. Checklist de cierre

- [ ] Incidente documentado (si aplica)
- [ ] Métricas de impacto registradas
- [ ] Acciones preventivas agregadas al backlog
