import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "../lib/admin-auth";
import AdminDashboard from "./admin-dashboard";

export default function AdminPage() {
  if (!isAdmin(cookies().toString())) redirect("/admin/login");
  return <AdminDashboard />;
}
