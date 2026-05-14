; Indent the body of every label block.
;
; The convention in `examples/asm/*.gas` is 2-space indent for
; instructions / directives that live under a label. Editors that
; honor `@indent.begin` / `@indent.end` will press tab into the
; right column on a new line under a label.
(label) @indent.begin
(local_label) @indent.begin

; Multi-line bracketed expressions inside an instruction also
; deserve a hanging indent.
(bracket_expr) @indent.begin
(bracket_expr "]" @indent.end)

; Parenthesized expressions inside brackets — same idea.
(paren_expr) @indent.begin
(paren_expr ")" @indent.end)
