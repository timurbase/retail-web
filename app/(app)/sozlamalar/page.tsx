import { SozlamalarView } from "@/components/sozlamalar/sozlamalar-view";
import { getUsers } from "@/lib/store";

export default function SozlamalarPage() {
  const users = getUsers();
  return <SozlamalarView users={users} />;
}
