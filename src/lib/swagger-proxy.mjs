const groups = { public: "공개 조회 API", member: "회원·관리자 (내부 문서)", voting: "대학 투표 (내부 문서)", ai: "AI 입결 (내부 문서)" };
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" };
const error = (status) => Response.json({ detail: "API 문서를 불러올 수 없습니다." }, {status, headers});

export function publicQueryPath(path) {
  return /^\/api\/v1\/(universities(?:\/regions|\/[1-9]\d*(?:\/(?:overview|admission-reference))?)?|admissions\/(?:results|compare|universities\/[1-9]\d*|units\/[1-9]\d*)|rankings\/(?:catalog|admissions|indicators\/[a-z-]+)|boards\/[a-z0-9-]+\/ranking|results\/[a-fA-F0-9-]{36}|seo\/urls)\/?$/.test(path);
}

/** Fixed private upstream; never forward browser credentials or service tokens. */
async function upstream(path, query, fetcher) {
  if (!process.env.API_INTERNAL_URL) return error(503);
  try {
    const url = new URL(path, process.env.API_INTERNAL_URL);
    url.search = query;
    return await fetcher(url, { headers: {Accept:"application/json, text/html, */*"},
      cache:"no-store", redirect:"manual", signal:AbortSignal.timeout(15_000) });
  } catch { return error(502); }
}

export async function swaggerAsset(parts, fetcher = fetch) {
  if (!parts?.length) return new Response(null,{status:307,headers:{...headers,Location:"/swagger-ui/index.html"}});
  const asset = parts.join("/");
  if (parts.length!==1 || !/^(?:index\.html|swagger-(?:ui(?:-bundle|-standalone-preset)?\.(?:js|css)(?:\.map)?|initializer\.js)|index\.css|oauth2-redirect\.html|favicon-(?:16x16|32x32)\.png)$/.test(asset)) return error(404);
  const res = await upstream("/swagger-ui/"+asset, "", fetcher);
  if(!res.ok) return error(res.status>=500?502:404);
  // Use same-origin configuration and prevent the bundled default Petstore/validator URLs.
  if(asset==="swagger-initializer.js") return new Response(`window.onload=function(){window.ui=SwaggerUIBundle({configUrl:"/api-docs/config/",dom_id:"#swagger-ui",deepLinking:true,presets:[SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],layout:"StandaloneLayout"});};`,{headers:{...headers,"Content-Type":"text/javascript; charset=utf-8"}});
  return new Response(await res.arrayBuffer(), {headers:{...headers,"Content-Type":res.headers.get("content-type")||"application/octet-stream"}});
}

export async function swaggerDocument(parts, query = "", fetcher = fetch) {
  if(parts.length===1 && parts[0]==="config") return Response.json({
    urls:Object.entries(groups).map(([group,name])=>({name,url:`/api-docs/spec/${group}/`})),
    "urls.primaryName":groups.public, validatorUrl:null, persistAuthorization:false,
    supportedSubmitMethods:["get"], tryItOutEnabled:false, tagsSorter:"alpha", operationsSorter:"alpha",
  },{headers});
  if(parts.length===2 && parts[0]==="spec" && Object.hasOwn(groups,parts[1])) {
    const res=await upstream("/v3/api-docs/"+parts[1],"",fetcher);
    if(!res.ok)return error(502);
    try {
      const spec=await res.json();
      spec.servers=[{url:"/api-docs/proxy",description:"공개 조회 GET 전용. 회원·투표·AI 실행은 기존 앱/BFF를 사용합니다."}];
      spec.info.description=(spec.info.description||"")+"\n운영 Swagger는 공개 조회 GET만 실행합니다. 내부 API는 문서 열람용이며 서비스 비밀값을 브라우저에 넣지 않습니다. 로컬 Spring Swagger에서는 별도 개발 환경의 인증 정책을 따릅니다.";
      return Response.json(spec,{headers});
    }catch{return error(502);}
  }
  if(parts[0]==="proxy") {
    const path="/"+parts.slice(1).join("/");
    if(!publicQueryPath(path))return error(404);
    const res=await upstream(path,query,fetcher);
    if(!res.ok)return error(res.status>=500?502:res.status);
    return new Response(await res.text(),{status:res.status,headers:{...headers,"Content-Type":"application/json; charset=utf-8"}});
  }
  return error(404);
}
