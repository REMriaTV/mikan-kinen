import { redirect } from "next/navigation";

/** 旧URL → ねむみ v2 へ */
export default function NemumiLegacyPage() {
  redirect("/nemumi-v2");
}
