# Example: TiCLearn RULES.md

> Structural reference showing how a real-world `RULES.md` is organized. Use this to understand the tone, depth, and evidence style expected in generated output.

**Source**: `/home/afuhflynn/Projects/TiC_Foundation/ticlearn/RULES.md` (432 lines, 30 rules)

---

## Overall Structure

The file is flat (no nested sections beyond level-2 headings). Each rule is a self-contained section with:

1. **Heading** (`## N. Title`) - numbering + short title
2. **Opening paragraph** - one to three sentences stating the rule and its rationale
3. **Evidence citations** - file paths with relative links (e.g., `[`./app/layout.tsx`](./app/layout.tsx)`)
4. **Rules / bullet points** - actionable "Do / Do not" guidance
5. **Warnings** - critical notes about what not to do, in bold or emphatic language

---

## Section Archetypes Found

### Archetype A: "This is how X works" (Declarative)

Used for architecture, data flow, and tooling. States the canonical pattern, then lists rules.

**Example** (Rule 3 - Data Flow):
```
## 3. The Data Flow Is UI -> Hook -> API -> Prisma/Integration

- Preferred mental model:
  - page/component triggers a hook
  - hook owns query or mutation behavior via React Query
  - route owns authorization, validation, DB writes, and integration calls
  - Prisma schema is the persistence source of truth
- If you change one stage, check the adjacent stages immediately.

Never change a route contract in isolation if a hook or page already depends on it.
```

### Archetype B: "Use this, not that" (Prescriptive)

Used for tooling, libraries, and conventions where there are alternatives.

**Example** (Rule 26 - Package Manager):
```
## 26. Package Manager: Use pnpm

- This project uses **pnpm** as the package manager, not npm or yarn.
- Always use `pnpm install`, `pnpm add`, `pnpm dev`, etc.
- Do not use `npm` or `yarn` commands directly.
```

### Archetype C: "X must stay Y" (Constraint)

Used for architecture boundaries, security, and safety.

**Example** (Rule 13 - Server-Owned Integrations):
```
## 13. Email, Payment, And AI Must Stay Server-Owned

- Email: [`lib/email/send.ts`](./lib/email/send.ts)
- Payment: [`lib/fapshi.ts`](./lib/fapshi.ts)
- AI: [`lib/ai.ts`](./lib/ai.ts)

Rules:
- never expose secrets to the client
- never move these integrations into client components
```

### Archetype D: "Ownership table" (Inventory)

Used for feature-to-code mappings. A table listing each feature with its hook owner, API owner, and cache keys.

**Example** (Rule 7 - UI/API/Cache Ownership):
```
- Notes:
  - hook owner: `hooks/useNotes.ts`
  - API owner: `app/api/notes*`
  - cache keys: `notes`, `note(id)`, `usage`
- Quizzes:
  - hook owner: `hooks/useQuizzes.ts`
  - API owner: `app/api/quizzes*`
  - cache keys: `quizzes`, `quiz(id)`, ...
```

### Archetype E: "Watch for this drift" (Warning)

Used for known issues, inconsistencies, and foot-guns. Bullet list of specific problems with file paths.

**Example** (Rule 24 - Existing Drift):
```
Known drift already present:
- `app/api/subscription/me/route.ts` returns `{ subscription, previousPlan }` but `usePlan` may not consume the shape correctly.
- middleware writes `redirect`, sign-in reads `callbackUrl` - parameter name mismatch.
```

### Archetype F: "Read these first" (Checklist)

Used for onboarding and pre-work. Simple numbered list.

**Example** (Rule 25 - Read Before Changes):
```
## 25. Read These Files Before Large Changes

- [`docs/codebase-index.md`](./docs/codebase-index.md)
- [`docs/feature-flows.md`](./docs/feature-flows.md)
- [`app/layout.tsx`](./app/layout.tsx)
```

### Archetype G: "Non-Negotiable" (Hard rules)

Used for safety rules. Bold imperative statements with no exceptions.

**Example** (Rule 30 - Safety):
```
- Do not commit secrets from `.env`. Use `.env.example` for documentation.
- Do not expose provider keys in client code.
- Do not change route response shapes without checking all hook and page consumers.
```

---

## Evidence Style

Every claim includes a file path. Most paths are relative markdown links:

```markdown
- Cache keys are centralized in [`lib/query-keys.ts`](./lib/query-keys.ts).
- Route groups are split into: marketing: `app/(marketing)`
```

The link syntax `[text](./path)` is preferred over bare `text (./path)`.

---

## Tone

- **Direct and imperative**: "Never", "Always", "Do not", "Must", "Prefer"
- **Factual, not opinionated**: States what IS, not what SHOULD BE idealistically
- **Specific, not generic**: Uses exact file paths, function names, and version numbers
- **Caveat-aware**: Calls out known drift explicitly rather than assuming consistency

---

## Per-Language Adaptation Notes

This example is from a TypeScript/Next.js project. For other languages, the file would:

| Adaptation | Example |
|---|---|
| Python | `## 3. Data Flow Is View → Serializer → ORM → DB` with Django REST patterns |
| Rust | `## 4. Module Tree & Cargo Workspace` with workspace member listing |
| Go | `## 2. Architecture: cmd/internal/pkg Convention` |
| Generic | `## 10. Dependency Management` based on available lockfile |

The structural archetypes (Declarative, Prescriptive, Constraint, Inventory, Warning, Checklist, Hard Rules) are universal.
