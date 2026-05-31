Phase 10 — Documentation finalization and audit checkpoint

Status: In progress.

Completed in this pass:

- Synchronized the main markdown docs with the current repo state.
- Added safety notes for the local data download and model training scripts.
- Documented the actual dataset span on disk: `2020-01-01` to `2026-04-30`.
- Recorded the current storage hotspot findings.

Where the audit stopped:

- I paused after measuring storage usage in the workspace and confirming the major local consumers are `backend/venv` and `frontend/node_modules`.
- I did not start a new chat because this is a workspace/resource issue, not a conversation-state issue.

What is left to do:

1. Finish the remaining documentation pass so `agent.*.md`, `README.md`, `VISION.md`, `DATA_SOURCES.md`, `DEMO_FLOW.md`, `architecture.md`, and `frontend/README.md` all tell the same story.
2. Decide whether the local `backend/venv` and `frontend/node_modules` should be removed and recreated on demand to free disk space.
3. Run backend and frontend tests again once the workspace is stable enough.
4. If you want a tighter local setup, add VS Code watcher exclusions for `backend/venv`, `frontend/node_modules`, and generated logs.

Not applicable on this machine:

- Docker-based hosting instructions, because you said Docker cannot run here.

Recommended next step:

- If the editor keeps reloading, close the current workspace, stop any running `python`, `uvicorn`, or Node processes, and reopen only the folders you need. The chat can stay in the same thread; a brand new chat will not reduce disk usage.
