from pathlib import Path
import re
root = Path('app/(dashboard)')
patterns = [
    (re.compile(r"background:\s*'?#FAFAFA'?#?"), "background: 'var(--bg-secondary)"),
    (re.compile(r"background:\s*'?#F9FAFB'?#?"), "background: 'var(--bg-secondary)"),
    (re.compile(r"background:\s*'?#fff'?#?"), "background: 'var(--bg-card)"),
    (re.compile(r"border:\s*'0.5px solid #E8E8E8'"), "border: '1px solid var(--border-light)'") ,
    (re.compile(r"borderBottom:\s*'0.5px solid #E8E8E8'"), "borderBottom: '1px solid var(--border-light)'") ,
    (re.compile(r"borderRight:\s*'0.5px solid #E8E8E8'"), "borderRight: '1px solid var(--border-light)'") ,
    (re.compile(r"border:\s*'1px solid #E5E7EB'"), "border: '1px solid var(--border)'") ,
    (re.compile(r"color:\s*'?#1F2937'?#?"), "color: 'var(--text-primary)"),
    (re.compile(r"color:\s*'?#9CA3AF'?#?"), "color: 'var(--text-muted)"),
    (re.compile(r"color:\s*'?#4B5563'?#?"), "color: 'var(--text-secondary)"),
]
modified = []
for p in root.rglob('*.tsx'):
    t = p.read_text(encoding='utf-8')
    orig = t
    for pat, repl in patterns:
        t = pat.sub(repl, t)
    if t != orig:
        p.write_text(t, encoding='utf-8')
        modified.append(str(p))
print('Modified files:')
for m in modified:
    print(m)
