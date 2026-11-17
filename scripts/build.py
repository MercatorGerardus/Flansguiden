"""Build one self-contained index.html for GitHub Pages (main / root)."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'dist/index.html').read_text()
css = (root / 'dist/style.css').read_text()
# Use system fonts so the standalone build has no font network dependency.
css = css[css.index(':root'):]
data = (root / 'dist/data.js').read_text().replace('export const DATA', 'const DATA')
logic = '\n'.join(line for line in (root / 'dist/logic.js').read_text().splitlines()
                  if not line.startswith('import ')).replace('export ', '')
app = '\n'.join(line for line in (root / 'dist/app.js').read_text().splitlines()
                if not line.startswith('import '))
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
html = html.replace('<script type="module" src="app.js"></script>',
                    '<script>\n' + data + '\n' + logic + '\n' + app + '\n</script>')
(root / 'index.html').write_text(html)
print('Built index.html for GitHub Pages')
