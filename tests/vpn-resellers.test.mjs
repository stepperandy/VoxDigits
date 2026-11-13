import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../base44/functions/vpnResellers/entry.ts', import.meta.url), 'utf8')).replace(/^import .*\n/, '').replace(/Deno\.serve\([\s\S]*$/, '');
const { makeHandler } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
function setup({ user = { email: 'owner@example.com' }, assigned = true, active = true, status = 200, noExpiry = false, providerExpiry = '2099-01-01', localExpiry = '2099-01-01' } = {}) {
 const calls=[];
 const handler=makeHandler(()=>({auth:{me:async()=>user},asServiceRole:{entities:{VPNResellerAssignment:{filter:async q=>{assert.equal(q.user_email,'owner@example.com');return assigned?[{enabled:true,access_until:localExpiry,no_expiry:noExpiry,account_id:7}]:[];}}}}}),()=> 'secret',async(url)=>{
 calls.push(url);const data=url.endsWith('/servers')?[{id:1,city:'London',country_code:'GB',api_key:'private'}]:url.includes('/accounts/')?{status:active?'Active':'Disabled',expired_at:providerExpiry}:{content:'[Interface]\nPrivateKey=test\n[Peer]'};
 return Response.json({data,message:'secret'},{status});});
 return {calls,run:body=>handler(new Request('https://local.test',{method:'POST',body:JSON.stringify(body)}))};
}
const config={action:'config',serverId:1,protocol:'wireguard',account_id:999};
test('unauthenticated calls blocked',async()=>{const s=setup({user:null});assert.equal((await s.run({action:'servers'})).status,401);assert.equal(s.calls.length,0);});
test('server output excludes secrets',async()=>{const r=await setup().run({action:'servers'});assert.equal(r.headers.get('Cache-Control'),'no-store');assert.deepEqual(await r.json(),{servers:[{id:1,name:'London (GB)'}]});});
test('unassigned user denied',async()=>{const s=setup({assigned:false});assert.equal((await s.run(config)).status,403);assert.equal(s.calls.length,0);});
test('caller cannot select another account',async()=>{const s=setup();assert.equal((await s.run(config)).status,200);assert.ok(s.calls[1].endsWith('server_id=1&account_id=7'));});
test('disabled account denied',async()=>assert.equal((await setup({active:false}).run(config)).status,403));
test('provider errors sanitized',async()=>{const r=await setup({status:401}).run({action:'servers'});assert.equal(r.status,502);assert.ok(!(await r.text()).includes('secret'));});
test('browser cannot simulate connection',async()=>{const {VoxVpnPluginWeb}=await import('../src/lib/vpnNativePluginWebFallback.js');const p=new VoxVpnPluginWeb();await assert.rejects(p.connect());assert.equal((await p.getStatus()).connected,false);});

test('approved indefinite assignment allows auto-renewal',async()=>assert.equal((await setup({noExpiry:true,localExpiry:null,providerExpiry:null}).run(config)).status,200));
test('indefinite assignment still rejects expired provider account',async()=>assert.equal((await setup({noExpiry:true,providerExpiry:'2020-01-01'}).run(config)).status,403));
test('ordinary expired assignment remains denied',async()=>assert.equal((await setup({localExpiry:'2020-01-01'}).run(config)).status,403));
test('ordinary assignment rejects provider auto-renewal',async()=>assert.equal((await setup({providerExpiry:null}).run(config)).status,403));
