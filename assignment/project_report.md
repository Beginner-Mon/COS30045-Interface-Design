# COS30043 – Project Report: ECA (Embodied Conversational Agent)

---

## 1. Application Overview

My application is an **Embodied Conversational Agent (ECA)** platform designed for therapists and patients in the physical therapy domain. It allows users to interact with an AI-powered chatbot that provides personalised exercise recommendations, generates 3D motion visualisations of those exercises, and delivers text-to-speech audio responses — all within a single, unified web interface.

The platform targets two primary audiences. **Therapists** can use it as a tool to demonstrate exercises visually to patients through interactive 3D avatars, while **patients** can independently consult the AI agent for guided rehabilitation advice. The application also features a public-facing section with technology news, providing users with the latest developments in AI, software, and related fields.

The theme was chosen because it combines several advanced technical challenges — real-time AI chat, 3D rendering, and multi-stage asynchronous processing — into a practical, real-world use case that goes well beyond a typical CRUD application.

---

## 2. Main Functionality

### Guest Users (Unauthenticated)
- **Browse the Home page**, which introduces the ECA platform with a hero section, feature highlights (Text-to-Speech, Agentic RAG, Text-to-Motion), and a call-to-action to register.
- **Browse the News page**, which displays technology and AI articles fetched from the NewsAPI. Guests can search articles by keyword, filter by category (Artificial Intelligence, Software, Hardware, Cybersecurity), and refine results by date range. Pagination is implemented server-side.
- **Visit the About page**, which provides a description of the application's purpose. It also includes an interactive section where users can enter their first and last name to receive a personalised welcome message, and select between "Mountain" or "Ocean" radio buttons to dynamically change the background image.

### Registered Users (Authenticated)
- **Access the Dashboard**, a protected route that redirects unauthenticated users to the login page. The dashboard features a split-pane layout with an AI chat interface on the left and a 3D motion viewer on the right.
- **Chat with the AI agent** by sending natural language queries. The system processes these through an Agentic RAG pipeline, returning text responses with exercise recommendations, text-to-speech audio playback, and animated 3D motion visualisations.
- **Create and manage chat sessions** through the sidebar. Users can start new conversations, load previous sessions to continue them, and delete sessions they no longer need.
- **Provide feedback on AI responses** using thumbs-up and thumbs-down voting buttons beneath each assistant message. This social feedback is persisted locally and helps indicate response quality.
- **Authenticate via email/password or Google OAuth**, with full registration including first name, last name, email, and password with client-side validation.

---

## 3. Technical Components and Tools

### Framework and Build Tool
The application is built with **Vue.js 3** using the **Composition API** (`<script setup>`) and bundled with **Vite 7**. State management is handled by **Pinia**, and routing by **Vue Router 5**.

### Vue Router Structure
The router defines **6 routes** organised into three layout groups:

| Route | Layout | Purpose |
|-------|--------|---------|
| `/` (Home) | WebLayout | Landing page with hero, features, and CTA |
| `/news` | WebLayout | News articles with search, filters, pagination |
| `/about` | WebLayout | About section with name input and image selection |
| `/auth/login` | AuthLayout | Email/password and Google sign-in |
| `/auth/signup` | AuthLayout | Registration form with validation |
| `/dashboard` | DashboardLayout | Protected AI chat + 3D visualisation |

A navigation guard (`router.beforeEach`) enforces authentication: unauthenticated users are redirected away from protected routes, and authenticated users are redirected away from login/signup.

### Custom Directive
A custom `v-autofocus` directive is registered globally in `main.js`. When an element with this directive is mounted into the DOM, it automatically receives focus — eliminating the need for the user to click on the input field. This is applied to the login email field and the dashboard chat input, improving user experience by allowing immediate typing upon page load.

```js
app.directive('autofocus', {
  mounted(el) {
    const target = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el : el.querySelector('input, textarea')
    if (target) target.focus()
  }
})
```

### Key Vue.js Patterns Used

- **Computed Properties**: `totalPages` and `visiblePages` for pagination logic in News; `isFormValid` for reactive form validation in SignUp; `hasAssistantResponse` in the chat composable; `isLoggedIn` and `userName` in the user store.
- **Methods**: `fetchNews`, `formatDate`, `truncateText` in News; `sendMessage`, `pollTask`, `setVote` in the chat composable; validation functions across Login and SignUp.
- **Watchers**: `watch(selectedImage, ...)` in the About page to reactively update the background image when the user selects a radio button; `watch(sidebarCollapsed, ...)` to update UI when the sidebar state changes.
- **Lifecycle Hooks**: `onMounted` to fetch news on page load, initialise the dashboard, and set up resize listeners; `onBeforeUnmount` to clean up event listeners and intervals.
- **Composables**: `useDashboardChat` and `useDashboardSidebar` encapsulate reusable logic for the dashboard, following the Composition API pattern.

### Data Handling
- **External API**: The [NewsAPI](https://newsapi.org) (`/v2/everything`) provides live technology and AI news articles, queried with parameters for keyword search, category filtering, date ranges, and pagination.
- **Firebase Authentication**: Google OAuth and email/password authentication with persistent session state via `onAuthStateChanged`.
- **Orchestrator API**: A custom backend at `localhost:8080` handles AI chat responses, session management (CRUD), text-to-speech, and motion generation through an asynchronous task-polling architecture.
- **localStorage**: Vote feedback (thumbs up/down) is persisted client-side, keyed by session ID.

### Form Validation
Both the **Login** and **SignUp** forms implement comprehensive client-side validation:
- Email: regex pattern matching (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Password: minimum 6-character length check
- Confirm Password: match validation against the password field
- First/Last Name: required field validation
- Real-time feedback via `@input` event handlers with Bootstrap's `.is-invalid` and `.invalid-feedback` classes
- A `computed` property `isFormValid` disables the submit button until all fields pass validation

### Pagination
Server-side pagination is implemented on the News page. The API is called with `page` and `pageSize` parameters, and the total results are used to calculate `totalPages` via a computed property. A sliding window of page numbers (`visiblePages`) ensures the pagination controls remain clean. "Showing X–Y of Z" text provides context.

### Responsive Design
The application uses **Bootstrap 5's grid system** with a mobile-first approach, targeting at least three breakpoints:
- **Mobile** (≤576px): Single-column layouts, hamburger navigation menu, simplified dashboard with chat overlay on the 3D viewer
- **Tablet** (577–768px): Adjusted padding and font sizes, stacked news cards, collapsible sidebar in dashboard
- **Desktop** (≥769px): Full multi-column layouts, expanded sidebar with session history, side-by-side chat and 3D viewer

Custom `@media` queries supplement Bootstrap breakpoints for component-specific responsiveness (e.g., pagination controls, news card layouts, login card sizing).

### Accessibility
- All form inputs have associated `<label>` elements with matching `for`/`id` attributes
- Error alerts use `role="alert"` for screen reader announcement
- Loading spinners include `role="status"` with `visually-hidden` text
- Interactive buttons include `aria-label` or `title` attributes
- The mobile sidebar menu uses clear close buttons and full-screen overlay for easy dismissal

---

## 4. Innovative Features and Unique Approaches

### 3D Motion Visualisation with Three.js
The most innovative feature is the **real-time 3D avatar rendering** using Three.js and GLB model loading. When the AI recommends exercises, the system generates motion data that is applied to a 3D avatar, allowing users to see a visual demonstration of the exercise. This transforms an abstract text recommendation into a tangible, visual experience.

### Multi-Stage Asynchronous Pipeline
The chat system uses an advanced **task-polling architecture**. When a user sends a message, the frontend:
1. Sends the query to the orchestrator API
2. Receives a task ID
3. Polls the task status endpoint at intervals
4. Progressively updates the UI as each stage completes (text → motion → TTS)

This allows the interface to remain responsive while long-running AI processes execute in the background.

### Typewriter-Style Markdown Rendering
AI responses are rendered with an **animated typewriter effect** using a custom `AnimatedMarkdown` component. Text is tokenised into words and revealed progressively at 35ms intervals, then parsed through `marked` for Markdown rendering and `DOMPurify` for sanitisation. This creates a natural, ChatGPT-like feel.

### Glassmorphism UI
The login and signup pages feature a **glassmorphism design** with `backdrop-filter: blur(10px)` and semi-transparent backgrounds, layered over a full-bleed background image. This creates a modern, premium aesthetic.

### Social Feedback System
Each AI response includes **thumbs-up and thumbs-down vote buttons** that toggle between outline and filled states. Votes are persisted in `localStorage` keyed by session ID, providing lightweight social feedback without requiring backend changes.

### Motion Animation with @vueuse/motion
The `@vueuse/motion` plugin provides declarative animation directives (`v-motion`) used for entrance animations on the home page hero section and the character-by-character welcome message animation on the About page.

---

## 5. Challenges and How You Addressed Them

### Challenge 1: Asynchronous Multi-Stage Response Handling

**Challenge:** The orchestrator API processes queries through multiple stages (RAG text generation → motion generation → TTS synthesis), each taking variable time. Displaying partial results while continuing to poll for remaining stages was complex.

**Cause:** Traditional request-response patterns don't work when a single query triggers multiple backend processes with different completion times.

**Solution:** Implemented a `pollTask` function that periodically checks the task status endpoint. At each poll tick, it extracts whatever data is available (text, motion URL, audio URL) and progressively updates the corresponding message in the reactive `messages` array. Different UI states (thinking spinner, "Generating Model" overlay) are shown based on `progress_stage`.

**Lesson learned:** Breaking asynchronous workflows into observable stages with progressive UI updates creates a much better user experience than waiting for everything to complete before showing any result.

### Challenge 2: Vue Component Lifecycle with Three.js

**Challenge:** Integrating Three.js's imperative rendering loop (requestAnimationFrame, WebGL context, scene graph) within Vue's declarative component lifecycle caused memory leaks and rendering glitches.

**Cause:** Three.js requires manual disposal of geometries, materials, and textures. Vue's reactivity system and component unmounting don't automatically clean up WebGL resources.

**Solution:** Used `onMounted` to initialise the Three.js scene and start the render loop, and `onBeforeUnmount` to properly dispose of all Three.js objects (renderer, scene, geometries, materials) and cancel animation frames. Watchers on the `motionUrl` prop trigger model reload when new motion data arrives.

**Lesson learned:** When mixing imperative libraries (Three.js) with declarative frameworks (Vue), it's essential to manage the lifecycle explicitly and ensure all resources are cleaned up to prevent memory leaks.

### Challenge 3: Firebase Authentication State Persistence

**Challenge:** After a page refresh, the user appeared logged out momentarily before Firebase's `onAuthStateChanged` fired, causing a flash of the login page and route guard conflicts.

**Cause:** Firebase's auth state listener is asynchronous — it takes a moment after page load to determine if a user is already authenticated. During this gap, the Pinia store defaults to `isAuthenticated: false`.

**Solution:** Initialised the auth listener in `main.js` immediately after creating the Pinia store, and used `onAuthStateChanged` to reactively update the store. The route guard reads from this store, so once Firebase confirms the session, the user is seamlessly restored to their intended page.

**Lesson learned:** With third-party auth providers, always account for the initial loading state. A proper solution would include a loading screen or skeleton UI until the auth state is confirmed.

### Challenge 4: Responsive Dashboard with Split-Pane Layout

**Challenge:** The dashboard needed to display both a chat interface and a 3D viewer side by side on desktop, but overlay the chat on top of the 3D viewer on mobile — without duplicating components.

**Cause:** CSS flexbox alone couldn't handle the transition from side-by-side to overlay layout while keeping both panes interactive.

**Solution:** Used CSS `position: absolute` with `inset: 0` for the motion pane on mobile, making it fill the entire viewport as a background. The chat pane sits above it with `z-index: 2` and `pointer-events: none` on the container, with `pointer-events: auto` selectively re-enabled on interactive elements (input bar, messages). This allows the 3D viewer to remain visible and interactive through the transparent chat area.

**Lesson learned:** Creative use of `pointer-events` combined with `z-index` layering can create complex overlay interfaces without duplicating DOM elements or using JavaScript-based layout switching.
