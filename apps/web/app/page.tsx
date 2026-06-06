import { getSiteModel } from "@/lib/site/model";
import { HomeLanding } from "./_components/home-landing";

export default function Home() {
  return <HomeLanding model={getSiteModel()} />;
}
