# Remove Resume Listening Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the automatic "Resume Listening?" ("continue from") floating toast/popup when the application loads.

**Architecture:** Remove `<ResumePrompt />` component reference from `MainLayout.tsx` and delete `ResumePrompt.tsx`.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS

## Global Constraints
- Do not affect any other session features, like the "Recently Played Surahs" list on the homepage.
- Cleanly delete unused component references and files.

---

### Task 1: Remove ResumePrompt component reference and file

**Files:**
- Modify: `src/components/MainLayout.tsx:10,80`
- Delete: `src/components/ResumePrompt.tsx`

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Modify `src/components/MainLayout.tsx` to remove `ResumePrompt` import and component usage**

In `src/components/MainLayout.tsx`:
Remove line 10 (`import { ResumePrompt } from './ResumePrompt';`) and lines 79-80 (`{/* Resume Session Toast */}\n<ResumePrompt />`).

- [ ] **Step 2: Delete `src/components/ResumePrompt.tsx`**

Delete file `src/components/ResumePrompt.tsx`.

- [ ] **Step 3: Run build/typecheck to verify no broken imports or compilation errors**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/MainLayout.tsx
git rm src/components/ResumePrompt.tsx
git commit -m "refactor: remove resume listening popup"
```
