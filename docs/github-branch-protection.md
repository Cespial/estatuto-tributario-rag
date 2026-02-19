# Branch Protection (GitHub)

## Rama objetivo

- `main`

## Reglas recomendadas

1. Require a pull request before merging.
2. Require approvals (mínimo 1).
3. Require status checks to pass before merging:
   - `Lint + Typecheck + Build`
4. Require conversation resolution before merge.
5. Restrict force pushes.
6. Restrict branch deletion.
7. Auto-delete head branches after merge.

## Gobernanza adicional

- CODEOWNERS activo para rutas críticas.
- PR template obligatorio para cambios de release.
- Issues estructurados con templates.
