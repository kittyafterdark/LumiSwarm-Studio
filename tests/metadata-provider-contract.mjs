import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';

// Read-only compatibility check against the installed core source. No provider calls or writes.
const core = process.env.LUMIVERSE_SOURCE || path.resolve('../..', 'LumiTest/Lumiverse');
const provider = (await readFile(path.join(core, 'src/image-gen/providers/swarmui.ts'), 'utf8')).replaceAll('\r\n', '\n');
const types = (await readFile(path.join(core, 'src/image-gen/types.ts'), 'utf8')).replaceAll('\r\n', '\n');
const bridge = (await readFile(path.join(core, 'src/spindle/worker-host-image-gen-api.ts'), 'utf8')).replaceAll('\r\n', '\n');
const transpile = source => stripTypeScriptTypes(source, { mode: 'transform' });
const body = provider.slice(provider.indexOf('  private buildBody('), provider.indexOf('  /** Fetch an image'));
assert.ok(body.includes('rawRequestOverride'));
const unwrap = provider.slice(provider.indexOf('function unwrapPresetExport('), provider.indexOf('/** Cached resolved SwarmUI session.'));
// The marker is checked explicitly so source changes fail without guessing a function boundary.
const unwrapEnd = unwrap.indexOf('\n}\n');
assert.ok(unwrapEnd > 0);
const applySource = transpile(types).replace(/^import\s[\s\S]*?;\s*$/gm, '').replace(/^export\s/gm, '');
const applyRawOverride = new Function(applySource + '\nreturn applyRawOverride;')();
const Provider = new Function('applyRawOverride', transpile(unwrap.slice(0, unwrapEnd + 3) + '\nclass Probe { resolvedModel() { return "fixture"; }\n' + body.replace('private buildBody', 'buildBody') + '\n}\n') + '\nreturn Probe;')(applyRawOverride);
const metadata = { studio_schema: '1', studio_origin: 'lumiswarm', studio_asset_id: '11111111-1111-4111-8111-111111111111', studio_pipeline_id: '11111111-1111-4111-8111-111111111111', studio_parent_id: '', studio_stage: 'expression_draft', studio_retention: 'candidate' };
const probe = new Provider();
for (const override of [{ extra_metadata: metadata, maskblur: 12 }, { param_map: { extra_metadata: metadata } }]) {
    const result = probe.buildBody('session-fixture', { prompt: 'same prompt', parameters: { rawRequestOverride: JSON.stringify(override) } });
    assert.deepEqual(result.extra_metadata, metadata, 'exact string map survives the actual provider builder');
}
assert.equal(probe.buildBody('session-fixture', { prompt: 'fixture', parameters: { extra_metadata: metadata } }).extra_metadata, undefined, 'bare parameter is not a supported passthrough');
assert.ok((provider.match(/this\.buildBody\(sessionId, request\)/g) ?? []).length >= 2, 'HTTP and WS use the builder');
assert.match(bridge, /const parameters = \{ \.\.\.connection\.default_parameters, \.\.\.\(input\?\.parameters \|\| \{\}\) \}/);
console.log('Actual Lumiverse Swarm provider metadata passthrough, HTTP/WS builder and bridge contract: PASS (mock request; no live generation)');

assert.equal(probe.buildBody('session-fixture',{prompt:'fixture',parameters:{rawRequestOverride:'{"donotsave":true}'}}).donotsave,true);
const fetchStart=provider.indexOf('  private async fetchImage(');assert.ok(fetchStart>0);
const fetchEnd=provider.indexOf('\n  }',fetchStart)+5;assert.ok(fetchEnd>fetchStart);
const FetchProbe=new Function(transpile('class FetchProbe { '+provider.slice(fetchStart,fetchEnd).replace('private async fetchImage','async fetchImage')+' }')+';return FetchProbe;')();
assert.equal(await new FetchProbe().fetchImage('http://fixture','data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA','unsaved native output is accepted without a file fetch');
