# Changelog

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
