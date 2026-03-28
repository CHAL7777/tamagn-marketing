# Design workspace

Use this folder for **UI exploration** before wiring components into `app/` or `components/`.

- **React Bits** (via shadcn MCP + `@react-bits` in `components.json`): backgrounds, scroll effects, animations, etc.
- Drop **reference screenshots**, **copy decks**, or **layout sketches** here when iterating with the assistant.
- Prefer installing React Bits pieces into `components/` (or `components/ui/`) via MCP, then composing them in pages.

### Example prompts (with MCP enabled)

- “Show me all the available backgrounds from the React Bits registry.”
- “Add the Dither background from React Bits to `app/page.tsx`, make it purple.”
- “Add a section on the home page that fades in on scroll using FadeContent from React Bits; follow tokens in `styles/globals.css`.”

Point the assistant at **`design/`** when you want experiments isolated from production routes.
