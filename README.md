# SuperApp Tributaria Colombia

La super app tributaria de Colombia. Consulta inteligente con IA de los 1,294 articulos del Estatuto Tributario, 26 calculadoras tributarias, calendario fiscal, indicadores economicos, glosario y mas.

**Live:** [superapp-tributaria-colombia.vercel.app](https://superapp-tributaria-colombia.vercel.app)

## Funcionalidades

### Chat con IA (RAG)
- Consulta inteligente de los 1,294 articulos del Estatuto Tributario colombiano
- Embeddings vectoriales con Pinecone + Claude AI
- Respuestas con referencias directas a articulos y enlaces navegables
- Panel lateral con texto completo de articulos citados

### 26 Calculadoras Tributarias
| Categoria | Calculadoras |
|-----------|-------------|
| **Impuestos Nacionales** | Renta PN, Renta PJ, GMF (4x1000), IVA, Impuesto al Consumo, Patrimonio, Timbre, Dividendos, Ganancias Ocasionales, Herencias |
| **Retenciones** | Retencion en la Fuente, Retencion Salarios Proc. 1 |
| **Regimen SIMPLE** | SIMPLE (RST) con comparativo vs ordinario |
| **Sanciones** | Extemporaneidad, Sanciones Ampliadas (no declarar, correccion, inexactitud), Intereses Moratorios DIAN |
| **Laboral y SS** | Seguridad Social (4 tipos cotizante), Liquidacion Laboral, Horas Extras |
| **Herramientas** | Conversor UVT, Comparador Contratacion, Debo Declarar, Anticipo de Renta, Beneficio Auditoria, Depreciacion Fiscal, Pension |

### Herramientas de Referencia
- **Calendario Tributario** — Vencimientos 2026 con filtros por obligacion y digito NIT
- **Tabla de Retencion** — Conceptos, bases y tarifas de retencion en la fuente
- **Indicadores Economicos** — UVT, SMLMV, inflacion, tasa de usura con graficas historicas
- **Glosario Tributario** — Terminos clave del derecho tributario colombiano

### Explorador de Articulos
- Navegacion completa de los 1,294 articulos del Estatuto Tributario
- Busqueda por numero, titulo o contenido
- Clasificacion por libros y titulos
- Dashboard analitico con estadisticas del corpus

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16.1 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Lenguaje | TypeScript (strict) |
| IA | Claude API (Anthropic) |
| Vectores | Pinecone |
| Deploy | Vercel |

## Desarrollo Local

```bash
# Clonar
git clone https://github.com/Cespial/superapp-tributaria-colombia.git
cd superapp-tributaria-colombia

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Configurar: ANTHROPIC_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME, CHAT_MODEL (opcional)

# Ejecutar
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Calidad y Validacion

```bash
# Lint (incluye reglas de React/Next)
npm run lint

# Lint estricto (falla con warnings)
npm run lint:strict

# TypeScript global
npm run typecheck

# Validacion completa de release
npm run verify
```

## CI/CD

- CI de GitHub: `.github/workflows/ci.yml` ejecuta `lint:strict`, `typecheck` y `build`.
- Deploy: Vercel conectado a rama `main` para producción.
- Runbook de release/rollback: `docs/release-runbook.md`.
- Matriz de variables por entorno: `docs/vercel-environment-matrix.md`.

## Estructura del Proyecto

```
src/
├── app/                    # Rutas (App Router)
│   ├── api/chat/           # Endpoint RAG
│   ├── articulo/[slug]/    # 1,294 paginas de articulos
│   ├── calculadoras/       # 26 calculadoras
│   ├── calendario/         # Calendario tributario
│   ├── dashboard/          # Dashboard analitico
│   ├── explorador/         # Explorador de articulos
│   ├── glosario/           # Glosario tributario
│   ├── indicadores/        # Indicadores economicos
│   └── tablas/retencion/   # Tabla de retencion
├── components/             # Componentes React
├── config/                 # Datos tributarios (UVT, tarifas, brackets)
├── lib/                    # RAG pipeline, Pinecone, utilidades
└── contexts/               # React contexts
```

## Licencia

Proyecto privado.
