const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./harness.cjs');
const file=process.argv[2]||'Configuratore_PC_Conegliano.html';
const app=load(file),{run,el}=app;
run("state=normalizeState(baseState());state.selected=Object.fromEntries(categories(state).map(c=>[c.id,c.id==='ram'?'ram-kingston16':null]));state.prices['ram-kingston16']=12300;setOfferShipping(state,'ram-kingston16','base',790);render()");
assert.equal(run('calculate(state).total'),13090);
el('catalog').handlers.input({target:{dataset:{quantity:'ram-kingston16'},value:'2',matches:s=>s==='input[data-quantity]'}});
assert.equal(run('calculate(state).subtotal'),24600);
assert.equal(run('calculate(state).shipping'),790,'Manual shipping must not double');
assert.equal(run('calculate(state).total'),25390);
assert(el('catalog').innerHTML.includes('data-quantity="ram-kingston16"'));
// The chosen offer uses quantity; changing an alternative must preserve it.
run("state.offers['ram-kingston16']=[{id:'offer-other',price:10000,shop:'memo',url:'https://example.com/other',shippingFee:500,couponRule:{code:'ONCE',amount:2000,min:18000}}];state.selectedOffers['ram-kingston16']='offer-other';state.applyCoupon=true;render()");
assert.equal(run('calculate(state).subtotal'),20000);
assert.equal(run('calculate(state).shipping'),500);
assert.equal(run('calculate(state).discount'),2000,'Coupon must be applied once');
assert.equal(run('calculate(state).total'),18500);
assert.equal(run('calculate(state).couponEligible'),true);
assert(run("buildQuote(state).includes('Quantità: 2')"));
assert(run("buildQuote(state).includes('Prezzo unitario: 100,00')"));
assert(run("buildQuote(state).includes('200,00')"));
// Quantity persists across reload, HTML snapshots and quote duplication.
run('persist()');
const key=run('WORKSPACE_KEY'),reopened=load(file,[key,app.storage.get(key)]);
assert.equal(reopened.run("state.quantities['ram-kingston16']"),2);
assert.equal(reopened.run('calculate(state).total'),18500);
app.ctx.testSource=fs.readFileSync(file,'utf8');
const exported=run('embedRepositorySnapshot(testSource,workspace)');
assert(exported.includes('"quantities":{"ram-kingston16":2}'));
run("nameMode='duplicate'");el('quote-name-input').value='Quantità copia';el('quote-name-form').onsubmit({preventDefault(){}});
run("updateProductQuantity('ram-kingston16',3)");
assert.equal(run("workspace.quotes[0].state.quantities['ram-kingston16']"),2);
assert.equal(run('calculate(state).discount'),2000);
// Unselected products do not change the configured price; quantity is retained.
const total=run('calculate(state).total');
run("updateProductQuantity('ram-kingston32',4)");
assert.equal(run('calculate(state).total'),total);
assert.equal(run("state.quantities['ram-kingston32']"),4);
// Migration defaults to one and rejects malformed, deleted or unknown entries.
run("state=normalizeState({...baseState(),deleted:['ram-kingston32'],quantities:{'ram-kingston16':0,'ram-lexar16':1.5,'ram-kingston32':2,'cpu-9600x':2,'cpu-9700x':1000,'ssd-500':'2',missing:2}})");
assert.equal(run('JSON.stringify(state.quantities)'),'{"cpu-9600x":2}');
assert.equal(run("quantityFor(PRODUCT_MAP['ram-kingston16'],state)"),1);
for(const invalid of [0,-1,1.5,1000,NaN,Infinity])assert.equal(run(`updateProductQuantity('cpu-9600x',${invalid})`),false);
// Unknown shipping stays unknown, and coupons never exceed their line subtotal.
run("state=normalizeState({...baseState(),selected:{ram:'ram-kingston16'},quantities:{'ram-kingston16':2}});state.selected=Object.fromEntries(categories(state).map(c=>[c.id,c.id==='ram'?'ram-kingston16':null]));setOfferShipping(state,'ram-kingston16','base',null);state.prices['ram-kingston16']=100;state.edits['ram-kingston16'].couponRule={code:'CAP',amount:500,min:0};state.applyCoupon=true");
assert.equal(run('calculate(state).unknown.length'),1);
assert.equal(run('calculate(state).discount'),200);
assert.equal(run('calculate(state).total'),0);
run("deleteProduct('ram-kingston16')");assert.equal(run("state.quantities['ram-kingston16']"),undefined);
console.log('PASS: quantities and actual input handler; unit/line totals; manual shipping unchanged; coupon once and threshold; offer switches; reload/HTML export; independent quotes; invalid and legacy quantities.');
