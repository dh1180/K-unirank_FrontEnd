import test from "node:test";
import assert from "node:assert/strict";
import { swaggerAsset, swaggerDocument, publicQueryPath } from "../src/lib/swagger-proxy.mjs";

test("Swagger publishes grouped schemas but only proxies known public GET queries", async()=>{
  process.env.API_INTERNAL_URL="http://private-api.test:8080";
  let calls=[];
  const upstream=async(url,options)=>{calls.push({url:String(url),options});return Response.json({openapi:"3.1.0",info:{title:"test"},servers:[{url:"http://private.internal"}],paths:{}});};
  const spec=await swaggerDocument(["spec","member"],"",upstream);
  const body=await spec.json();
  assert.equal(body.servers[0].url,"/api-docs/proxy");
  assert.equal(spec.headers.get("x-robots-tag"),"noindex, nofollow");
  assert.equal(calls[0].url,"http://private-api.test:8080/v3/api-docs/member");
  assert.deepEqual(Object.keys(calls[0].options.headers),["Accept"]);
  const config=await (await swaggerDocument(["config"])).json();
  assert.equal(config.urls.length,4);
  assert.deepEqual(config.supportedSubmitMethods,["get"]);
  assert.equal(config.persistAuthorization,false);
  calls=[];
  for(const path of ["member/me","admin/overview","boards/overall/next","ai/questions"]) {
    assert.equal((await swaggerDocument(["proxy","api","v1",...path.split("/")],"",upstream)).status,404);
  }
  assert.equal((await swaggerDocument(["spec","http://attacker.test"],"",upstream)).status,404);
  assert.equal((await swaggerAsset(["..","api","v1","member"],upstream)).status,404);
  assert.equal(calls.length,0);
  await swaggerDocument(["proxy","api","v1","admissions","results"],"?q=test&page=0&size=2",upstream);
  assert.equal(calls[0].url,"http://private-api.test:8080/api/v1/admissions/results?q=test&page=0&size=2");
  assert.equal(publicQueryPath("/api/v1/universities/367/overview"),true);
  assert.equal(publicQueryPath("//attacker.test/api/v1/universities"),false);
  assert.equal(publicQueryPath("/api/v1/universities/../member/me"),false);
  const initializer=await swaggerAsset(["swagger-initializer.js"],upstream);
  assert.match(await initializer.text(),/configUrl:"\/api-docs\/config\/"/);
  delete process.env.API_INTERNAL_URL;
});
