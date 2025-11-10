import { redirect } from "next/navigation";


// Redirect /dashboard to /dashboard/auctions as the default view
export default function DashboardPage(): React.ReactElement {
 return redirect("/dashboard/auctions");
}
