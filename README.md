# tree-sitter-gero-asm

Tree-sitter grammar for the [Gero VM](https://github.com/salty-max/gero)
assembly language (`.gas`).

## Spec tracking

This grammar tracks the **gero v0.1-final asm spec** — see
[`docs/asm-spec.md`](https://github.com/salty-max/gero/blob/main/docs/asm-spec.md)
in the gero repo. Every syntactic feature accepted by gero's
`src/asm/parser.zig` is recognized here: global + local labels,
instructions (52 mnemonics), directives (`const`, `data8`,
`data16`, `struct`, `org`, `bank`, `sram_banks`, `reserve`,
`include`), bracketed addressing (`[@SYM + reg]`, `[r1 + $04]`,
`&[…]`), `@SYM` references, character / string literals, and the
`<Type> obj.prop` cast form used inside bracket expressions.

When the gero asm spec bumps, this grammar bumps in lockstep —
the grammar version mirrors the lowest gero asm spec it parses
cleanly.

## Use

### Tree-sitter consumers (Neovim, Helix, Zed, …)

```lua
-- Neovim: register the parser + queries
require'nvim-treesitter.parsers'.get_parser_configs().gero_asm = {
  install_info = {
    url = "https://github.com/salty-max/tree-sitter-gero-asm",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "gas",
}
```

`queries/highlights.scm`, `queries/folds.scm`, `queries/indents.scm`
ship with the parser — point your editor's runtime path at them.

### VS Code

Use the [`vscode-gero`](https://github.com/salty-max/vscode-gero)
extension; it bundles this grammar plus a TextMate fallback.

## Develop

```bash
npm install               # installs tree-sitter-cli
npx tree-sitter generate  # regen parser.c after grammar.js edits
npx tree-sitter test      # run the corpus tests under test/corpus/
npx tree-sitter parse <file.gas>  # one-shot parse for ad-hoc debugging
```

The corpus tests under `test/corpus/` are the canonical
acceptance for grammar changes. CI parses every
`examples/asm/*.gas` from the gero repo on every PR.

## License

MIT.
