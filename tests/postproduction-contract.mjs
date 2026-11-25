import assert from 'node:assert/strict'
import { finalizeStage,finalizeRecipe,finalizeComparison } from '../dist/frontend.js'
const stage=finalizeStage({kind:'refine',seed:123,reference:true,guidance:3.2,end:.7})
const variants=finalizeComparison(stage,'creativity',[.15,.25,.4]);assert.deepEqual(variants.map(v=>v.creativity),[.15,.25,.4]);assert.ok(variants.every(v=>v.seed===123&&v.guidance===3.2&&v.end===.7));assert.equal(stage.creativity,.25)
assert.throws(()=>finalizeComparison(stage,'creativity',[.2,.2]),/distinct/);assert.throws(()=>finalizeComparison(stage,'creativity',[.2,2]),/within range/);assert.throws(()=>finalizeComparison(stage,'steps',[10.5,30]),/within range/);assert.throws(()=>finalizeComparison(finalizeStage({kind:'refine'}),'guidance',[2,3]),/Enable reference/);assert.throws(()=>finalizeComparison(stage,'cfg',[1]),/two to four/)
assert.throws(()=>finalizeRecipe({stages:[]}),/one and eight/);assert.throws(()=>finalizeRecipe({stages:[{kind:'exec'}]}),/Unknown/);assert.throws(()=>finalizeRecipe({stages:Array(9).fill(stage)}),/one and eight/)
const recipe=finalizeRecipe({name:'Test',secret:'never saved',stages:[{kind:'refine',rawRequestOverride:'secret',enabled:false,seed:99999999999}]});assert.equal(recipe.secret,undefined);assert.equal(recipe.stages[0].rawRequestOverride,undefined);assert.equal(recipe.stages[0].enabled,false);assert.equal(recipe.stages[0].seed,4294967295)
console.log('Finalize recipe and same-seed Render Lab contracts PASS')
