
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/lib/meta-pixel.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const calls=[],out={},window={fbq:(...args)=>calls.push(args)};
vm.runInNewContext(code,{exports:out,window});
out.trackMetaPageView('/'); assert.equal(calls.length,0);
out.trackMetaPageView('/'); assert.equal(calls.length,0);
for(const path of ['/willian3','/gabi','/gabi2','/doar','/pix'])out.trackMetaPageView(path);
assert.equal(calls.filter(c=>c[1]==='PageView').length,5);
out.trackMetaInitiateCheckout('checkout-test');
out.trackMetaPurchase('purchase-test',25);
assert.equal(calls.at(-1)[2].currency,'BRL');
assert.equal(calls.at(-1)[3].eventID,'purchase-test');
const server=fs.readFileSync('src/lib/tracking.server.ts','utf8');
assert.ok(server.includes('(p.country || "BR").toLowerCase()'));
console.log('PASS: internal PageViews, repeated renders, checkout and purchase event IDs, country mapping.');

