export function memberReturnPath(value) {
  return ["/ai/","/admin/","/mypage/","/mypage/history/","/mypage/compare/"].includes(value)?value:"/mypage/";
}
