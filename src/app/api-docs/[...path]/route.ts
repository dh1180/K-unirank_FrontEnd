import { swaggerDocument } from "@/lib/swagger-proxy.mjs";
export const dynamic="force-dynamic";
export async function GET(request:Request,context:{params:Promise<{path:string[]}>}) {
  return swaggerDocument((await context.params).path,new URL(request.url).search);
}
