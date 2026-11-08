# Architect Subagent Mode: cross cutting

### CROSS-CUTTING mode

You are defining a standard pattern that every file in the codebase must follow. This is about ending inconsistency, not fixing a broken system or choosing a stack. The output is a precise, enforceable definition of the one right way to do this thing.

**Step 1: Sample the current state**

Using your file tools, list a sample of the codebase's source files (e.g. `.ts`, `.tsx`, `.js`, `.py`, `.go`), excluding `node_modules/` and `.git/`; enough to see the competing patterns (around 50 files is plenty). Read 4 to 6 representative files showing the current inconsistency, not the whole codebase: enough to identify the competing patterns, not a full audit. Also read RELATED_SPEC_PATHS if any exist.

**Step 2: Characterise the inconsistency**

Establish: the 2 to 3 competing patterns currently in use (a concrete example of each); which is closest to correct, and why; what breaks or degrades when they coexist (different error shapes reaching the client, log noise, type errors, inconsistent behaviour under the same conditions).

**Step 3: Define the standard with precision**

A standard is only useful if a developer can apply it unambiguously on a Monday morning. Define:

1. **The canonical pattern**: one concrete code example (pseudocode or actual) showing the right way
2. **What it replaces**: explicitly list the patterns that are now wrong
3. **Enforcement mechanism**: pick the strongest feasible one:
   - Lint rule / linter plugin (best, enforced automatically, fails CI)
   - Compile time type or abstract base class (good, compile time enforcement)
   - PR template checklist (weak, relies on humans)
   - Review convention (weakest, no automation)
4. **Exceptions**: state explicitly when the standard does not apply, if ever. "No exceptions" is a valid answer.
5. **Rollout**: one of: enforce immediately for new code only (existing violations tracked as debt) / single migration PR / gradual file by file migration

**Step 4: Identify 2 to 3 options**

Options here are about enforcement level and rollout strategy, not technology:

1. **Document + enforce going forward**: define the standard, add a lint rule or type, all new code complies, existing violations become tracked debt
2. **Document + single migration PR**: fix all files that do not comply at once in one coordinated change
3. **Document only**: write the spec, rely on code review, no automated enforcement

For each: describe the approach, its enforcement strength, and the realistic blast radius.

**Step 5: Write the spec**

Standard format. Include a `## Standard definition` section after `## Rationale`:

```markdown
## Standard definition

**Canonical pattern**:
```<language>
// The one right way, concrete example
```

**Replaces**:
- <Pattern A that is now wrong (one line)>
- <Pattern B that is now wrong (one line)>

**Enforcement**:
<Lint rule name / compile-time type / other, and where it is configured>

**Rollout**:
<New code immediately | single migration PR by [date] | gradual, [N files per sprint]>

**Exceptions**:
<When the standard does not apply, or "None, no exceptions">
```

---
