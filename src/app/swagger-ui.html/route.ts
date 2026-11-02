export function GET() {
  return new Response(null,{status:307,headers:{Location:"/swagger-ui/index.html","X-Robots-Tag":"noindex, nofollow"}});
}
