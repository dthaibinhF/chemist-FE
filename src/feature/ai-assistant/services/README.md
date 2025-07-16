# PostgreSQL MCP Server

[![smithery badge](https://smithery.ai/badge/@HenkDz/postgresql-mcp-server)](https://smithery.ai/server/@HenkDz/postgresql-mcp-server)

A Model Context Protocol (MCP) server that provides comprehensive PostgreSQL database management capabilities for AI assistants and API clients.

**🚀 What's New**: Now features 18 powerful tools, including 8 meta-tools, 6 enhancement tools, and 4 specialized tools, all with unified schemas and operation-based APIs for easy AI/LLM integration.

## Quick Start

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=postgresql-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBoZW5rZXkvcG9zdGdyZXMtbWNwLXNlcnZlciIsIi0tY29ubmVjdGlvbi1zdHJpbmciLCJwb3N0Z3Jlc3FsOi8vdXNlcjpwYXNzd29yZEBob3N0OnBvcnQvZGF0YWJhc2UiXX0=)

### Option 1: npm (Recommended)

```bash
# Install globally
npm install -g @henkey/postgres-mcp-server

# Or run directly with npx (no installation)
npx @henkey/postgres-mcp-server --connection-string "postgresql://user:pass@localhost:5432/db"
```

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "postgresql-mcp": {
      "command": "npx",
      "args": [
        "@henkey/postgres-mcp-server",
        "--connection-string",
        "postgresql://user:password@host:port/database"
      ]
    }
  }
}
```

### Option 2: Install via Smithery

```bash
npx -y @smithery/cli install @HenkDz/postgresql-mcp-server --client claude
```

### Option 3: Manual Installation (Development)

```bash
git clone <repository-url>
cd postgresql-mcp-server
npm install
npm run build
```

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "postgresql-mcp": {
      "command": "node",
      "args": [
        "/path/to/postgresql-mcp-server/build/index.js",
        "--connection-string",
        "postgresql://user:password@host:port/database"
      ]
    }
  }
}
```

## Tool List (Quick Reference)

| Category    | Tool Name                   | Description (operation param required for meta-tools) |
| ----------- | --------------------------- | ----------------------------------------------------- |
| Meta-Tools  | `pg_manage_schema`          | Schema info, create/alter tables, enums               |
|             | `pg_manage_users`           | Users & permissions                                   |
|             | `pg_manage_query`           | Query analysis & performance                          |
|             | `pg_manage_indexes`         | Index management                                      |
|             | `pg_manage_functions`       | Functions (get/create/drop)                           |
|             | `pg_manage_triggers`        | Triggers (get/create/drop/enable/disable)             |
|             | `pg_manage_constraints`     | Constraints (get/create/drop FKs, PKs, etc)           |
|             | `pg_manage_rls`             | Row-Level Security (RLS)                              |
| Enhancement | `pg_execute_query`          | SELECT/COUNT/EXISTS queries                           |
|             | `pg_execute_mutation`       | INSERT/UPDATE/DELETE/UPSERT                           |
|             | `pg_execute_sql`            | Arbitrary SQL (DDL/DML/transactional)                 |
|             | `pg_manage_comments`        | Comments on objects                                   |
| Specialized | `pg_analyze_database`       | Analyze config/performance/security                   |
|             | `pg_debug_database`         | Debug connection/performance/locks/replication        |
|             | `pg_export_table_data`      | Export table data (JSON/CSV)                          |
|             | `pg_import_table_data`      | Import table data (JSON/CSV)                          |
|             | `pg_copy_between_databases` | Copy data between DBs                                 |
|             | `pg_monitor_database`       | Real-time monitoring                                  |

## Example Usage (REST API)

All tools are called via the `/call-tool` endpoint:

```bash
curl -X POST http://localhost:3000/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pg_execute_query",
    "arguments": {
      "operation": "select",
      "query": "SELECT * FROM users WHERE created_at > $1",
      "parameters": ["2024-01-01"],
      "limit": 10
    }
  }'
```

### More Examples

- **Analyze database performance**

  ```bash
  curl -X POST http://localhost:3000/call-tool \
    -H "Content-Type: application/json" \
    -d '{
      "name": "pg_analyze_database",
      "arguments": { "analysisType": "performance" }
    }'
  ```

- **Insert new data**

  ```bash
  curl -X POST http://localhost:3000/call-tool \
    -H "Content-Type: application/json" \
    -d '{
      "name": "pg_execute_mutation",
      "arguments": {
        "operation": "insert",
        "table": "users",
        "data": {"name": "John Doe", "email": "john@example.com"},
        "returning": "*"
      }
    }'
  ```

- **List all tables**

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

- **Get all users**

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

- **Arbitrary SQL (DDL/DML/transactional)**

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

- **Export table data**
  ```bash
  curl -X POST http://localhost:3000/call-tool \
    -H "Content-Type: application/json" \
    -d '{
      "name": "pg_export_table_data",
      "arguments": {
        "tableName": "users",
        "outputPath": "/tmp/users.json",
        "format": "json"
      }
    }'
  ```

## How to Discover Tools and Schemas

- Use `GET /tools` to list all enabled tools, their descriptions, and input schemas.
- See [TOOL_SCHEMAS.md](./TOOL_SCHEMAS.md) for full details and example payloads for every tool and operation.

## Features Highlights

- **Unified meta-tools**: Multiple operations per tool via the `operation` parameter
- **Flexible data tools**: SELECT, INSERT, UPDATE, DELETE, UPSERT, and arbitrary SQL
- **Comprehensive management**: Schema, users, indexes, functions, triggers, constraints, RLS, comments
- **Production ready**: Connection pooling, robust error handling, security-focused
- **Easy LLM/AI integration**: All tools and schemas are discoverable and documented

## Prerequisites

- Node.js ≥ 18.0.0
- PostgreSQL server access
- Valid connection credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Create a Pull Request

See [Development Guide](./docs/DEVELOPMENT.md) for detailed setup instructions.

## License

AGPLv3 License - see [LICENSE](./LICENSE) file for details.
