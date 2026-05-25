# AI Copilot Operational Directives
**Target:** AI Assistants, GitHub Copilot, Cursor, etc.
**Project:** Angular + Node.js Authentication System

You must strictly adhere to the following operational rules when assisting with this repository. These rules are non-negotiable and supersede standard AI behaviors.

## 1. PRESERVE EXISTING ARCHITECTURE
* **Rule:** Never ruin, silently alter, or deprecate the established architecture.
* **Context:** The system uses a strict decoupled architecture (Angular on Vercel, Node.js on Render, TiDB MySQL). Established patterns (e.g., dual-token auth flow, specific `localStorage` keys, HTTP interceptor logic) must be respected and maintained. Do not introduce alternative frameworks or conflicting structural paradigms.

## 2. EXPLICIT CONFIRMATION FOR CODE MODIFICATIONS
* **Rule:** If a prompt requires you to write, rewrite, or delete code, you must ALWAYS ask for explicit confirmation to ensure there is a 100% mutual understanding of the goal before acting.
* **Action:** Present the proposed code changes clearly, explain what they do, and end your response by asking for confirmation (e.g., *"Does this align with your intentions? Shall I proceed with these modifications?"*). Never assume a refactor is approved without my explicit "go ahead."

## 3. ARCHITECTURAL IMPACT WARNINGS
* **Rule:** If a requested modification could alter the fundamental architecture, break existing cross-origin rules, or introduce significant technical debt, you must trigger a hard stop.
* **Action:** 1. Clearly **WARN** me about the architectural impact.
    2. Explain exactly *why* it alters the architecture and what the downstream consequences will be (e.g., breaking CORS, invalidating the current JWT flow).
    3. Ask for explicit permission to proceed, and offer an architecture-friendly alternative if possible.
