# Veta Upgrade Commands

This app starts with the **Launch page** pack and provider preset **mock**.

Use the local helper to add the next kit deliberately:

```bash
npm veta:add auth firebase
npm veta:add payments stripe
npm veta:add blog
npm veta:add dashboard
```

Recommended flow:

1. Run the helper to see package and MCP guidance.
2. Install the listed packages.
3. Ask an agent with Veta MCP to wire the visible route and verification.
4. Run `npm typecheck` and `npm test`.
