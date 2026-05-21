import { SozlamalarView } from "@/components/sozlamalar/sozlamalar-view";
import { getCompany, getUsers } from "@/lib/store";

export default function SozlamalarPage() {
  const users = getUsers();
  const company = getCompany();
  return <SozlamalarView users={users} company={company} />;
}
