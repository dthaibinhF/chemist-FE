# AI Assistant with PostgreSQL MCP Integration

This feature provides an AI assistant (Junie) that can interact with your PostgreSQL database using the PostgreSQL MCP server and natural language processing.

## Features

- **Natural Language Database Queries**: Users can ask questions in plain English without needing to know SQL
- **Automatic SQL Generation**: Translates natural language into appropriate SQL queries
- **Conversational Responses**: Returns database results in natural language, not just raw data
- **Interactive Chat Interface**: User-friendly chat interface with streaming responses
- **Reasoning Visibility**: Shows the AI's reasoning process (optional)

## Setup

### 1. Install Dependencies

Make sure you have the required dependencies:

```bash
# Using yarn (recommended)
yarn add @google/genai react-markdown

# Or using npm
npm install @google/genai react-markdown
```

### 2. Set up Gemini API Key

Create a `.env` file in the root of your project and add your Gemini API key:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

You can obtain a Gemini API key from the [Google AI Studio](https://makersuite.google.com/).

### 3. Set up PostgreSQL MCP Server

Run the setup script to install and configure the PostgreSQL MCP server:

```bash
# Using yarn
yarn setup-mcp

# Or using npm
npm run setup-mcp
```

This will guide you through the setup process, including:

- Installing the PostgreSQL MCP server
- Configuring your database connection
- Setting up the server port

### 4. Start the MCP Server

Start the PostgreSQL MCP server:

```bash
# Using yarn
yarn mcp-server

# Or using npm
npm run mcp-server
```

Keep this running in a separate terminal while using the AI assistant.

## Usage

### Basic Usage

The AI assistant component can be used in any React component:

```tsx
import AIChat from "@/feature/ai-assistant/components/AIChat";

const MyComponent = () => {
  return (
    <div>
      <h1>AI Assistant</h1>
      <AIChat systemPrompt="You are a helpful assistant..." height="500px" />
    </div>
  );
};
```

### Customizing the System Prompt

You can customize the system prompt to control how the AI assistant behaves:

```tsx
const systemPrompt = `You are Junie, a friendly assistant for Chemist...`;

<AIChat systemPrompt={systemPrompt} />;
```

### Natural Language Database Interactions

Users can ask questions about the database in plain English. The AI assistant will:

1. Parse the natural language query
2. Identify the intent (SELECT, COUNT, etc.)
3. Extract relevant entities (tables, conditions, limits)
4. Generate appropriate SQL
5. Execute the query against the PostgreSQL database
6. Format the results in natural language

Examples of natural language queries:

- "Show me all students in grade 10"
- "How many teachers do we have?"
- "Find students named John"
- "List all payments made last month"
- "Show me the database schema"

### How Natural Language Processing Works

The system uses a custom natural language parser (`natural-language-parser.ts`) that:

1. **Intent Recognition**: Determines if the query is about schema, counting, or retrieving specific data
2. **Entity Extraction**: Identifies tables, columns, conditions, and limits mentioned in the query
3. **SQL Generation**: Creates appropriate SQL based on the parsed intent and entities
4. **Confidence Scoring**: Evaluates how confident the system is in its interpretation
5. **Natural Language Formatting**: Presents results in a conversational format

## Architecture

The AI assistant feature consists of several components:

1. **AIChat.tsx**: The main React component for the chat interface
2. **gemini-chat.service.ts**: Service for interacting with the Gemini API
3. **mcp-database.service.ts**: Service for interacting with the PostgreSQL MCP server
4. **natural-language-parser.ts**: Utility for parsing natural language into database queries
5. **setup-mcp-server.js**: Script for setting up the PostgreSQL MCP server

## Troubleshooting

### MCP Server Connection Issues

If the AI assistant can't connect to the MCP server:

1. Make sure the MCP server is running (`yarn mcp-server`)
2. Check that the server URL in `mcp-database.service.ts` matches your configuration
3. Verify your PostgreSQL connection string

### Gemini API Issues

If the AI assistant can't connect to the Gemini API:

1. Verify your API key in the `.env` file
2. Check your internet connection
3. Ensure you're not exceeding API rate limits

### Natural Language Parsing Issues

If the AI assistant isn't correctly interpreting natural language queries:

1. Check the query patterns in `natural-language-parser.ts`
2. Verify that the database schema matches what's expected in the parser
3. Try using more explicit language in your queries

## Extending

### Adding New Query Patterns

To add support for new types of natural language patterns:

1. Update the pattern recognition in `natural-language-parser.ts`
2. Add new condition patterns to `CONDITION_PATTERNS`
3. Extend the intent recognition logic in `determineQueryIntent`

### Customizing the UI

The UI components are based on the Kibo UI components in `@/components/ui/kibo-ui/ai/`. You can customize these components to match your application's design.

### Enhancing Natural Language Understanding

To improve the natural language understanding:

1. Add more synonyms for table and column names
2. Implement more sophisticated parsing logic
3. Consider integrating with external NLP services for more advanced parsing
