import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { frontendSources } from './frontend-sources.mjs'

// Check the same compilation units as build.mjs, not the shared-scope fragments.
const temporary = await mkdtemp(join(tmpdir(), 'swarm-types-'))
try {
  for (const [name, paths] of [['frontend', frontendSources], ['backend', ['src/state/prompt-families.ts', 'src/state/recipes.ts', 'src/state/finalize.ts', 'src/state/expression-set.ts', 'src/state/cast-presentations.ts', 'src/state/cast.ts', 'src/state/stage-cues.ts', 'src/backend.ts', 'src/workflows/postproduction.ts']]]) {
    await writeFile(join(temporary, `${name}.ts`), (await Promise.all(paths.map(path => readFile(resolve(path), 'utf8')))).join('\n'))
  }
  const compiler = process.env.STUDIO_TSC || resolve('node_modules/typescript/bin/tsc')
  const result = spawnSync(process.execPath, [compiler, '--noEmit', '--strict', '--skipLibCheck', '--target', 'ESNext', '--module', 'ESNext', '--moduleResolution', 'bundler', '--lib', 'ESNext,DOM,DOM.Iterable', join(temporary, 'frontend.ts'), join(temporary, 'backend.ts')], { stdio: 'inherit', cwd: temporary })
  process.exitCode = result.status ?? 1
} finally {
  await rm(temporary, { recursive: true, force: true })
}

