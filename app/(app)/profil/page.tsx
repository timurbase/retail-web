import { getUser } from "@/lib/store";
import { ProfilView } from "@/components/profil/profil-view";
import { notFound } from "next/navigation";

export default function ProfilPage() {
  const user = getUser("user_aziz");
  if (!user) notFound();
  return <ProfilView user={user} />;
}
