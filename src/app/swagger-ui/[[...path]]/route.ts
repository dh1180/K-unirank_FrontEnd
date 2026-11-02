import { swaggerAsset } from "@/lib/swagger-proxy.mjs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,context:{params:Promise<{path?:string[]}>}) {
  return swaggerAsset((await context.params).path);
}
