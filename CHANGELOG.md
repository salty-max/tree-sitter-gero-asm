# Changelog

## 0.1.3 — 2026-05-15

Drift fix — the grammar advertised two operand forms that the gero asm parser doesn't accept, surfaced while wiring `docs/examples/syntax_overview.gas` into gero's `check-examples` CI gate.

- **`export_marker` (`+const NAME = ...`)** — removed. The asm parser rejects the leading `+` with `unrecognized statement`. The marker was a stub for an export/import linker model that's deliberately out of scope (the include + global-namespace tradition replaces it).
- **`register_ptr` (`&r1`)** — removed. The asm parser rejects this form. `[r1]` is the supported indirect-via-register syntax; `&r1` was a tree-sitter-only artifact.
- Highlight queries trimmed accordingly (no more `@attribute` capture for `export_marker`, no `&` operator on register pointers).
- Corpus test `pointers_and_vars` retitled to `symbol-ref operands` and pared down to forms the gero asm actually accepts.

## 0.1.2 — 2026-05-14

`struct` directive parses as its own statement type, with proper multi-line body support matching gero's parser.

- `struct Name { … }` is no longer a generic `directive` — it's a top-level `struct_directive` rule with `name` / `type` fields per entry and newlines / commas as field separators
- Field shape is now correctly typed: `<name>: <type>` where `<type>` is the identifier `u8` or `u16` (tree-sitter just checks the shape; gero's parser does the semantic check)
- Highlights: `struct_keyword` → `@keyword`, struct name → `@type`, field name → `@property`, field type → `@type.builtin`
- Multi-line corpus test added covering both single-line and multi-line struct forms

## 0.1.1 — 2026-05-14

Bugfix patch — discovered during pre-`nvim-treesitter` verification.

- **`tree-sitter.json` `file-types`** — was `["asm", "gtx", "gasm"]`, the actual gero asm file extension is `.gas`. Without this fix, `nvim-treesitter` users wouldn't get parser activation on `.gas` files even after `:TSInstall gero_asm`. Now `["gas"]`.
- **`tree-sitter.json` query paths** — `highlights` was missing from the grammar block, causing a `tree-sitter highlight` warning. Now points at `queries/highlights.scm`.
- **`queries/highlights.scm` local-label refs** — the rule covered the `local_label` definition (`.loop:`) but missed the `local_label_ref` operand form (`jmp .loop` / `jeq .done`). Both now highlight as `@label`.

## 0.1.0 — 2026-05-14

Initial release tracking the gero v0.1-final asm spec.

- 5 mnemonic renames vs. earlier draft: `lsh→shl`, `rsh→shr`, `lmov→movl`, `hmov→movh`, `swp→swap`
- 22 mnemonics added to match `src/asm/opcode_resolver.zig`
- New syntactic features: local labels, char/string literals, `@SYM` symbol references, bracketed addressing `[…]` / `&[…]`, directives `org` / `bank` / `sram_banks` / `reserve` / `include`
- Queries: highlights, folds, indents
- 11 corpus tests, every `examples/asm/**/*.gas` from the gero repo parses cleanly
