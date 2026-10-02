import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const roots = ['src', 'tests']
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json'])

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (extensions.has(path.slice(path.lastIndexOf('.')))) files.push(path)
  }
  return files
}

const files = (await Promise.all(roots.map((root) => walk(root)))).flat()
const invalid = files.filter((file) => file.includes('\\t'))
if (invalid.length > 0) {
  console.error(`Formatting check failed in: ${invalid.join(', ')}`)
  process.exit(1)
}
console.log(`Formatting check passed for ${files.length} files.`)
