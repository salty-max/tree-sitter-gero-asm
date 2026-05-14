; Fold each label block (every line between a `label:` / `.local:`
; and the next blank line or label). Editors collapse the body of
; a routine to a single header line.
(label) @fold
(local_label) @fold

; Multi-line `struct` and `data8/data16` literal bodies fold too —
; useful for graphics blobs.
(directive
  (directive_keyword) @_kw
  (#match? @_kw "^(struct|data8|data16)$")) @fold
