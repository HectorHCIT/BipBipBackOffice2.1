---
description: Mejores prácticas de TypeScript para el proyecto. Usa esto al escribir cualquier código TypeScript, definir tipos, interfaces o trabajar con tipado.
---

# TypeScript Best Practices 🔷

## Core TypeScript Principles

Write maintainable, performant, and type-safe TypeScript code following modern best practices.

## Type Checking

### Use Strict Type Checking

Always enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

This enables:
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

## Type Inference

### Prefer Type Inference When Obvious

Let TypeScript infer types when they're clear:

```typescript
// ✅ Good - type is obvious
const count = 0; // inferred as number
const name = 'John'; // inferred as string
const items = [1, 2, 3]; // inferred as number[]

// ❌ Unnecessary - type is redundant
const count: number = 0;
const name: string = 'John';
```

### Explicit Types When Needed

Be explicit when type isn't obvious or needs documentation:

```typescript
// ✅ Good - explicit interface for clarity
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

// ✅ Good - function return type for documentation
function getUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

## Avoid `any` Type

### Never Use `any`

The `any` type defeats the purpose of TypeScript:

```typescript
// ❌ Bad - loses all type safety
function process(data: any) {
  return data.something;
}

// ✅ Good - use proper types
function process(data: UserData) {
  return data.something;
}

// ✅ Good - use `unknown` if type is truly uncertain
function process(data: unknown) {
  if (isUserData(data)) {
    return data.something;
  }
  throw new Error('Invalid data');
}
```

### Use `unknown` for Uncertain Types

When you don't know the type, use `unknown` and narrow it:

```typescript
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// Type guard to narrow unknown
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

const data = parseJSON(jsonString);
if (isUser(data)) {
  console.log(data.name); // Type-safe access
}
```

## Interfaces vs Types

### When to Use Each

Use **interfaces** for:
- Object shapes
- Extendable contracts
- Public APIs

```typescript
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}
```

Use **type aliases** for:
- Union types
- Intersection types
- Mapped types
- Tuples

```typescript
type Status = 'pending' | 'approved' | 'rejected';
type Nullable<T> = T | null;
type Point = [number, number];
```

## Generic Types

Use generics for reusable, type-safe code:

```typescript
// ✅ Good - generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// ✅ Good - generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type ProductResponse = ApiResponse<Product>;
```

## Utility Types

Leverage TypeScript's built-in utility types:

```typescript
// Partial - makes all properties optional
type PartialUser = Partial<User>;

// Required - makes all properties required
type RequiredUser = Required<PartialUser>;

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;

// Record - object with specific key/value types
type UserMap = Record<string, User>;

// Readonly - makes all properties readonly
type ImmutableUser = Readonly<User>;
```

## Function Types

### Proper Function Signatures

```typescript
// ✅ Good - clear parameter and return types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - optional parameters
function greet(name: string, title?: string): string {
  return title ? `Hello ${title} ${name}` : `Hello ${name}`;
}

// ✅ Good - default parameters
function createUser(name: string, role: string = 'user'): User {
  return { name, role };
}

// ✅ Good - rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

## Null Safety

### Handle Null and Undefined

```typescript
// ✅ Good - optional chaining
const userName = user?.profile?.name;

// ✅ Good - nullish coalescing
const displayName = userName ?? 'Anonymous';

// ✅ Good - type guards
if (user !== null && user !== undefined) {
  console.log(user.name);
}
```

## Best Practices Summary

- ✅ Enable strict mode
- ✅ Let TypeScript infer types when obvious
- ✅ Be explicit when types aren't clear
- ✅ Never use `any` - use `unknown` instead
- ✅ Use type guards to narrow types
- ✅ Leverage utility types
- ✅ Use generics for reusable code
- ✅ Handle null/undefined safely
- ❌ Don't override types with `as` unless absolutely necessary
- ❌ Don't use `any` type
- ❌ Don't ignore TypeScript errors
