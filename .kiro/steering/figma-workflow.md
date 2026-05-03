---
inclusion: manual
---

# Figma to Code Workflow for AI.BH

This guide explains how to use the Figma power to convert your AI.BH designs into React code.

## Quick Start

### Step 1: Create Your Figma Design

Use the Figma AI prompt provided to generate your designs with:
- Purple (#7B61FF) + Baby Blue (#A7C7E7) + Beige (#F5F0E6) theme
- 1440px desktop, 768px tablet, 375px mobile frames
- Auto Layout and 8px grid system
- Proper component naming (btn-primary, card-dashboard, etc.)

### Step 2: Get the Figma URL

Once your design is ready, copy the Figma URL. It should look like:
```
https://figma.com/design/abc123/AI-BH?node-id=1-2
```

### Step 3: Generate Code

Share the URL with Kiro and specify what you want:

**Examples:**
- "Generate React code for this landing page: [URL]"
- "Convert this dashboard design to code: [URL]"
- "Get the chat interface component from: [URL]"

### Step 4: Review and Integrate

Kiro will:
1. Extract the design from Figma
2. Generate React + Tailwind code
3. Adapt it to your Purple/Baby Blue/Beige theme
4. Apply Framer Motion animations
5. Use Lucide React icons
6. Follow your 8px spacing system

## Figma Power Tools

### get_design_context
Generates UI code from a Figma node. This is the main tool for converting designs.

**Usage:**
```
"Generate code for: https://figma.com/design/fileKey/name?node-id=1-2"
```

### get_screenshot
Captures a visual screenshot of a Figma component.

**Usage:**
```
"Get a screenshot of: https://figma.com/design/fileKey/name?node-id=5-10"
```

### get_metadata
Gets the structure overview of a Figma page (node IDs, layer types, names).

**Usage:**
```
"Show me the structure of: https://figma.com/design/fileKey/name?node-id=0-1"
```

### generate_diagram
Creates flowcharts, sequence diagrams, or state diagrams in FigJam.

**Usage:**
```
"Create a flowchart for the user authentication flow"
"Generate a sequence diagram for the chat API interaction"
```

### Code Connect Tools

Link your React components to Figma designs:

- `get_code_connect_map`: Check existing mappings
- `add_code_connect_map`: Link a component to a Figma node
- `get_code_connect_suggestions`: Get linking strategy

## Component Naming Convention

Match these Figma layer names to React components:

| Figma Name | React Component | File Location |
|------------|----------------|---------------|
| `btn-primary` | PrimaryButton | components/Button.jsx |
| `btn-secondary` | SecondaryButton | components/Button.jsx |
| `card-dashboard` | DashboardCard | components/Card.jsx |
| `form-login` | LoginForm | pages/LoginPage.jsx |
| `sidebar-navigation` | Sidebar | components/Sidebar.jsx |
| `navbar-dashboard` | Navbar | components/Navbar.jsx |
| `msg-user`, `msg-ai` | ChatMessage | components/ChatMessage.jsx |
| `input-search` | SearchInput | components/Input.jsx |
| `table-activity` | ActivityTable | components/Table.jsx |

## Color Mapping

When Kiro generates code, these colors will be mapped:

| Figma Color | Tailwind Class | Hex |
|-------------|---------------|-----|
| Purple | `bg-[#7B61FF]` or `bg-purple-600` | #7B61FF |
| Baby Blue | `bg-[#A7C7E7]` or `bg-blue-400` | #A7C7E7 |
| Beige | `bg-[#F5F0E6]` or `bg-beige-50` | #F5F0E6 |
| Dark Gray | `text-[#2E2E2E]` | #2E2E2E |
| Gradient | `bg-gradient-to-r from-purple-600 to-blue-400` | Purple → Blue |

## Best Practices

1. **Use Auto Layout in Figma** - Converts cleanly to Flexbox/Grid
2. **Follow 8px spacing** - Ensures consistent spacing in code
3. **Name layers properly** - Makes code generation more accurate
4. **Create component variants** - Generates proper state handling
5. **Use 12-column grid** - Matches Tailwind's grid system
6. **Test responsively** - Check all three breakpoints (1440px, 768px, 375px)

## Troubleshooting

**Issue:** Generated code doesn't match colors
- **Solution:** Kiro will automatically map to Purple/Baby Blue/Beige theme

**Issue:** Layout breaks on mobile
- **Solution:** Ensure Figma design uses Auto Layout and responsive frames

**Issue:** Components not reused
- **Solution:** Use proper Figma component naming (btn-primary, card-dashboard)

**Issue:** Missing animations
- **Solution:** Kiro adds Framer Motion animations based on existing patterns

## Next Steps

1. Create your Figma designs using the provided prompt
2. Share the Figma URL with Kiro
3. Review generated code
4. Test in your React app
5. Use the Code Connect hook to link components

The Figma power is now fully configured and ready to use!
