import "server-only";
export async function adminServiceHealth() {
  const services=[{name:"입결 조회 API",url:process.env.API_INTERNAL_URL},{name:"회원 API",url:process.env.MEMBER_API_INTERNAL_URL},{name:"투표 API",url:process.env.VS_API_INTERNAL_URL}];
  return Promise.all(services.map(async({name,url})=>{
    if(!url)return {name,status:"UNCONFIGURED"};
    try {
      const response=await fetch(new URL("/actuator/health",url),{cache:"no-store",signal:AbortSignal.timeout(3000)});
      return {name,status:response.ok&&(await response.json()).status==="UP"?"UP":"DOWN"};
    }catch{return {name,status:"DOWN"};}
  }));
}
