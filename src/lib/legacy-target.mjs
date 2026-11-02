export function legacyTarget(path){
 if(path==="/accounts/signup/")return "/register/";
 if(path==="/accounts/me/vs-history/")return "/mypage/history/";
 if(path==="/accounts/me/university-compare/")return "/mypage/compare/";
 if(path==="/admissions/results/")return "/";
 if(path.startsWith("/admin/"))return "/admin/";
 return null;
}
