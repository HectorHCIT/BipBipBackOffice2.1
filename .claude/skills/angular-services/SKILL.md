---
description: Mejores prácticas para crear servicios Angular. Usa esto al crear servicios, manejar llamadas HTTP, gestionar estado o implementar lógica de negocio.
---

# Angular Services Best Practices 🔧

## Service Design Principles

Design services around a **single responsibility**. Each service should have one clear purpose.

## Service Creation

### Use `providedIn: 'root'`

Always use `providedIn: 'root'` for singleton services:

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes it a singleton available app-wide
})
export class UserService {
  // Service implementation
}
```

### Benefits of `providedIn: 'root'`

- ✅ Automatic tree-shaking (unused services removed from bundle)
- ✅ No need to add to providers array
- ✅ Singleton pattern automatically
- ✅ Available throughout the application

## Dependency Injection

### Use `inject()` Function

**ALWAYS** use the `inject()` function instead of constructor injection:

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // ✅ Modern approach - use inject()
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // ❌ Avoid constructor injection
  // constructor(
  //   private http: HttpClient,
  //   private router: Router
  // ) {}
}
```

### Why `inject()` is Better

- More concise and readable
- Better for functional programming style
- Works in functional contexts
- Easier to test
- Modern Angular pattern

## Service Structure

### Example Service Structure

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';
  
  // Optional: Local service state with signals
  private usersCache = signal<User[]>([]);
  
  // Public API methods
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
  
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }
  
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## HTTP Operations

### Always Type HTTP Responses

```typescript
// ✅ Good - typed response
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl);
}

// ❌ Bad - untyped response
getUsers(): Observable<any> {
  return this.http.get(this.apiUrl);
}
```

### Handle Query Parameters

```typescript
getUsers(page: number, size: number, search?: string): Observable<UserResponse> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());
  
  if (search) {
    params.set('search', search);
  }
  
  return this.http.get<UserResponse>(this.apiUrl, { params });
}
```

## Error Handling

Always handle HTTP errors in services using RxJS operators:

```typescript
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        
        // Show user-friendly message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users. Please try again.'
        });
        
        // Re-throw or return empty array
        return throwError(() => error);
      })
    );
  }
}
```

## Service Responsibilities

### What Services Should Do

- ✅ Make HTTP requests
- ✅ Handle business logic
- ✅ Manage application state (when appropriate)
- ✅ Transform and validate data
- ✅ Communicate with backend APIs
- ✅ Provide reusable functionality

### What Services Should NOT Do

- ❌ Manipulate the DOM
- ❌ Handle presentation logic
- ❌ Manage component-specific state (use component signals instead)
- ❌ Import Angular component decorators

## Service Communication Patterns

### Service-to-Service Communication

Services can depend on other services:

```typescript
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private userService = inject(UserService); // Inject another service
  private companyContext = inject(CompanyContextService);
  
  createOrder(order: CreateOrderDto): Observable<Order> {
    const company = this.companyContext.selectedCompany();
    if (!company) {
      throw new Error('No company selected');
    }
    
    return this.http.post<Order>('/api/orders', {
      ...order,
      companyId: company.companyId
    });
  }
}
```

## Testing Services

Services using `inject()` are easier to test:

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch users', () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }];
    
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
```

## ApiResponse Wrapper Pattern 📦

**CRITICAL**: All backend responses in this project come wrapped in an `ApiResponse` structure. **ALWAYS** unwrap the response using `.pipe(map())`.

### ApiResponse Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiError;
}

interface ApiError {
  title: string;
  message: string;
}
```

### Standard Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Biometric {
  biometricId: number;
  code: string;
  description: string;
  ip: string;
  macAddress: string;
  portNumber: number;
  status: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    title: string;
    message: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}Biometric`;

  /**
   * Get all biometric devices for a specific company
   * Backend returns: { success: true, message: "...", data: Biometric[] }
   * We return: Biometric[]
   */
  getBiometricsByCompany(companyId: number): Observable<Biometric[]> {
    const url = `${this.apiUrl}/company/${companyId}`;
    return this.http.get<ApiResponse<Biometric[]>>(url).pipe(
      map(response => response.data || [])  // ✅ ALWAYS unwrap here
    );
  }

  /**
   * Get active biometric devices
   */
  getActiveBiometrics(): Observable<Biometric[]> {
    const url = `${this.apiUrl}/active`;
    return this.http.get<ApiResponse<Biometric[]>>(url).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get single biometric device by ID
   */
  getBiometricById(id: number): Observable<Biometric> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<Biometric>>(url).pipe(
      map(response => response.data)  // Single item - no fallback needed
    );
  }

  /**
   * Create new biometric device
   */
  createBiometric(data: CreateBiometricCommand): Observable<Biometric> {
    return this.http.post<ApiResponse<Biometric>>(this.apiUrl, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update existing biometric device
   */
  updateBiometric(id: number, data: UpdateBiometricCommand): Observable<Biometric> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ApiResponse<Biometric>>(url, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Toggle biometric device status
   */
  toggleBiometricStatus(id: number): Observable<Biometric> {
    const url = `${this.apiUrl}/${id}/toggle-status`;
    return this.http.patch<ApiResponse<Biometric>>(url, {}).pipe(
      map(response => response.data)
    );
  }
}
```

### Key Points

1. **Type the HTTP call with `ApiResponse<T>`**

   ```typescript
   this.http.get<ApiResponse<Biometric[]>>(url)
   ```

2. **Always use `.pipe(map())` to unwrap**

   ```typescript
   .pipe(
     map(response => response.data || [])  // Arrays
   )

   .pipe(
     map(response => response.data)  // Single items
   )
   ```

3. **Return the unwrapped type**

   ```typescript
   // Component receives the unwrapped data directly
   getBiometrics(): Observable<Biometric[]> {  // Not Observable<ApiResponse<Biometric[]>>
     return this.http.get<ApiResponse<Biometric[]>>(url).pipe(
       map(response => response.data || [])
     );
   }
   ```

### Dropdown Endpoints Pattern

Many endpoints provide simplified data for dropdowns:

```typescript
interface BiometricDropdownItem {
  value: number;
  text: string;
}

getBiometricsForDropdown(): Observable<BiometricDropdownItem[]> {
  const url = `${this.apiUrl}/dropdown`;
  return this.http.get<ApiResponse<BiometricDropdownItem[]>>(url).pipe(
    map(response => response.data || [])
  );
}
```

### Error Handling with ApiResponse

The `ApiResponse.error` field contains structured error information:

```typescript
import { catchError, throwError } from 'rxjs';

getBiometrics(): Observable<Biometric[]> {
  return this.http.get<ApiResponse<Biometric[]>>(this.apiUrl).pipe(
    map(response => {
      // Check if backend marked as unsuccessful
      if (!response.success && response.error) {
        console.error('Backend error:', response.error);
        throw new Error(response.error.message);
      }
      return response.data || [];
    }),
    catchError(error => {
      console.error('HTTP error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos'
      });
      return throwError(() => error);
    })
  );
}
```

### Common Mistake ❌

```typescript
// ❌ WRONG - Component receives wrapped response
getBiometrics(): Observable<ApiResponse<Biometric[]>> {
  return this.http.get<ApiResponse<Biometric[]>>(url);
}

// In component - BAD
this.service.getBiometrics().subscribe(response => {
  this.biometrics.set(response.data);  // Component shouldn't unwrap
});
```

### Correct Pattern ✅

```typescript
// ✅ CORRECT - Service unwraps, component receives clean data
getBiometrics(): Observable<Biometric[]> {
  return this.http.get<ApiResponse<Biometric[]>>(url).pipe(
    map(response => response.data || [])
  );
}

// In component - GOOD
this.service.getBiometrics().subscribe(biometrics => {
  this.biometrics.set(biometrics);  // Direct usage
});
```

### Real Examples

See implementations in:

- `src/app/features/biometrics/services/biometric.service.ts`
- `src/app/features/structures/services/companies.service.ts`
- `src/app/features/income/deductions/services/deduction.service.ts`

### Benefits of This Pattern

1. **Type Safety**: Components work with clean, unwrapped types
2. **Consistent**: All services follow the same pattern
3. **Maintainable**: If API structure changes, update in services only
4. **Testable**: Easy to mock unwrapped data in tests
5. **Clean Components**: Components don't deal with API wrapper structure

## Best Practices Summary

- ✅ Use `providedIn: 'root'` for singleton services
- ✅ Use `inject()` function instead of constructor injection
- ✅ Design services with single responsibility
- ✅ Always type HTTP responses
- ✅ **ALWAYS unwrap `ApiResponse` with `.pipe(map())`**
- ✅ Handle errors gracefully with `catchError`
- ✅ Log errors appropriately
- ✅ Show user-friendly error messages
- ✅ Keep services focused and testable
- ❌ Don't manipulate DOM in services
- ❌ Don't use `any` type for API responses
- ❌ Don't mix presentation logic with business logic
- ❌ **Don't return `ApiResponse<T>` from service methods** - unwrap first
