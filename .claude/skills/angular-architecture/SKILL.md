---
name: Structuring Angular Projects
description: Folder structure and naming conventions for Angular projects. Use when creating new features, components, pages, services, or any file in the Angular project. Includes feature module structure with components/, pages/, services/, and models/ folders.
---

# Angular Project Architecture 📁

## Feature Module Structure

**ALWAYS** follow this folder structure pattern for feature modules:

```
src/app/features
├── {feature-name}/
│   ├── components/          # Reusable components specific to this feature
│   │   └── {component-name}/
│   │       ├── {component-name}.component.ts
│   │       ├── {component-name}.component.html
│   │       └── {component-name}.component.scss
│   ├── pages/               # Smart components (containers) that compose the feature
│   │   └── {page-name}/
│   │       ├── {page-name}.component.ts
│   │       ├── {page-name}.component.html
│   │       └── {page-name}.component.scss
│   ├── services/            # Business logic and API calls
│   │   └── {service-name}.service.ts
│   ├── models/              # Interfaces, types, and enums
│   │   └── {model-name}.model.ts
│   └── {feature-name}.routes.ts
```

### Folder Responsibilities

- **components/**: Presentational components, reusable UI elements specific to this feature. **Each component MUST be in its own folder** containing .ts, .html, and .scss files
- **pages/**: Container components that handle routing and orchestrate feature logic. **Each page MUST be in its own folder** containing .ts, .html, and .scss files
- **services/**: Injectable services for data fetching, state management, and business logic
- **models/**: TypeScript interfaces, types, enums, and constants

### File Naming Conventions

Follow these naming patterns strictly:

- **Components**: Inside `components/{component-name}/` folder
  - `{component-name}.component.ts`
  - `{component-name}.component.html`
  - `{component-name}.component.scss`
- **Pages**: Inside `pages/{page-name}/` folder
  - `{page-name}.component.ts` (NOT .page.ts)
  - `{page-name}.component.html`
  - `{page-name}.component.scss`
- **Services**: `{service-name}.service.ts`
- **Models**: `{model-name}.model.ts` or `{model-name}.interface.ts`

### Important Rules

- ✅ **ALWAYS** create a folder for each component/page
- ✅ **ALWAYS** include .ts, .html, and .scss files together in the same folder
- ❌ **NEVER** use `.page.ts` suffix - use `.component.ts` for both pages and components
- ✅ Pages in `pages/` folder are just components that handle routing

## Key Principles

- Keep the structure consistent across all features
- One feature should be self-contained within its folder
- Shared/common components go in `src/app/shared` or `src/app/core`
- Always use kebab-case for file and folder names
