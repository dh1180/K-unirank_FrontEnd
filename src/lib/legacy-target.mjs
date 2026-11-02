export function legacyTarget(path){
 if(path==="/accounts/signup/")return "/register/";
 if(path==="/accounts/me/vs-history/")return "/mypage/history/";
 if(path==="/accounts/me/university-compare/")return "/mypage/compare/";
 if(path==="/admissions/results/")return "/";
 if(path.startsWith("/admin/"))return "/admin/";
 return null;
}

export function legacyOrigin(host,protocol="https:"){
 const normalized=(host||"").toLowerCase();
 if(["k-unirank.com","www.k-unirank.com","frontend-production-86dd.up.railway.app"].includes(normalized))return `https://${normalized}`;
 if(/^(localhost|127\.0\.0\.1)(:[0-9]{1,5})?$/.test(normalized))return `${protocol==="http:"?"http:":"https:"}//${normalized}`;
 return "https://k-unirank.com";
}
