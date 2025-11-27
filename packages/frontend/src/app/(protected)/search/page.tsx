'use client'
import { redirect } from "next/navigation";


// Redirect /search to /search/auctions as the default view
export default function searchPage(): React.ReactElement {
 return redirect("/search/auctions");
}
