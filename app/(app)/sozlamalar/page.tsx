import { SozlamalarView } from "@/components/sozlamalar/sozlamalar-view";
import { Alert } from "@/components/ui/alert";
import { users as usersApi, company as companyApi, ApiError } from "@/lib/api";
import type { CompanyInfo, User } from "@/lib/types";

const FALLBACK_COMPANY: CompanyInfo = {
  storeId: "",
  stir: "",
  stirVerified: false,
  name: "",
  activity: "",
  address: "",
  director: "",
  phone: "",
  email: "",
  website: "",
};

export default async function SozlamalarPage() {
  let users: User[] = [];
  let company: CompanyInfo = FALLBACK_COMPANY;
  let loadError: string | null = null;
  try {
    const [uRes, cRes] = await Promise.all([usersApi.list(), companyApi.get()]);
    users = uRes.results;
    company = cRes;
  } catch (e) {
    loadError = e instanceof ApiError ? e.message : "Noma'lum xato";
  }

  return (
    <>
      {loadError && (
        <div className="px-8 pt-4">
          <Alert variant="error">Yuklashda xatolik: {loadError}</Alert>
        </div>
      )}
      <SozlamalarView users={users} company={company} />
    </>
  );
}
