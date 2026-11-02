import {NextResponse} from "next/server";
// Retired route: never contact the former Django runtime.
export async function GET(){return new NextResponse(null,{status:404});}
export const HEAD=GET,POST=GET;
