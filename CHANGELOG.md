# Changelog

## 0.3.0 — 2026-05-15

Mnemonic-list sync for the ISA completion sprint — pairs with [salty-max/gero#186](https://github.com/salty-max/gero/pull/186).

- `sext` — sign-extension opcode (single-operand, used by signed-integer codegen). Added to the arithmetic group of the `mnemonic` choice list.
- `asr` — arithmetic shift right (preserves the sign bit). Sits next to `shl` / `shr` / `rol` / `ror` in the shift group.
- `btest` / `bset` / `bclr` — single-bit ops on a register at a 1-byte immediate index. `bset` was already in the mnemonic list (formerly the `bset memset` semantics) and keeps its slot; the resolver disambiguates by operand shape.
- `bfill` — renamed from the previous `bset memset` form. Three-operand fill-with-byte primitive (address, byte, length).
- Stack-frame addressing `[reg + imm]` (e.g. `[fp + $04]`) already parsed via `bracket_expr`; new corpus test pins the shape.
- New corpus file `v0_3_features.txt` covers all four feature families above.

Minor bump (not patch) — the mnemonic literal-set grew by five (one renamed) and the corpus pins a new addressing form that downstream consumers may want to highlight differently.

## 0.2.1 — 2026-05-15

Mnemonic-list completion — pairs with [salty-max/gero#179](https://github.com/salty-max/gero/pull/179).

- `bank_call` and `bank_jump` added to the `mnemonic` choice list. Both are cross-bank pseudo-instructions in the gero asm — they desugar at assembly time to `mov $bank, mb` + `call`/`jmp <addr>`. The grammar treats them like any other one-operand mnemonic; the actual desugaring happens in the assembler.
- New corpus test `bank_pseudos.txt` confirming both parse as `(instruction (mnemonic) (operands (identifier)))`.

Patch bump (not minor) — the grammar shape is unchanged, just the literal-set in the `mnemonic` token grew.

## 0.2.0 — 2026-05-15

Conditional assembly directives — pairs with [salty-max/gero#177](https://github.com/salty-max/gero/pull/177).

- New `conditional_directive` node covering `ifdef NAME` / `ifndef NAME` / `endif`. Modeled as its own statement type (separate from `directive`) so highlight queries can target the keyword with a distinct capture — preprocessor-style coloration ≠ value-declaration coloration.
- Two sub-rules: `conditional_open_keyword` (`ifdef` / `ifndef`) and `conditional_close_keyword` (`endif`).
- Highlights: `(conditional_directive keyword: ...) @keyword.directive` + `(conditional_directive name: (identifier) @constant)` — gives the keyword preprocessor-style coloration in default Neovim themes and the guarded name the same coloration as other `const`-style references.
- New corpus test file `conditional_assembly.txt` covering happy path, ifdef on defined names, and nested ifdef-inside-ifndef.

Minor bump (not patch) because `_statement` grew a new alternative — downstream consumers using the syntax tree get a new node kind to switch on.

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
