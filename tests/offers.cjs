const assert=require('node:assert/strict');
const {load}=require('./harness.cjs');
const file=process.argv[2]||'Configuratore_PC_Conegliano.html';
const app=load(file),{run,el}=app;
const submit=()=>el('product-form').onsubmit({preventDefault(){}});
// Built-in coupon must survive repeated save/reload migration, too.
assert.equal(run("couponFor(productBases(normalizeState(normalizeState(baseState()))).find(p=>p.id==='gpu-rx9060'))?.code"),'251IKDT7');
// Two selected products reuse Memo Digitale. Editing CPU delivery must not alter RAM.
run("state=normalizeState({...baseState(),selected:{cpu:'cpu-9600x',ram:'ram-kingston32'},edits:{'ram-kingston32':{...PRODUCT_MAP['ram-kingston32'],shop:'memo'}}})");
const ramBefore=run("feeLabel(allProducts(state).find(p=>p.id==='ram-kingston32'))");
run("openEditor('cpu-9600x')");el('f-fee').value='7,90';submit();
assert.equal(el('form-error').textContent,'');
assert.equal(run("feeLabel(allProducts(state).find(p=>p.id==='ram-kingston32'))"),ramBefore,'CPU delivery changed another product at the same shop');
assert.equal(run("calculate(state).groups.find(g=>g.products.some(p=>p.id==='cpu-9600x')).fee"),790);
// New offer at the same shop: new fee/link/coupon, without changing the chosen one.
run("state.images['cpu-9600x']='https://example.com/cpu.png'");
const original=run("JSON.stringify(offersFor(productBases(state).find(p=>p.id==='cpu-9600x'),state)[0])");
run("openEditor('cpu-9600x',null,true)");
assert.equal(el('f-fee').value,'');
el('f-shop').value='memo';el('f-shop').onchange();assert.equal(el('f-fee').value,'');
el('f-price').value='100';el('f-url').value='https://example.com/second';el('f-fee').value='2';
el('f-coupon').value='SAVE';el('f-discount').value='10';el('f-minimum').value='90';submit();
assert.equal(el('form-error').textContent,'');
assert.equal(run("state.selectedOffers['cpu-9600x']"),'base');
assert.equal(run("JSON.stringify(offersFor(productBases(state).find(p=>p.id==='cpu-9600x'),state)[0])"),original);
const offerId=run("state.offers['cpu-9600x'][0].id");
// Edit a nonselected offer. Product identity/photo/selection and original offer stay fixed.
run(`openEditor('cpu-9600x',null,false,${JSON.stringify(offerId)})`);
assert(el('f-name').disabled);assert(el('product-name-label').hidden);
assert.equal(el('f-fee').value,'2.00');
el('f-fee').value='3,50';el('f-url').value='https://example.com/updated';submit();
assert.equal(run("state.selectedOffers['cpu-9600x']"),'base');
assert.equal(run("JSON.stringify(offersFor(productBases(state).find(p=>p.id==='cpu-9600x'),state)[0])"),original);
assert.equal(run("state.images['cpu-9600x']"),'https://example.com/cpu.png');
assert.equal(run("state.offers['cpu-9600x'][0].shippingFee"),350);
// Select through the actual handler. The second offer supplies both the link and shipping.
el('catalog').handlers.change({target:{dataset:{offerPick:'cpu-9600x'},value:offerId,matches:s=>s==='input[data-offer-pick]'}});
assert.equal(run("allProducts(state).find(p=>p.id==='cpu-9600x').url"),'https://example.com/updated');
assert.equal(run("calculate(state).groups.find(g=>g.id==='cpu-9600x').fee"),350);
run('state.applyCoupon=true');assert.equal(run("calculate(state).groups.find(g=>g.id==='cpu-9600x').discount"),1000);
assert(run("buildQuote(state).includes('https://example.com/updated')"));
// Reload normalization preserves all offer fields and independent quotes.
run('persist()');
run('state=normalizeState(JSON.parse(JSON.stringify(state)))');
assert.equal(run("state.selectedOffers['cpu-9600x']"),offerId);
assert.equal(run("state.offers['cpu-9600x'][0].shippingFee"),350);
const key=run('WORKSPACE_KEY'),reopened=load(file,[key,app.storage.get(key)]);
assert.equal(reopened.run("state.offers['cpu-9600x'][0].shippingFee"),350);
assert.equal(reopened.run("state.images['cpu-9600x']"),'https://example.com/cpu.png');
run("nameMode='duplicate'");el('quote-name-input').value='Copia prova';el('quote-name-form').onsubmit({preventDefault(){}});
run("setOfferShipping(state,'cpu-9600x','base',990)");
assert.equal(run("workspace.quotes[0].state.edits['cpu-9600x'].shippingFee"),790);
// Delete base and promote an alternative, keeping conditions and product photo.
assert(run("deleteOffer('cpu-9600x','base')"));
assert.equal(run("allProducts(state).find(p=>p.id==='cpu-9600x').shippingFee"),350);
assert.equal(run("allProducts(state).find(p=>p.id==='cpu-9600x').url"),'https://example.com/updated');
assert.equal(run("couponFor(allProducts(state).find(p=>p.id==='cpu-9600x')).code"),'SAVE');
assert.equal(run("state.images['cpu-9600x']"),'https://example.com/cpu.png');
assert.equal(run("deleteOffer('cpu-9600x','base')"),false);
// Legacy shop fees become independent snapshots. Later edits cannot reuse that coupling.
run("state=normalizeState({...baseState(),shippingOverrides:{memo:790},edits:{'ram-kingston32':{...PRODUCT_MAP['ram-kingston32'],shop:'memo'}},offers:{'cpu-9600x':[{id:'offer-legacy',price:10000,shop:'memo',url:'https://example.com/legacy',couponRule:null}]}})");
assert.equal(run("state.edits['cpu-9600x'].shippingFee"),790);
assert.equal(run("state.edits['ram-kingston32'].shippingFee"),790);
assert.equal(run("state.offers['cpu-9600x'][0].shippingFee"),790);
run("setOfferShipping(state,'cpu-9600x','base',null);state=normalizeState(state)");
assert.equal(run("state.edits['cpu-9600x'].shippingFee"),null);
assert.equal(run("state.edits['ram-kingston32'].shippingFee"),790);
// Totals are per offer: two same-shop products have separate fees and coupon eligibility.
run("state=normalizeState({...baseState(),applyCoupon:true,selected:{cpu:'cpu-9600x',ram:'ram-kingston32'},prices:{'cpu-9600x':10000,'ram-kingston32':5000},edits:{'cpu-9600x':{...PRODUCT_MAP['cpu-9600x'],shippingFee:790,couponRule:{code:'A',amount:1000,min:9000}},'ram-kingston32':{...PRODUCT_MAP['ram-kingston32'],shop:'memo',shippingFee:200,couponRule:{code:'B',amount:2000,min:6000}}}});state.selected=Object.fromEntries(categories(state).map(c=>[c.id,c.id==='cpu'?'cpu-9600x':c.id==='ram'?'ram-kingston32':null]))");
assert.equal(run('calculate(state).subtotal'),15000);assert.equal(run('calculate(state).shipping'),990);
assert.equal(run('calculate(state).discount'),1000);assert.equal(run('calculate(state).total'),14990);
// The shipping panel identifies one offer even when the same shop appears twice.
app.ctx.document.querySelectorAll=()=>[
 {value:'1,50',dataset:{fee:'cpu-9600x',shippingOffer:'base'}},
 {value:'4,00',dataset:{fee:'ram-kingston32',shippingOffer:'base'}}
];el('apply-shipping').onclick();
assert.equal(run('calculate(state).shipping'),550);assert.equal(run('calculate(state).total'),14550);
// Invalid form submission is atomic.
run("openEditor('cpu-9600x',null,true)");el('f-price').value='-1';el('f-url').value='https://example.com/no';
const old=run('JSON.stringify(state)');submit();assert(el('form-error').textContent);assert.equal(run('JSON.stringify(state)'),old);
// Repository embedding is a round trip of the workspace, without an in-memory token.
const source=require('node:fs').readFileSync(file,'utf8');app.ctx.testSource=source;
run("githubToken='TEST_TOKEN_MUST_NOT_EXPORT';stashActive()");
const exported=run('embedRepositorySnapshot(testSource,workspace)');assert(!exported.includes('TEST_TOKEN_MUST_NOT_EXPORT'));
const fs=require('node:fs'),path=require('node:path'),tmp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'pc-offers-'));
try{const roundtrip=path.join(tmp,'config.html');fs.writeFileSync(roundtrip,exported);const restored=load(roundtrip);assert.equal(restored.run('calculate(state).total'),14550);}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('PASS: independent shipping; add/edit/select/delete offers; photos and identity; coupons and totals; legacy migration; reload; duplicate quotes; HTML embedding; invalid input.');
