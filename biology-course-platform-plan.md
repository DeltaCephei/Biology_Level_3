# Level 3 Biology Course Platform — Project Plan

## Overview

A week-by-week Level 3 NCEA Biology course platform for use alongside in-person teaching. Built by Eliot Attridge (Pursue Learning Ltd). Designed to be visually striking, grounded in learning science, and genuinely useful for Year 13 students.

This is **not** a revision tool (that's the psychology project). This is a full course companion — structured around the school year, mapped to teaching weeks, and referencing existing Teams/Classroom assignments.

---

## Target Users

- **Primary:** Year 13 Biology students at Eliot's school
- **Secondary:** Eliot (as teacher/content author)
- **Future:** Other teachers (fork-and-adapt model, not multi-tenancy)

## Hardware Context

- Windows and Apple laptops (no phones — banned in school, no Chromebooks at this level)
- School WiFi (variable quality — site must be fast-loading with progressive enhancement for 3D)

---

## NCEA Level 3 Biology Standards

The course covers all Level 3 Biology achievement standards:

| Standard | Title | Credits | Type |
|----------|-------|---------|------|
| AS 91601 | Carry out a practical investigation in a biological context, with guidance | 4 | Internal |
| AS 91602 | Integrate biological knowledge to develop an informed response to a socio-scientific issue | 3 | Internal |
| AS 91603 | Demonstrate understanding of the responses of plants and animals to their external environment | 5 | External |
| AS 91604 | Demonstrate understanding of how an animal maintains a stable internal environment | 3 | External |
| AS 91605 | Demonstrate understanding of evolutionary processes leading to speciation | 4 | External |

---

## Design Vision

### Visual Direction

- **Dark mode as default** — deep navy/charcoal backgrounds with vibrant biological accent colours
- **Colour palette inspired by biology** — bioluminescent greens, fluorescence colours, stained-tissue purples, cellular blues
- **Bento grid layouts** — Apple/iOS-inspired mixed-size content blocks for weekly views
- **Organic shapes** — rounded, flowing containers that echo biological forms (not sharp rectangles)
- **Bold modern typography** — display font (Space Grotesk or similar) + clean reading font (Inter or similar)
- **Light mode toggle** available for accessibility

### Visual Identity

- No emoji icons — use SVG biological illustrations and motifs instead
- Subtle cell-structure patterns, DNA helix motifs as background textures
- Microscopy-inspired visual language throughout

### Interactions & Animation

- **Scroll-driven animations** — content reveals, diagrams that build as you scroll (CSS `scroll-timeline`)
- **Micro-interactions** — cards that lift and shift on hover, progress bars that animate on viewport entry, satisfying button feedback
- **View Transitions API** — smooth page navigation between weeks
- **SVG animations** — biological process diagrams that animate (mitosis stages, enzyme action, etc.)

### Three.js / WebGL (Strategic Use)

Used surgically for high-impact moments, not everywhere:

| Use 3D (React Three Fiber) | Keep 2D (SVG/CSS) |
|---|---|
| Landing page hero (rotating cell or DNA helix) | Weekly content layouts |
| Key concept explorations (cell structure, DNA replication) | Flashcards, quizzes, brain dump |
| One "wow" interactive per standard (~5 total) | Progress dashboards |
| Ecosystem web visualisation | Navigation, general UI |

3D elements load as isolated interactive islands — the rest of the site remains fast and static. Progressive loading so content is never blocked by 3D.

**3D model sourcing:** Combination of procedurally generated structures (DNA, membranes — geometric enough to build in code), free models from Sketchfab/BioDigital, and simple stylised models.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Astro | Static-first, content-focused, supports interactive islands. Fast by default. |
| **3D graphics** | React Three Fiber (Three.js) | Declarative 3D components, loaded only where needed via Astro islands |
| **Styling** | Custom CSS with design tokens (custom properties) | Full control over the visual language, no framework bloat |
| **Animations** | CSS scroll-driven animations + View Transitions API | Native browser APIs, no heavy libraries |
| **Illustrations** | SVG (hand-crafted + generated) | Scalable, animatable, lightweight |
| **Typography** | Google Fonts (Space Grotesk + Inter or similar) | Free, high-quality, modern |
| **Content format** | Markdown + JSON data files | Easy to author and update, separate from presentation |
| **Progress/state** | localStorage (MVP), Firebase Auth + Firestore (phase 2) | Start simple, add auth when teacher features are needed |
| **Audio** | ElevenLabs TTS (build-time generation) | Proven workflow from psychology project |
| **Deployment** | GitHub Pages via GitHub Actions | Same as psychology project, proven workflow |

---

## Content Architecture

### Weekly Structure

Each teaching week is a content unit stored as markdown + JSON metadata:

```
content/
  weeks/
    week-01/
      index.md          # Main content (support notes, key concepts)
      meta.json         # Week metadata (title, standard, LMS references)
      flashcards.json   # Flashcard data for this week's content
      quiz.json         # Quiz questions for this week
    week-02/
      ...
```

### Weekly Metadata Schema

```json
{
  "week": 1,
  "term": 1,
  "title": "Introduction to Animal Responses",
  "standard": "AS 91603",
  "topics": ["homeostasis overview", "stimulus-response model"],
  "teamsReference": "Week 1 Team assignment: Stimulus-response diagram — due Friday",
  "classroomReference": "Google Classroom: Pre-topic survey",
  "keyVocabulary": ["homeostasis", "stimulus", "response", "receptor", "effector"],
  "learningObjectives": [
    "Define homeostasis and explain why it matters",
    "Describe the stimulus-response pathway"
  ],
  "interactive3d": null
}
```

### Content Sourced from NotebookLM

NotebookLM is used at **build time** (not runtime) to generate and verify support notes. Content is pulled during development, reviewed by Eliot, and committed as markdown. Students never interact with NotebookLM directly.

QC rules apply (as per root CLAUDE.md):
- Source labelling for all NotebookLM-derived content
- Separate fact from inference
- Flag thin responses

---

## Core Features (MVP — Term 1 Launch)

### 1. Weekly Course View (Landing Page)

- Bento grid showing the current week's content
- Hero card: week title, topic, standard reference
- Smaller cards: flashcards count, quiz, Teams/Classroom references, progress snapshot
- Navigation to browse past and future weeks
- Future weeks visible but clearly marked as upcoming

### 2. Support Notes & Content

- Per-week topic content in clean, readable format
- Scroll-driven reveal for complex topics (diagrams build as you scroll)
- Key vocabulary highlighted and defined
- SVG diagrams for biological processes
- Audio narration option (carried over from psychology project approach)

### 3. Retrieval Practice Tools

Carried over and adapted from the psychology project:

- **Flashcards** — spaced repetition (SM-2 algorithm), per-week and cumulative modes
- **Quizzes** — multiple choice, true/false, mixed, interleaved across standards
- **Brain dump** — free-form retrieval practice with guided prompts per topic
- **Interleaving** — cross-standard quiz mode that mixes topics

### 4. Progress Tracking

- Per-standard mastery breakdown
- Weekly completion tracking
- Study streak
- Confidence self-assessment (traffic light system)
- Retrieval practice history

### 5. Indirect LMS References

- Each week displays relevant Teams assignments and Classroom tasks
- Not API-integrated — maintained as data in weekly metadata files
- Easy for Eliot to update as the year progresses

### 6. AI Study Guidance

- Static page/section with guidance on how to use AI tools effectively for biology study
- Prompt templates students can copy into their own AI tools
- Guidance grounded in learning science (when AI helps vs when it hinders)
- No direct AI API access for students

### 7. Three.js Interactive Models

- Landing page hero element (rotating cell or DNA structure)
- ~5 key concept interactives across the course (one per standard)
- Rotatable, zoomable, clickable models
- Loaded as Astro islands — don't block page rendering

---

## Phase 2 Features (Deferred)

### Teacher-Only Section
- Firebase Auth for teacher login
- Private notes, planning resources, assessment materials
- Class progress overview (requires Firebase for student data)

### UDL Enhancements
- Multiple representation modes per topic (text, audio, visual, interactive)
- Adjustable text size/contrast beyond browser defaults
- Simplified/extended content toggles
- Potential selling point for Pursue Learning productisation

### Class Comparison
- Port the Firebase class code system from psychology project
- Per-student vs class-level analytics

### Deep LMS Integration
- Microsoft Graph API for Teams (requires school IT admin consent + OAuth)
- Google Classroom API
- Only pursue if indirect references prove insufficient

---

## Learning Science Foundation

All features should be supported by evidence. Key principles driving design:

| Principle | Application | Evidence Base |
|-----------|------------|---------------|
| **Spaced repetition** | Flashcard scheduling (SM-2) | Ebbinghaus, Cepeda et al. (2006) |
| **Retrieval practice** | Quizzes, brain dump, flashcards | Roediger & Butler (2011) |
| **Interleaving** | Cross-standard quiz mode | Rohrer et al. (2015) |
| **Elaborative interrogation** | Brain dump prompts ("why does this happen?") | Dunlosky et al. (2013) |
| **Dual coding** | Text + diagrams + audio + 3D models | Mayer's multimedia principles |
| **Metacognition** | Traffic light self-assessment, calibration | Dunlosky et al. (2013) |
| **Desirable difficulty** | Spaced practice, interleaving, retrieval | Bjork & Bjork (2011) |
| **Concrete examples** | Real NZ biological contexts in content | Chi & VanLehn (2012) |

---

## Project Structure

```
biology-course/
├── CLAUDE.md                    # Project-specific Claude instructions
├── astro.config.mjs             # Astro configuration
├── package.json
├── public/
│   ├── audio/                   # Generated TTS audio files
│   ├── models/                  # 3D model files (.glb/.gltf)
│   └── images/                  # SVG illustrations, og-image
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro     # Dark theme, fonts, global styles
│   ├── pages/
│   │   ├── index.astro          # Landing/dashboard page
│   │   ├── week/
│   │   │   └── [week].astro     # Dynamic weekly content pages
│   │   ├── flashcards.astro     # Flashcard practice
│   │   ├── quiz.astro           # Quiz practice
│   │   ├── braindump.astro      # Brain dump tool
│   │   ├── progress.astro       # Progress dashboard
│   │   └── ai-guide.astro       # AI study guidance page
│   ├── components/
│   │   ├── WeekCard.astro       # Bento grid week card
│   │   ├── ProgressRing.astro   # Animated progress ring
│   │   ├── FlashcardDeck.astro  # Flashcard component
│   │   ├── QuizEngine.astro     # Quiz component
│   │   └── three/               # React Three Fiber islands
│   │       ├── CellModel.tsx    # 3D cell interactive
│   │       ├── DNAHelix.tsx     # 3D DNA helix
│   │       └── HeroScene.tsx    # Landing page 3D hero
│   ├── styles/
│   │   ├── global.css           # Design tokens, reset, base styles
│   │   ├── theme.css            # Dark/light theme variables
│   │   └── animations.css       # Scroll-driven animations
│   ├── data/
│   │   ├── standards.json       # NCEA standard definitions
│   │   └── ai-guidance.json     # AI study guidance content
│   └── content/
│       └── weeks/               # Weekly content (markdown + JSON)
│           ├── week-01/
│           ├── week-02/
│           └── ...
├── scripts/
│   └── generate_audio.py        # TTS generation (ElevenLabs)
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Pages deployment
```

---

## Build Phases

### Phase 0: Scaffold & Visual Prototype (First Sprint)
- [ ] Initialise Astro project with the folder structure above
- [ ] Set up dark theme, typography, design tokens
- [ ] Build landing page with bento grid layout
- [ ] Create one Three.js hero element (DNA helix or cell)
- [ ] Build one sample week page with scroll-driven content
- [ ] Establish the visual language before committing to full content

### Phase 1: Core Course Content (Term 1)
- [ ] Author weekly content for Term 1 (using NotebookLM for source material)
- [ ] Build weekly page template with all content components
- [ ] Implement flashcard system (port SM-2 from psychology project)
- [ ] Implement quiz system (port from psychology project)
- [ ] Implement brain dump tool
- [ ] Add progress tracking (localStorage)
- [ ] Add indirect LMS references per week
- [ ] Deploy to GitHub Pages

### Phase 2: Polish & Extend (Terms 2-4)
- [ ] Author remaining weekly content as the year progresses
- [ ] Add 3D interactives for key concepts (~5 total)
- [ ] Build AI study guidance page
- [ ] Add audio narration for key content
- [ ] Refine based on student feedback

### Phase 3: Teacher & UDL Features (Future)
- [ ] Firebase Auth for teacher section
- [ ] Private teacher resources
- [ ] UDL enhancements (multiple representation modes)
- [ ] Class comparison analytics
- [ ] Potential productisation through Pursue Learning

---

## Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Astro | Static-first, island architecture for 3D, content-focused |
| 3D library | React Three Fiber | Declarative, manageable, good ecosystem |
| Styling | Custom CSS (no framework) | Full design control for award-winning visuals |
| Content format | Markdown + JSON | Easy to author, version-controlled, separate from code |
| Auth (MVP) | None — localStorage only | Simplifies launch; add Firebase Auth in phase 3 |
| LMS integration | Indirect references in metadata | Avoids OAuth/admin complexity; revisit if insufficient |
| AI for students | Guidance page, no API | Pedagogically sound; teaches effective AI use without cost/risk |
| Distribution model | Fork-and-adapt | No multi-tenancy needed; other teachers clone and customise |
| Mobile support | Not prioritised | Phones banned; laptops only at this level |
| NotebookLM | Build-time content source | Reduces token cost; content reviewed before committing |

---

## NZ English Conventions

All content and UI text uses NZ English:
- colour, behaviour, organise, analyse, programme
- Consistent with NCEA terminology and NZ curriculum language

---

*Plan created: February 2026*
*Project: Pursue Learning Ltd — Level 3 Biology Course Platform*
