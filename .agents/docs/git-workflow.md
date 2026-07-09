# Git Workflow & PR Standards

## Branching

Always cut new branches from `main`, not from another in-flight feature branch. Each PR should be reviewable and mergeable independently against the current default-branch tip.

Stack PRs only when a real dependency exists (the second PR cannot function without the first); otherwise, branch off `main` even if you're working on related changes back-to-back.

Before starting any feature work, sync main:

```bash
git checkout main && git pull --ff-only
git checkout -b feat/<short-description> main
```

**Branch prefixes:** `feat/`, `fix/`, `refactor/`, `chore/` as appropriate.

## PR Checklist

Before opening a PR:

1. Run linter and fix all warnings
2. Run `npm run build` (frontend) to validate TypeScript
3. Run `alembic upgrade head` to verify migrations apply cleanly
4. Smoke test the affected feature manually

## PR Description Format

Every PR description must include:

1. **Summary** — One paragraph describing intent (what and why, not how)
2. **Test plan** — Checklist of what was tested
3. **Callouts** — Explicit mention of any new shared helpers, `config.py` entries, or environment variable changes

## Documentation

- Add docstrings + comments for non-obvious intent.
- Avoid redundant comments that just narrate what the code does.
