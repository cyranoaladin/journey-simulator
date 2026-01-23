import { execFileSync } from 'node:child_process'
import path from 'node:path'

const pattern = 'MongoDB'

const runRg = (args) => {
  try {
    return execFileSync('rg', args, { encoding: 'utf8' }).split('\n').filter(Boolean)
  } catch (error) {
    if (error.status === 1) return []
    if (typeof error.stdout === 'string' && error.stdout.trim()) {
      return error.stdout.split('\n').filter(Boolean)
    }
    throw error
  }
}

const docsFiles = runRg(['--files-with-matches', '-n', pattern, 'docs'])
const rootFiles = runRg([
  '--files-with-matches',
  '-n',
  pattern,
  '--glob',
  '!docs/**',
  '--glob',
  '*.md',
  '.',
])

const allFiles = Array.from(new Set([...docsFiles, ...rootFiles])).sort()

if (allFiles.length === 0) {
  console.log('No Markdown files under docs/ or root reference "MongoDB".')
  process.exit(0)
}

console.log(`Found ${allFiles.length} files referencing "${pattern}":`)
allFiles.forEach((file) => console.log(` - ${path.relative(process.cwd(), file)}`))

console.log('\n--- Context snippets ---')
allFiles.forEach((file) => {
  const snippet = runRg(['-n', '--max-count', '5', pattern, file])
    .map((line) => `  ${line}`)
    .join('\n')
  console.log(`\nFile: ${file}\n${snippet}`)
})

console.log('\n--- Git diff (summary) ---')
try {
  const stat = execFileSync('git', ['diff', '--stat', '--', ...allFiles], { encoding: 'utf8' })
  console.log(stat.trim() || 'No diff yet for these files.')
} catch {
  console.log('Unable to compute git diff --stat for the detected files.')
}

console.log('\n--- Git diff (full) ---')
try {
  const diff = execFileSync('git', ['diff', '--', ...allFiles], { encoding: 'utf8' })
  console.log(diff.trim() || 'No textual diff for these files.')
} catch {
  console.log('Unable to compute git diff for the detected files.')
}
