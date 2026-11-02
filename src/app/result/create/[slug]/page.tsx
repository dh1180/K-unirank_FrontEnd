import {notFound} from "next/navigation";import {PersonalResultButton} from "@/components/PersonalResultButton";
export default async function Create({params}:{params:Promise<{slug:string}>}){if((await params).slug!=="overall")notFound();return <section className="panel"><h1>나의 선호도 결과</h1><p>5번 이상 선택한 투표를 바탕으로 결과를 만듭니다.</p><PersonalResultButton/></section>;}
