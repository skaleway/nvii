# Verification

**Purpose**: Prove the codebase index is complete before marking the skill invocation as done.

## 1. Completeness Backstop

After all phases complete, run this check:

1. Collect every `import`, `require`, `use`, `include`, `from`, or equivalent statement discovered across all `inspect`-depth files.
2. Extract every file path or module name from those statements.
3. Verify each resolved path maps to a file that was actually read and cataloged in the index.
4. For any file that was **not** cataloged, add it to the index at the appropriate depth.
5. Repeat until no new files appear.

## 2. Verification Checklist

### Structural

- [ ] Every top-level directory (excluding `skip`-depth) is represented in the index.
- [ ] Every config file format expected for the detected language/framework is accounted for (e.g., if it's a Node project, `package.json`, `tsconfig.json`, `.eslintrc*`).
- [ ] All entry points (CLI, HTTP, workers, exported API) are documented.

### Dependencies

- [ ] Internal dependency graph is complete: every import/require is resolved to a file in the codebase or flagged as external.
- [ ] External dependency audit lists every package from every lock/manifest file.

### Tests

- [ ] Test directory or file naming convention is identified.
- [ ] Test framework is identified from config or test file contents.

### Data Flow

- [ ] All data models / schemas are discovered and summarized.
- [ ] API routes (if any) are enumerated with methods and handlers.

### Artifact Quality

- [ ] Index artifact follows the section order from `rules/artifact-format.md`.
- [ ] Every claim in the artifact cites a source file and line range.
- [ ] Unknowns / human questions are listed in a dedicated section.
- [ ] The artifact's "last indexed" timestamp is set.
- [ ] No placeholder text ("TODO", "TBD", "FIXME") remains in the artifact.

## 3. Blocker Handling

If a file or directory cannot be explored, document:

- Path of the blocked resource
- Reason (permission denied, binary format, missing external dependency, submodule not cloned)
- What would be needed to unblock it

Do not fabricate content for blocked resources. Mark them clearly as "blocked" in the index.

## 4. Self-Correction

If during verification you discover a gap:

1. Pause verification.
2. Go explore the missing area at the appropriate depth.
3. Append findings to the index artifact.
4. Resume verification from the beginning.

Do not skip gaps. Every gap must be resolved or documented as a blocker.

## 5. Exit Criteria

The skill invocation is complete when:

- [ ] All items in the verification checklist pass, or blockers are documented.
- [ ] The index artifact is written to the output path.
- [ ] Unknowns / human questions are flagged.
- [ ] The agent can answer "is there any file in this codebase you haven't read?" with "no, every file is cataloged."
