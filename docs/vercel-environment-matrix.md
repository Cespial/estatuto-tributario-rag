# Vercel Environment Matrix

## Proyecto

- Proyecto Vercel: `superapp-tributaria-colombia`
- Producción: rama `main`
- Preview: cada Pull Request

## Variables requeridas

| Variable | Development | Preview | Production | Descripción |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | Sí | Sí | Sí | API key para modelo Claude |
| `PINECONE_API_KEY` | Sí | Sí | Sí | API key de Pinecone |
| `PINECONE_INDEX_NAME` | Sí | Sí | Sí | Índice vectorial |
| `CHAT_MODEL` | Opcional | Opcional | Opcional | Modelo de chat (default en código) |

## Política de actualización

1. Cambiar variables primero en `Development`.
2. Validar en entorno local/preview.
3. Promover cambios a `Preview`.
4. Promover cambios a `Production`.

## Checklist de despliegue en Vercel

- [ ] Build command: `npm run build`
- [ ] Install command: `npm ci`
- [ ] Node runtime: 20+
- [ ] Preview comments habilitados en PR
- [ ] Runtime logs habilitados para APIs críticas

## Recomendaciones de seguridad

- Nunca commitear `.env.local`.
- Rotar claves en caso de exposición.
- Limitar alcance de API keys por entorno cuando el proveedor lo permita.
