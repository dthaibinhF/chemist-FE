# PostgreSQL MCP Server – REST API Usage Instructions

This project provides a RESTful HTTP server for managing and analyzing PostgreSQL databases using Model Context Protocol (MCP) tools.

## 1. Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** database access and credentials

## 2. Installation

Clone and install dependencies:

```bash
git clone <repository-url>
cd postgresql-mcp-server
npm install
npm run build
```

## 3. Starting the Server

You can start the server with:

```bash
node build/index.js --connection-string "postgresql://user:password@host:port/database" [--port 3000]
```

Or set the environment variable:

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:password@host:port/database"
node build/index.js
```

- `--connection-string` or `POSTGRES_CONNECTION_STRING` is **required**.
- `--port` or `PORT` is optional (default: 3000).
- `--tools-config <path>` (optional): JSON file to restrict enabled tools.

## 4. REST API Endpoints

### List Available Tools

**GET /tools**

- Returns a list of enabled tools, their descriptions, and input schemas.

Example:

```bash
curl http://localhost:3000/tools
```

### Call a Tool

**POST /call-tool**

- Call a tool by name with arguments.
- Request body (JSON):
  - `name`: string (tool name, case-sensitive)
  - `arguments`: object (tool-specific arguments)

Example:

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_analyze_database",
    "arguments": { "analysisType": "performance" }
  }'
```

Response:

```json
{
  "content": [{ "type": "text", "text": "..." }],
  "isError": false
}
```

## 5. Tool Discovery & Schemas

- Use `GET /tools` to discover available tool names and their input schemas.
- For detailed tool documentation and example payloads, see [TOOL_SCHEMAS.md](./TOOL_SCHEMAS.md).

## 6. Tool List (Quick Reference)

| Category    | Tool Name                   |
| ----------- | --------------------------- |
| Meta-Tools  | `pg_manage_schema`          |
|             | `pg_manage_users`           |
|             | `pg_manage_query`           |
|             | `pg_manage_indexes`         |
|             | `pg_manage_functions`       |
|             | `pg_manage_triggers`        |
|             | `pg_manage_constraints`     |
|             | `pg_manage_rls`             |
| Enhancement | `pg_execute_query`          |
|             | `pg_execute_mutation`       |
|             | `pg_execute_sql`            |
|             | `pg_manage_comments`        |
| Specialized | `pg_analyze_database`       |
|             | `pg_debug_database`         |
|             | `pg_export_table_data`      |
|             | `pg_import_table_data`      |
|             | `pg_copy_between_databases` |
|             | `pg_monitor_database`       |

## 7. Example Usage

### Example: Analyze Database Performance

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_analyze_database",
    "arguments": { "analysisType": "performance" }
  }'
```

### Example: SELECT Query (pg_execute_query)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_query",
    "arguments": {
      "operation": "select",
      "query": "SELECT id, name FROM users WHERE created_at > $1",
      "parameters": ["2024-01-01"],
      "limit": 10
    }
  }'
```

### Example: COUNT Query (pg_execute_query)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_query",
    "arguments": {
      "operation": "count",
      "query": "SELECT * FROM users WHERE active = true"
    }
  }'
```

### Example: EXISTS Query (pg_execute_query)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_query",
    "arguments": {
      "operation": "exists",
      "query": "SELECT 1 FROM users WHERE email = $1",
      "parameters": ["someone@example.com"]
    }
  }'
```

### Example: INSERT (pg_execute_mutation)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_mutation",
    "arguments": {
      "operation": "insert",
      "table": "users",
      "data": {"name": "John", "email": "john@example.com"}
    }
  }'
```

### Example: Arbitrary SQL (pg_execute_sql)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_sql",
    "arguments": {
      "sql": "CREATE INDEX idx_users_email ON users(email)",
      "transactional": true
    }
  }'
```

### Example: List All Tables (pg_manage_schema)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_manage_schema",
    "arguments": {
      "operation": "get_info"
    }
  }'
```

### Example: Get All Users (pg_manage_users)

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_manage_users",
    "arguments": {
      "operation": "list"
    }
  }'
```

---

## 8. Stopping the Server

- Press `Ctrl+C` in the terminal, or send a SIGTERM signal.

## 9. Development

- For development, you can use `npm run dev` (if configured) or run with ts-node.
- See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for more details.

## 10. Notes

- Tool names are **case-sensitive** and must match the names returned by `GET /tools` or listed in [TOOL_SCHEMAS.md](./TOOL_SCHEMAS.md).
- All tools accept an optional `connectionString` argument (overrides CLI/env).
- For meta-tools, always specify the `operation` parameter.
- For data tools, provide the required SQL/table/query and parameters.
- For advanced configuration, tool restriction, and more, see the main [README.md](./README.md) and [TOOL_SCHEMAS.md](./TOOL_SCHEMAS.md).
