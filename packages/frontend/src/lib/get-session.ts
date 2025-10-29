import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({
    headers: headersList,
  });
}
