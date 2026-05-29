# Proyecto Base

Proyecto modernizado con arquitectura limpia y stack moderno.

## Stack Tecnológico

- **React 19** - Framework
- **TypeScript 5.7** - Strict mode
- **Material-UI v7** - UI Components
- **Zustand** - UI State Management
- **TanStack Query v5** - Server State Management
- **React Hook Form** - Forms
- **Zod** - Validation
- **Vite 6** - Build Tool
- **Vitest** - Unit Testing
- **Playwright** - E2E Testing
- **ESLint + Prettier** - Code Quality

## Estructura del Proyecto

```
src/
├── app/              # App setup & providers
├── features/         # Feature-based modules
├── shared/           # Shared components, hooks, utils
├── lib/              # Third-party configs
├── assets/           # Static assets
├── styles/           # Global styles
└── tests/            # Test utilities
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Build para producción
npm run preview      # Preview del build

# Testing
npm run test         # Tests en modo watch
npm run test:run     # Ejecutar tests una vez
npm run test:coverage # Tests con coverage
npm run test:e2e     # Tests E2E

# Calidad de Código
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Fix automático de ESLint
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatear código con Prettier
```

## Empezando

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. Iniciar desarrollo:
```bash
npm run dev
```

## Arquitectura

### Feature-Based Structure
Cada feature es independiente y contiene:
- `api/` - React Query hooks
- `components/` - Componentes específicos
- `pages/` - Páginas/rutas
- `validation/` - Zod schemas
- `types/` - Tipos TypeScript
- `__tests__/` - Tests

### Separación de State
- **Zustand** → UI state (sidebar, theme, etc)
- **TanStack Query** → Server state (API data, cache)

### Formularios
- **React Hook Form** → Gestión de formularios
- **Zod** → Validación type-safe

## Testing

- Coverage mínimo: 80%
- Unit tests con Vitest
- E2E tests con Playwright
- Mocking con MSW

## Contribuir

1. Seguir los patrones establecidos
2. Escribir tests (80%+ coverage)
3. TypeScript strict (sin `any`)
4. ESLint sin errores
5. Prettier formatting

## Migración

Este proyecto está en proceso de migración desde el proyecto base.
Ver `docs/MIGRATION.md` para detalles.
