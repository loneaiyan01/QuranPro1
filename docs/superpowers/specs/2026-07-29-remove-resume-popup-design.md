# Design Spec: Remove Resume Listening Popup

## Overview
Remove the automatic "Resume Listening?" ("continue from") floating toast/popup that appears upon opening the app.

## Target Changes
1. **[MainLayout.tsx](file:///c:/Users/Aiyan%20Ali/FunModels/AntiGravity/Quran%20Player/src/components/MainLayout.tsx)**:
   - Remove import of `ResumePrompt`.
   - Remove `<ResumePrompt />` component JSX rendering.

2. **[ResumePrompt.tsx](file:///c:/Users/Aiyan%20Ali/FunModels/AntiGravity/Quran%20Player/src/components/ResumePrompt.tsx)**:
   - Delete the unused `ResumePrompt.tsx` file.

## User Experience
Users can still view and resume their listening sessions via the "Recently Played Surahs" section on the Homepage, but will no longer be interrupted by an automatic popup toast when launching the application.
