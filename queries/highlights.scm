; -------- Comments --------
(comment) @comment

; -------- Labels --------
(label (identifier) @label)
(local_label (identifier) @label)
(local_label "." @punctuation.special)
(local_label_ref (identifier) @label)
(local_label_ref "." @punctuation.special)

; -------- Directives --------
(directive keyword: (directive_keyword) @keyword)
(directive export: (export_marker) @attribute)

; -------- Struct directive --------
(struct_directive keyword: (struct_keyword) @keyword)
(struct_directive name: (identifier) @type)
(struct_field name: (identifier) @property)
(struct_field type: (identifier) @type.builtin)

; -------- Instructions / mnemonics --------
(mnemonic) @keyword

; -------- Registers & register pointers --------
(register) @variable.builtin
(register_ptr "&" @operator)
(register_ptr (register) @variable.builtin)

; -------- Literals --------
(hex_number) @number
(address) @number
(char_literal) @character
(string_literal) @string

; -------- Bracketed address expressions ([ ... ] / &[ ... ]) --------
(bracket_expr "&" @operator)
(bracket_expr "[" @punctuation.bracket)
(bracket_expr "]" @punctuation.bracket)

; -------- Symbol references (@IDENT) --------
(symbol_ref "@" @operator)
(symbol_ref (identifier) @constant)

; -------- Operators --------
(operator) @operator

; -------- Casts (<Type> obj.prop) --------
(cast "<" @punctuation.special)
(cast ">" @punctuation.special)
(cast "." @punctuation.delimiter)
(cast type: (identifier) @type)
(cast object: (identifier) @variable)
(cast property: (identifier) @property)
