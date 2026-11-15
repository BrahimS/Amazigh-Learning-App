# Agile Workflow

The project uses **Scrum with two-week sprints**, tracked in GitHub Issues and the GitHub Project **"Amazigh Learning – Development Board"**.

## Roles

| Role | Person |
|------|--------|
| Product Owner | @BrahimS |
| Scrum Master | @BrahimS |
| Development team | @BrahimS (more members to be identified) |

All issues are currently assigned to @BrahimS. Reassign them when team members join.

## Work item hierarchy

- **Epic**: a large capability, an issue labelled `type:epic`. Its work items are linked as **sub-issues**.
- **Story / Task / Bug**: an issue small enough to finish within one sprint (≤ 13 points).

## Board status workflow

| Status | Meaning | Entry criteria |
|--------|---------|----------------|
| Backlog | Captured, not yet refined | Issue exists |
| Ready | Refined and ready for a sprint | Acceptance criteria, estimate, no blockers |
| In Progress | Being worked on | Assignee set, branch created |
| In Review | Pull request or design under review | PR opened / XD link shared |
| Testing | Merged to `develop`, being verified | QA on device |
| Done | Acceptance criteria verified | Definition of Done met |

**Rule:** never move an issue to Done unless all of its acceptance criteria are satisfied.

## Project fields

| Field | Type | Usage |
|-------|------|-------|
| Status | Single select | Workflow column (above) |
| Priority | Single select | Critical / High / Medium / Low (mirrors `priority:*` labels) |
| Story Points | Number | Fibonacci 1, 2, 3, 5, 8, 13 |
| Sprint | Iteration | Two-week iterations, Sprint 1 to Sprint 6 |
| Epic | Single select | One of the 12 epics |
| Assignees | Built-in | Owner of the item |
| Due Date | Date | Defaults to the end of the planned sprint |
| Issue Type | Single select | Epic / Feature / Task / Bug / Documentation / Technical Debt / Research |
| Severity | Single select | Bugs only: Critical / Major / Minor / Trivial |

## Saved views

1. **Kanban Board**: board layout grouped by Status, all active items.
2. **Product Backlog**: table, open items, sorted by Priority.
3. **Current Sprint**: board, filtered to `sprint:@current`.
4. **Roadmap**: roadmap layout grouped by Epic, with milestones and sprints.
5. **Bugs**: table filtered to `label:type:bug`, sorted by Severity then Priority.

## Labels

- **Priority:** `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Type:** `type:epic`, `type:feature`, `type:bug`, `type:task`, `type:documentation`, `type:technical-debt`, `type:research`
- **Area:** `frontend`, `backend`, `firebase`, `database`, `ui-ux`, `audio`, `linguistic-content`, `testing`, `devops`
- **Workflow:** `needs-review`, `blocked`, `good-first-issue`

## Ceremonies

| Ceremony | When | Output |
|----------|------|--------|
| Sprint planning | Day 1 of the sprint | Sprint goal; items set to the Sprint iteration and moved to Ready |
| Daily stand-up | Daily, 15 min | Blockers labelled `blocked` |
| Backlog refinement | Mid-sprint | Next sprint's items estimated, with acceptance criteria |
| Sprint review | Last day | Demo; accepted items moved to Done |
| Retrospective | Last day | Improvement actions recorded as issues |

At the end of a sprint, unfinished items go back to **Backlog** (or move to the next iteration) after a discussion.

## Estimation

Story points use the Fibonacci scale (1, 2, 3, 5, 8, 13). Items above 13 points must be split. Velocity is measured from Sprint 2 onward.

## Definition of Ready

- Clear title and user story
- Acceptance criteria are written
- Estimated in story points
- Dependencies identified and unblocked

## Definition of Done

See [CONTRIBUTING.md](../CONTRIBUTING.md#definition-of-done).
