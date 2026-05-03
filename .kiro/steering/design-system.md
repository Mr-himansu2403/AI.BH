---
inclusion: always
---

# Design System Rules for AI-BH Project

This document defines the design system structure and integration guidelines for converting Figma designs to code in the AI-BH project.

## Project Overview

- **Frontend Framework**: React 18.2 with Vite
- **Styling**: Tailwind CSS 3.3.5
- **UI Libraries**: Framer Motion, Lucide React
- **Language**: JavaScript (JSX)

## Design Tokens

### Color System

The project uses a Purple + Baby Blue + Beige color palette defined in `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: '#7B61FF',        // Purple - Primary actions
  secondary: '#A7C7E7',      // Baby Blue - Secondary elements
  background: '#F5F0E6',     // Soft Beige - Main background
  text: '#2E2E2E',          // Dark Gray - Text
  beige: { 50-900 scale },  // Background variations
  purple: { 50-900 scale }, // Primary variations
  blue: { 50-900 scale }    // Secondary variations
}
```

**Usage Guidelines**:
- Primary actions: `#7B61FF` (Purple) or `purple-600`
- Secondary actions: `#A7C7E7` (Baby Blue) or `blue-400`
- Background: `#F5F0E6` (Beige) or `beige-50`
- Text: `#2E2E2E` (Dark Gray)
- Gradients: Purple → Baby Blue for accents
- Borders: Light beige variations

### Typography

- **Font Family**: Inter or Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Base**: Applied via Tailwind's `font-sans`
- **Style**: Modern SaaS, clean and professional

### Spacing & Layout

- **8px Grid System**: All spacing must be multiples of 8 (8, 16, 24, 32, 40, 48...)
- Tailwind equivalents: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Common patterns:
  - Padding: `p-4` (16px), `p-6` (24px), `px-4 py-3` (16px/12px)
  - Margins: `mb-4` (16px), `mb-6` (24px), `mb-8` (32px)
  - Gaps: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)

### Border Radius

- Standard: `rounded-xl` (12px) or `rounded-2xl` (16px)
- Buttons: `rounded-xl` (12-16px)
- Cards: `rounded-2xl` (16px)
- Message bubbles: `rounded-2xl`
- Avatars: `rounded-full`

### Shadows

- Default: `shadow-lg` (soft shadows)
- Hover states: `hover:shadow-xl`
- Small elements: `shadow-md`
- Cards: Soft shadows with optional glassmorphism effect

## Component Patterns

### Button Components

**Primary Button** (`.btn-primary`):
```jsx
// Purple gradient button
className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
// Or solid: bg-[#7B61FF] hover:bg-[#6B51EF]
```

**Secondary Button** (`.btn-secondary`):
```jsx
// Baby Blue button
className="bg-[#A7C7E7] hover:bg-[#97B7D7] text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-md"
```

### Input Fields

**Standard Input** (`.input-field`, `.form-input-field`):
```jsx
className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
```

### Message Bubbles

**User Message** (`.user-message`, `.msg-user`):
```jsx
className="bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto rounded-br-md max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm"
```

**AI Message** (`.ai-message`, `.msg-ai`):
```jsx
className="bg-white text-gray-800 mr-auto border border-gray-200 rounded-bl-md max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm"
```

## Animation System

### Framer Motion Patterns

**Standard Entry Animation**:
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

**Button Interactions**:
```jsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Staggered List Items**:
```jsx
transition={{ duration: 0.3, delay: index * 0.1 }}
```

### Tailwind Animations

Defined in `tailwind.config.js`:
- `animate-fade-in`: Fade in effect
- `animate-slide-up`: Slide up with fade
- `animate-bounce-gentle`: Gentle bounce

## Component Architecture

### File Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── ChatInput.jsx
│   ├── ChatMessage.jsx
│   ├── LoadingSpinner.jsx
│   ├── Sidebar.jsx
│   └── TypingIndicator.jsx
├── pages/              # Page-level components
├── contexts/           # React contexts
└── services/           # API and utility services
```

### Component Naming

- Use PascalCase for component files: `ChatInput.jsx`
- Use descriptive names that indicate purpose
- Keep components focused and single-responsibility

### Props Patterns

Common prop patterns in the codebase:
```jsx
// ChatMessage component
{ message, isUser, timestamp, imageUrl, index }

// ChatInput component
{ onSendMessage, disabled }
```

## Icon System

- **Library**: Lucide React
- **Import**: `import { IconName } from 'lucide-react'`
- **Common Icons**: Send, Mic, User, Bot, Volume2, Copy, Check, X, Paperclip
- **Sizing**: `w-4 h-4`, `w-5 h-5` (Tailwind classes)

## Responsive Design

### Breakpoints

Use Tailwind's default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Common Patterns

```jsx
// Responsive max-width
className="max-w-xs lg:max-w-md"

// Responsive padding
className="px-4 lg:px-6"
```

## State Management

- **Local State**: React useState for component-level state
- **Context**: AuthContext for authentication
- **Forms**: Controlled components with useState

## Styling Approach

### Utility-First with Tailwind

- Prefer Tailwind utility classes over custom CSS
- Use component classes (defined in `index.css`) for repeated patterns
- Combine with Framer Motion for animations

### Custom Component Classes

Defined in `frontend/src/index.css` under `@layer components`:
- `.btn-primary`, `.btn-secondary`
- `.input-field`
- `.message-bubble`, `.user-message`, `.ai-message`
- `.sidebar`, `.chat-container`
- `.glass-effect`, `.hover-lift`

## Figma Integration Guidelines

When converting Figma designs to code:

1. **Color Mapping**:
   - Purple (#7B61FF) → `bg-[#7B61FF]` or `purple-600`
   - Baby Blue (#A7C7E7) → `bg-[#A7C7E7]` or `blue-400`
   - Beige (#F5F0E6) → `bg-[#F5F0E6]` or `beige-50`
   - Dark Gray (#2E2E2E) → `text-[#2E2E2E]`
   - Gradients: `bg-gradient-to-r from-purple-600 to-blue-400`

2. **Component Naming Convention** (from Figma):
   - `btn-primary`, `btn-secondary` → Button components
   - `card-dashboard`, `card-api`, `card-feature` → Card components
   - `form-input-field`, `input-email`, `input-search` → Input components
   - `sidebar-navigation`, `navbar-dashboard` → Layout components
   - `msg-user`, `msg-ai` → Message components
   - `table-activity`, `chart-container` → Data components

3. **Layout Structure**:
   - Use 12-column grid layout (Tailwind: `grid grid-cols-12`)
   - 8px spacing system (multiples of 8)
   - Auto Layout → Flexbox/Grid with proper gaps
   - 1440px desktop frame → `max-w-7xl mx-auto`

4. **Reuse existing components** instead of creating new ones
5. **Apply animations**: Use Framer Motion patterns from existing components
6. **Maintain responsive design**: Desktop (1440px), Tablet (768px), Mobile (375px)
7. **Icon consistency**: Use Lucide React icons, not inline SVGs
8. **Validate visually**: Compare final output with Figma screenshot

## Backend Integration Structure

When implementing Figma designs with backend connectivity:

1. **Dynamic Content Placeholders**: Use proper data binding for API responses
2. **Component Variants**: Implement default, hover, active, disabled, loading states
3. **Form Structure**: Group label + input in containers with error message placeholders
4. **API-Ready Cards**: Use grid containers for dynamic data injection
5. **Table Components**: Reusable row components for list data
6. **Skeleton Loading**: Include loading state variants for async data
7. **Proper Naming**: Use kebab-case or snake-case matching Figma layer names

## Asset Management

- **Images**: Stored in public directory or loaded via base64
- **Icons**: Lucide React library (no custom SVG files)
- **Fonts**: Google Fonts CDN (Inter family)

## Build System

- **Bundler**: Vite 4.5
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## AI.BH Page Structure (Figma Design)

The application follows this page structure:

### 1. Landing Page (`landing-desktop`)
- Navbar with logo, navigation, Login/Signup CTAs
- Hero section with gradient background
- Features section (3 cards: AI Tools, Dashboard Analytics, Automation System)
- Footer

### 2. Authentication System (`auth-system`)
- Login form (`form-login`): email, password, remember me
- Signup form (`form-signup`): name, email, password, confirm password
- Forgot password UI
- Error message placeholders for validation

### 3. Main Dashboard (`dashboard-main`)
- Left sidebar navigation (`sidebar-navigation`)
- Top navbar with search, notifications, profile
- Stats cards row (Total Users, AI Requests, Active Projects, Revenue)
- Charts section (`chart-container`)
- Recent activity table (`table-activity`)

### 4. AI Chat Interface (`ai-chat`)
- Chat history sidebar (`chat-history-list`)
- Chat window (`chat-container`)
- Message bubbles (`msg-user`, `msg-ai`)
- Input box with send button (`input-chat`, `btn-send`)

### 5. Settings Page (`settings-user`)
- Profile form (`form-profile`)
- API key management card (`card-api-key`)
- Toggle switches for notifications and theme
- Save button

### Reusable Components
- `btn-primary`, `btn-secondary`
- `card-dashboard`, `card-feature`, `card-api-key`
- `form-input-field`, `input-email`, `input-search`, `input-chat`
- `sidebar-item`, `navbar-component`
- `modal-popup`
- `table-activity` with reusable row components
