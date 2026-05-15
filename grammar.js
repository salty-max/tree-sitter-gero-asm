/**
 * @file Parser for the Gero VM assembly language
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'gero_asm',

  // Only spaces/tabs + comments are extras. NEWLINES are significant.
  extras: ($) => [/[ \t]+/, $.comment],

  // Make "words" be identifiers for editor motions.
  word: ($) => $.identifier,

  rules: {
    // File = lines + optional trailing unterminated line
    source_file: ($) =>
      seq(
        repeat($._line),
        optional(seq(optional($._statement), optional($.comment)))
      ),

    // One physical line: [statement] [comment] NEWLINE
    _line: ($) => seq(optional($._statement), optional($.comment), $.newline),

    // CRLF or LF
    newline: (_) => /[\r]?\n/,

    // Statements
    _statement: ($) =>
      choice($.local_label, $.label, $.struct_directive, $.conditional_directive, $.directive, $.instruction),

    // Comments: semicolon to end-of-line (do NOT eat the newline)
    comment: (_) => token(seq(';', /[^\n\r]*/)),

    // Identifiers
    identifier: (_) => token(prec(-1, /[A-Za-z_][A-Za-z0-9_]*/)),

    // Global labels like: start:
    label: ($) => seq(field('name', $.identifier), ':'),

    // Local labels like: .loop:  — leading dot binds to the most
    // recent global label at codegen time.
    local_label: ($) => seq('.', field('name', $.identifier), ':'),

    // ------------------------------------------------------------
    // Directives (e.g. "const INPUT = $2620", "data8 hasFrameEnded = { $00 }")
    // ------------------------------------------------------------
    directive: ($) =>
      seq(
        field('keyword', $.directive_keyword),
        repeat($._dir_tail)
      ),

    directive_keyword: (_) =>
      token(
        choice(
          'const',
          'data8',
          'data16',
          'org',
          'bank',
          'sram_banks',
          'reserve',
          'include'
        )
      ),

    // -- struct directive -----------------------------------
    //
    // `struct` is its own statement type rather than a generic
    // `directive` flavor because the body spans multiple lines —
    // gero's parser tolerates field separators of `,`, newlines,
    // or both. Fields are `<name>: <type>` where `<type>` is the
    // identifier `u8` or `u16` (semantic check happens in the
    // gero parser; tree-sitter just accepts any identifier).
    struct_directive: ($) =>
      seq(
        field('keyword', $.struct_keyword),
        field('name', $.identifier),
        '{',
        repeat(choice($.struct_field, $.newline, ',')),
        '}'
      ),

    struct_keyword: (_) => 'struct',

    struct_field: ($) =>
      seq(
        field('name', $.identifier),
        ':',
        field('type', $.identifier)
      ),

    // -- conditional assembly -------------------------------
    //
    // NASM/ca65-style include-guard directives:
    //
    //   ifndef NAME ... endif
    //   ifdef  NAME ... endif
    //
    // Modeled as its own statement type (separate from `directive`)
    // so highlight queries can target the keyword with a distinct
    // capture — preprocessor-style coloration ≠ value-declaration
    // (`const`) coloration.
    conditional_directive: ($) =>
      choice(
        seq(field('keyword', $.conditional_open_keyword), field('name', $.identifier)),
        field('keyword', $.conditional_close_keyword)
      ),

    conditional_open_keyword: (_) => token(choice('ifdef', 'ifndef')),
    conditional_close_keyword: (_) => 'endif',

    _dir_tail: ($) =>
      choice(
        $.identifier,
        $.symbol_ref,
        $.hex_number,
        $.address,
        $.bracket_expr,
        $.char_literal,
        $.string_literal,
        '{',
        '}',
        ',',
        '=',
        ':',
        $.operator
      ),

    // ------------------------------------------------------------
    // Instructions: ISA-restricted mnemonic + optional operands
    // ------------------------------------------------------------
    instruction: ($) =>
      seq(field('mnemonic', $.mnemonic), optional($.operands)),

    // Only legal mnemonics from the ISA — kept in sync with
    // gero's `src/asm/opcode_resolver.zig` (v0.1-final).
    mnemonic: (_) =>
      token(
        choice(
          // moves
          'mov',
          'mov8',
          'movh',
          'movl',
          // stack
          'push',
          'pop',
          // ALU — arithmetic
          'add',
          'adc',
          'sub',
          'sbc',
          'mul',
          'div',
          'divs',
          'neg',
          'inc',
          'dec',
          'sext',
          // ALU — bitwise / shift
          'and',
          'or',
          'xor',
          'not',
          'shl',
          'shr',
          'asr',
          'rol',
          'ror',
          // compare / test
          'cmp',
          'tst',
          // single-bit ops
          'btest',
          'bset',
          'bclr',
          // misc data
          'swap',
          'bcpy',
          'bfill',
          // jumps & branches
          'jmp',
          'jeq',
          'jne',
          'jlt',
          'jgt',
          'jle',
          'jge',
          'jz',
          'jnz',
          'jcc',
          'jcs',
          'jvc',
          'jvs',
          'jr',
          'djnz',
          // calls / ret
          'call',
          'ret',
          // cross-bank pseudo-instructions (desugar to mov $bank, mb + call/jmp)
          'bank_call',
          'bank_jump',
          // flag control
          'clc',
          'sec',
          'cli',
          'sei',
          'clv',
          // interrupts & misc
          'nop',
          'int',
          'rti',
          'brk',
          'hlt'
        )
      ),

    operands: ($) => seq($._operand, repeat(seq(',', $._operand))),

    _operand: ($) =>
      choice(
        $.register, // r1, ip, acu, ...
        $.address, // &ABCD (immediate address literal)
        $.bracket_expr, // [@SYM + reg], [&ABCD], [reg], ...
        $.hex_number, // $FFFF
        $.symbol_ref, // @SYMBOL
        $.local_label_ref, // .loop (jump target inside the same global block)
        $.char_literal, // 'A'
        $.string_literal, // "Hello, gero!"
        $.paren_expr, // ( ... )
        $.cast, // <Type> obj.prop
        $.identifier // plain symbol (used in data refs, etc.)
      ),

    // `.foo` as an operand — references the most recently defined
    // local label (one of `<global>.foo:`). Distinct from the
    // `local_label` definition rule which trails with `:`.
    local_label_ref: ($) => seq('.', $.identifier),

    // ------------------------------------------------------------
    // Tokens / primaries
    // ------------------------------------------------------------
    hex_number: (_) => token(seq('$', /[0-9A-Fa-f]{1,4}/)),
    address: (_) => token(seq('&', /[0-9A-Fa-f]{1,4}/)),

    // `@`-prefixed symbol reference — the v0.1-final asm syntax.
    // (Earlier grammar drafts used `!`; that's gone.)
    symbol_ref: ($) => seq('@', $.identifier),

    // Single-quoted single character literal (also accepts simple
    // escapes for newline / null / backslash / quote). Used in
    // operand position as an imm8: `mov 'A', r1`.
    char_literal: (_) =>
      token(seq("'", choice(/[^'\\\n]/, seq('\\', /[nrt0'\\"]/)), "'")),

    // Double-quoted string literal — used in `data8 SYM = "...", $00`
    // bodies. Same simple escapes as char_literal.
    string_literal: (_) =>
      token(seq('"', repeat(choice(/[^"\\\n]/, seq('\\', /[nrt0'\\"]/))), '"')),

    // Register names (static list)
    register: (_) =>
      token(
        choice(
          'ip',
          'acu',
          'r1',
          'r2',
          'r3',
          'r4',
          'r5',
          'r6',
          'r7',
          'r8',
          'sp',
          'fp',
          'mb',
          'im'
        )
      ),

    // Simple operators used in expressions
    operator: (_) => token(choice('+', '-', '*')),

    // Parenthesized arithmetic expression (used inside brackets)
    paren_expr: ($) =>
      seq(
        '(',
        repeat(
          choice(
            $.hex_number,
            $.symbol_ref,
            $.identifier,
            $.operator,
            $.paren_expr
          )
        ),
        ')'
      ),

    // Bracketed addressing expression — covers indirect-via-reg
    // (`[r1]`), indirect-via-symbol (`[@SYM]`), and indexed forms
    // (`[@SYM + r3]`, `[&ABCD + r1]`). The optional `&` prefix is
    // preserved for backward compat with the older `&[...]` form.
    bracket_expr: ($) =>
      seq(
        optional('&'),
        '[',
        repeat(
          choice(
            $.hex_number,
            $.address,
            $.symbol_ref,
            $.register,
            $.identifier,
            $.operator,
            $.paren_expr,
            $.cast
          )
        ),
        ']'
      ),

    // Cast inside bracket expressions: <Type> obj.prop
    cast: ($) =>
      seq(
        '<',
        field('type', $.identifier),
        '>',
        field('object', $.identifier),
        '.',
        field('property', $.identifier)
      ),
  },
})
