# Mentorny Backend - Memory Bank

## Project Overview

- **Project Name**: Mentorny Backend
- **Technology**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with refresh tokens
- **Language**: TypeScript

## Architecture Overview

### Core Modules

1. **AppModule** - Main application module
2. **AuthModule** - Authentication and authorization
3. **UserModule** - User management
4. **SkillModule** - Skills management

### Key Design Decisions

#### 1. Authentication Strategy

- **JWT-based authentication** with dual token system:
  - Access tokens (short-lived, 15m default)
  - Refresh tokens (long-lived, 7d default, stored as hashed values)
- **Role-based authorization** with three roles:
  - `USER` (default)
  - `ADMIN`
  - `SUPER_ADMIN`
- **Token rotation** - New refresh token generated on each refresh
- **Security measures**:
  - Refresh tokens hashed before database storage
  - Automatic cleanup of expired tokens
  - Proper token validation and expiration handling

#### 2. Database Architecture

- **PostgreSQL** with TypeORM ORM
- **Migration-based schema management**
- **Entity relationships**:
  - User ↔ Skill (Many-to-Many)
  - User has roles (simple-array)
  - User has refresh token metadata

#### 3. Response Standardization

- **JSend API Response Standard** implementation
- **Global response interceptor** for consistent API responses
- **Global exception filter** for standardized error handling
- **DTO transformation** using class-transformer
- **Custom response decorator** for specifying response DTOs

#### 4. Validation Strategy

- **Global validation pipe** with:
  - Whitelist properties (strip unknown)
  - Forbid non-whitelisted properties
  - Transform payloads to DTO instances
  - Implicit type conversion

## Module Details

### AuthModule

**Location**: `src/auth/`
**Purpose**: Authentication and authorization management

#### Key Components:

- **AuthService**: Core authentication logic
- **AuthController**: Authentication endpoints
- **Strategies**:
  - `LocalStrategy`: Email/password validation
  - `JwtStrategy`: JWT token validation
  - `RefreshJwtStrategy`: Refresh token validation
- **Guards**:
  - `LocalAuthGuard`: Login protection
  - `JwtAuthGuard`: Protected route access
  - `RefreshJwtAuthGuard`: Refresh token validation
  - `RolesGuard`: Role-based access control
- **DTOs**:
  - `LoginDto`: Login credentials
  - `RegisterDto`: Registration data
  - `RefreshTokenDto`: Refresh token request
  - `UpdateRolesDto`: Role update request

#### Key Features:

- Password hashing with bcrypt
- Token generation and validation
- Role-based access control
- Refresh token rotation
- User validation and authentication

### UserModule

**Location**: `src/user/`
**Purpose**: User management and profile operations

#### Key Components:

- **UserService**: User business logic
- **UserController**: User endpoints
- **User Entity**: Database model
- **DTOs**:
  - `CreateUserDto`: User creation
  - `UpdateUserDto`: User updates
  - `UserResponseDto`: Response formatting
  - `AddSkillsDto`: Skill management

#### Key Features:

- User CRUD operations
- Email uniqueness validation
- Password hashing
- Skills association
- Refresh token management

### SkillModule

**Location**: `src/skill/`
**Purpose**: Skills management system

#### Key Components:

- **SkillService**: Skill business logic
- **SkillController**: Skill endpoints
- **Skill Entity**: Database model
- **DTOs**:
  - `CreateSkillDto`: Skill creation
  - `UpdateSkillDto`: Skill updates

#### Key Features:

- Skill CRUD operations
- Many-to-many relationship with Users
- Automatic skill creation when adding to users

## Database Schema

### User Entity

```typescript
- id: number (PK)
- email: string (unique)
- password: string (hashed)
- name: string
- age: number
- roles: Role[] (simple-array)
- refreshTokenHash: string (nullable)
- refreshTokenExpiresAt: Date (nullable)
- skills: Skill[] (Many-to-Many)
```

### Skill Entity

```typescript
- id: number (PK)
- name: string
- createdAt: Date
- updatedAt: Date
- users: User[] (Many-to-Many)
```

### Role Enum

```typescript
- USER: 'user'
- ADMIN: 'admin'
- SUPER_ADMIN: 'super_admin'
```

## Configuration

### Environment Variables

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT signing secret
- `JWT_ACCESS_EXPIRATION`: Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRATION`: Refresh token expiration (default: 7d)
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### CORS Configuration

- Origin: `http://localhost:5173` (Frontend URL)
- Credentials: Enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Headers: Content-Type, Authorization

## Migration History

1. **InitialMigration** (1751115789366): Initial database structure
2. **AddRolesToUser** (1751698106020): Added roles to user entity
3. **SeedAdminUser** (1751708653245): Created admin user seed
4. **RefreshToken** (1751792514393): Added refresh token fields
5. **SkillsAndRelation** (1751889989068): Added skills and user-skill relationship

## Security Features

### Authentication Security

- Password hashing with bcrypt (10 rounds)
- JWT tokens with configurable expiration
- Refresh token rotation
- Token invalidation on logout
- Role-based access control

### Authorization Patterns

- **@Roles() decorator**: Specify required roles
- **RolesGuard**: Validate user roles
- **@User() decorator**: Extract user from request
- **Guards composition**: Combine JWT + Roles guards

### Request/Response Security

- Input validation with class-validator
- DTO transformation and sanitization
- Response standardization
- Error handling with proper HTTP status codes

## API Patterns

### Response Format

All responses follow the JSend specification through the ResponseInterceptor:

**Success Response:**

```typescript
{
  status: "success",
  data: {
    // Transformed to appropriate DTO
    // Excludes sensitive fields
    // Consistent field naming
  }
}
```

**Fail Response (Client errors 4xx):**

```typescript
{
  status: "fail",
  data: {
    message: "Error message",
    statusCode: 400,
    // Additional error details
  }
}
```

**Error Response (Server errors 5xx):**

```typescript
{
  status: "error",
  message: "Error message",
  code: "ERROR_CODE", // optional
  data: {} // optional
}
```

### Error Handling

- **JSendExceptionFilter**: Global exception filter for standardized error responses
- **BadRequestException**: Validation errors (JSend fail format)
- **UnauthorizedException**: Authentication failures (JSend fail format)
- **NotFoundException**: Resource not found (JSend fail format)
- **ForbiddenException**: Authorization failures (JSend fail format)
- **Internal Server Errors**: Server errors (JSend error format)

## Development Setup

### Scripts

- `npm run start:dev`: Development server with hot reload
- `npm run build`: Build for production
- `npm run migration:generate`: Generate new migration
- `npm run migration:run`: Run pending migrations
- `npm run migration:revert`: Revert last migration

### Database Commands

- TypeORM CLI integration
- Migration management
- Entity synchronization disabled (production safety)

## Future Considerations

### Scalability Patterns

- Repository pattern implementation
- Service layer separation
- DTO transformation layers
- Modular architecture ready for microservices

### Security Enhancements

- Rate limiting (not implemented)
- Request logging (not implemented)
- Input sanitization (basic validation only)
- HTTPS enforcement (not configured)

## Code Quality

### Validation Strategy

- Global validation pipe with strict rules
- DTO-based request validation
- Type safety with TypeScript
- Class-validator decorators

### Response Consistency

- Global response interceptor
- DTO transformation for responses
- Consistent error handling
- Type-safe API contracts

## JSend Implementation

### Overview

The API follows the JSend specification for consistent response formatting across all endpoints.

### Core Components

#### 1. **JSend Interfaces** (`src/common/interfaces/jsend.interface.ts`)

- `JSendSuccess<T>`: Success response structure
- `JSendFail<T>`: Fail response structure (client errors)
- `JSendError`: Error response structure (server errors)
- `JSendResponse<T>`: Union type for all response types

#### 2. **JSend Utilities** (`src/common/utils/jsend.util.ts`)

- `JSendUtil.success(data)`: Create success response
- `JSendUtil.fail(data)`: Create fail response
- `JSendUtil.error(message, code?, data?)`: Create error response

#### 3. **Response Interceptor** (`src/common/interceptors/response.interceptor.ts`)

- Automatically wraps all successful responses in JSend format
- Handles DTO transformation
- Applied globally to all controllers

#### 4. **Exception Filter** (`src/common/filters/jsend-exception.filter.ts`)

- Catches all exceptions and formats them as JSend responses
- Distinguishes between client errors (4xx = fail) and server errors (5xx = error)
- Handles validation errors from class-validator
- Applied globally to all controllers

### Response Examples

#### Success Response

```typescript
// Before JSend
return { id: 1, name: "John" };

// After JSend
{
  "status": "success",
  "data": { "id": 1, "name": "John" }
}
```

#### Validation Error (Fail)

```typescript
// Before JSend
throw new BadRequestException(['email must be valid']);

// After JSend
{
  "status": "fail",
  "data": {
    "validation": ["email must be valid"],
    "error": "Validation failed"
  }
}
```

#### Server Error

```typescript
// Before JSend
throw new InternalServerErrorException('Database connection failed');

// After JSend
{
  "status": "error",
  "message": "Database connection failed",
  "code": 500
}
```

### Benefits

1. **Consistency**: All API responses follow the same format
2. **Client-friendly**: Clear distinction between success, fail, and error states
3. **Standardized**: Based on established JSend specification
4. **Maintainable**: Centralized response handling logic
5. **Type-safe**: Full TypeScript support with proper interfaces

---

## Memory Bank Update Rule

**IMPORTANT**: Every time you make changes to this project, you MUST update this memory bank with:

1. **New modules or services added**
2. **Changes to existing architecture**
3. **New database migrations**
4. **Configuration changes**
5. **Security modifications**
6. **API endpoint changes**
7. **New design decisions**
8. **Dependency updates**
9. **Environment variable changes**
10. **Business logic modifications**

### Update Format:

```
## [Date] - [Change Type]
- **What changed**: Description
- **Why**: Reason for change
- **Impact**: What this affects
- **Location**: Files/modules modified
```

## 2025-01-29 - Response Standardization

- **What changed**: Implemented JSend API response standard across all endpoints
- **Why**: To provide consistent, standardized API responses that follow industry best practices
- **Impact**: All API responses now follow JSend format with proper success/fail/error states
- **Location**:
  - `src/common/interfaces/jsend.interface.ts` - JSend type definitions
  - `src/common/utils/jsend.util.ts` - JSend utility functions
  - `src/common/filters/jsend-exception.filter.ts` - Global exception filter
  - `src/common/interceptors/response.interceptor.ts` - Updated response interceptor
  - `src/app.module.ts` - Registered global exception filter

This memory bank should be the single source of truth for understanding the project's architecture and evolution.
