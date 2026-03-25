---
name: api-documenter
description: Generate REST API documentation by tracing route handlers
---

# API Documenter

Analyze the API routes and handlers to generate endpoint documentation.

## Instructions

1. Read `src/index.ts` to identify all registered routes
2. Read each handler in `src/handlers/` to understand request parameters and response shapes
3. Read helpers in `src/helpers/` for business logic details where relevant
4. Read types in `src/types/` for data structures
5. For each endpoint, document:
   - HTTP method and path
   - URL parameters (if any)
   - Query parameters (if any)
   - Response format and shape
   - Example response values
6. Output the documentation in a clear format
