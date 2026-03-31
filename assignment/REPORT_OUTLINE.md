# COS30043 – Project Report Outline

> Use this as a writing guide for your Stage 2 project report.
> Write in clear, concise language. Aim for roughly 800–1,500 words total.

---

## 1. Application Overview

**What to cover:**
- The theme you chose and why (e.g. e-commerce, event management, real estate)
- The target audience or use case for the app
- A brief summary of what the application does end-to-end

**Prompt to get you started:**
> *"My application is a [theme] platform designed for [audience]. It allows users to [key actions]."*

---

## 2. Main Functionality

**What to cover:**
- List and briefly describe the core features of your app
- Distinguish between what logged-in users can do vs. guests
- Mention any search, filter, or social features (likes/votes)
- Describe the content creation/editing/deletion flow for authorised users

**Suggested structure:**
- Guest users: can browse, search, and filter content
- Registered users: can also like/vote, create, edit, and delete their own content
- Admins (if applicable): additional moderation or management capabilities

---

## 3. Technical Components and Tools

**What to cover:**
- Framework and build tool used (Vue.js 3, Vite or Vue CLI)
- How Vue Router is structured — list your routes and what each one does
- Any custom directives you created and what they do
- Key Vue.js patterns used: computed properties, methods, watchers, lifecycle hooks
- How you handle data: local JSON, external API, or backend database
- How forms are validated (rules, error messages, UX approach)
- How pagination is implemented
- How responsive design is achieved (Bootstrap breakpoints used)
- Accessibility considerations in forms and tables

**Example entries:**
```
- Vue Router: 5 routes — Home, News, About, Login, Dashboard
- Custom directive: v-highlight, used to flag search matches in the results list
- External API: OpenWeatherMap API to display event-day forecasts
- Data storage: JSON file with localStorage sync for session persistence
- Pagination: computed slice of filtered array, 6 items per page
```

---

## 4. Innovative Features and Unique Approaches

**What to cover:**
- Any feature that goes beyond the minimum requirements
- Creative or non-obvious UI/UX decisions
- Clever use of Vue.js reactivity, components, or composition
- Any integration that adds genuine real-world value

**Prompts:**
- Did you integrate a third-party API in an interesting way?
- Did you build a reusable component that could apply across multiple pages?
- Did you implement anything related to animation, transitions, or dynamic theming?
- Is there a feature you're particularly proud of?

---

## 5. Challenges and How You Addressed Them

**What to cover:**
- Two to four specific problems you encountered during development
- What caused each problem (misunderstanding, technical limitation, etc.)
- The steps you took to debug or research a solution
- What you learned from resolving it

**Suggested format per challenge:**

> **Challenge:** [Brief description of the problem]
>
> **Cause:** [Why it happened]
>
> **Solution:** [What you did to fix it]
>
> **Lesson learned:** [What you'd do differently or what skill you gained]

**Example challenges to consider writing about:**
- Managing reactive state across multiple components
- Implementing search that works across multiple JSON fields simultaneously
- Handling authentication state between page refreshes
- Getting Bootstrap's grid to behave correctly inside a Vue component
- Parsing or normalising data from an external API

---

## Formatting Tips

- **Length:** 800–1,500 words is a reasonable range; quality over quantity
- **Tone:** Professional but not overly formal — write clearly as a developer reflecting on your work
- **Screenshots:** Optional but helpful, especially for showing responsive layouts or innovative UI elements
- **Code snippets:** Only include if they directly illustrate a technical point; keep them short
- **Referencing:** If you used external libraries, APIs, or tutorials, briefly credit them

---

## Quick Self-Check Before Submitting

- [ ] Does the report describe what the app does and who it's for?
- [ ] Are all functional features mentioned (auth, search, filters, social, CRUD)?
- [ ] Are all technical components listed and briefly explained?
- [ ] Is there at least one genuinely innovative feature discussed?
- [ ] Are 2–4 real challenges described with actual solutions?
- [ ] Is the writing clear and free of filler phrases?
