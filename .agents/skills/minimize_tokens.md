# Skill: Token Minimization and Efficient Agent Operations

This skill file provides a set of strict guidelines and patterns for Antigravity (and other AI coding assistants) to operate with maximum efficiency, minimizing prompt and completion token usage while performing minor fixes, debugging, and deploying this React + Vite + Tailwind CSS Kids Chore app.

## Triggers
- When starting any task on this repository.
- Before reading, searching, or modifying files in this workspace.
- When performing application builds or deployment preparation.

## Guidelines for Token Minimization

### 1. Targeted Code Reading
- **Do not read complete files** unless absolutely necessary or if the file is extremely short (<50 lines).
- Always use the `StartLine` and `EndLine` parameters of the `view_file` tool to target only the specific lines or functions of interest.
- Maintain a mental model of the files you have already viewed to avoid redundant reads.

### 2. Highly Focused Grepping and Searching
- Avoid searching inside heavy folders like `node_modules` or build outputs (`dist`).
- Always use the `Includes` parameter in the `grep_search` tool to narrow the scope (e.g., filter by `src/**/*.jsx`, `src/**/*.js`, or `src/**/*.css`).
- Set `MatchPerLine` to `false` if you only need to identify which files contain the query, rather than seeing every line match.
- Use precise queries rather than generic words.

### 3. Precision File Editing
- Use `replace_file_content` for a single contiguous block of edits.
- Use `multi_replace_file_content` ONLY when making multiple non-contiguous edits in the same file.
- **Never replace the entire file content** for a small or localized change. Replacing the entire file consumes huge amounts of output tokens and is highly prone to errors.
- Ensure the `TargetContent` matches the existing content exactly (including leading whitespace) to avoid tool failures and retries.

### 4. Efficient Command Execution
- Do not run continuous development servers or long-running tasks synchronously.
- When running builds or tasks, set appropriate wait times (e.g., 5000ms) or let them run in the background.
- **Never poll command status repeatedly** in a tight loop. Trust the system's asynchronous notification mechanism to notify you when the command completes.
- Limit the retrieved output character count to the minimum required to verify success or diagnose an error.

### 5. Highly Concise Communication
- Keep responses short, direct, and professional.
- Do not repeat entire blocks of modified code in the chat response; instead, mention the file name and the high-level change.
- Point the user to workspace file paths using clickable markdown links (e.g., `[App.jsx](file:///c:/Users/isvid/Documents/kids_app/src/App.jsx)`) instead of copying file paths as raw text.
- Do not summarize UI artifacts or walkthroughs in the chat unless explicitly requested.

---

## Workspace Directory Structure & Deployment Map
- **Source Code**: All React components are under [src/components](file:///c:/Users/isvid/Documents/kids_app/src/components) and views are under [src/views](file:///c:/Users/isvid/Documents/kids_app/src/views).
- **State Management**: Zustand store is located in [useAppStore.js](file:///c:/Users/isvid/Documents/kids_app/src/store/useAppStore.js).
- **Vite & PWA Config**: Configuration is in [vite.config.js](file:///c:/Users/isvid/Documents/kids_app/vite.config.js).
- **Build Output**: Generates production-ready assets in the `dist` folder.
- **Verification Command**: Run `npm run build` to verify the codebase compiles successfully.
