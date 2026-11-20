
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const source=fs.readFileSync('src/components/Willian3Donation.tsx','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
let calls=0;const moduleExports={};
const mockRequire=(name)=>{
 if(name.endsWith('.css'))return {};
 if(name==='@tanstack/react-start')return {useServerFn:()=>()=>{calls++;throw Error('Unexpected payment request');}};
 if(name.startsWith('@/'))return {};
 return require(name);
};
vm.runInNewContext(js,{exports:moduleExports,require:mockRequire,console,setTimeout,clearTimeout});
assert.equal(moduleExports.validCpf('000.000.000-00'),false);
assert.equal(moduleExports.validCpf('123'),false);
assert.equal(moduleExports.validCpf('529.982.247-25'),true);
assert.equal(moduleExports.validCpf('529.982.247-26'),false);
const html=renderToStaticMarkup(React.createElement(moduleExports.default,{open:false,onClose(){}}));
assert.match(html,/Faça sua Doação/);
assert.equal((html.match(/aria-pressed=/g)||[]).length,9);
assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
assert.match(html,/CONTINUAR/);
assert.equal(calls,0);
const route=fs.readFileSync('src/routes/willian3.tsx','utf8');
assert.equal((route.match(/setDonationOpen\(true\)/g)||[]).length,5);
console.log('PASS: CPF validation, 9 presets, selected default, server render, 5 CTA connections, no payment request.');
