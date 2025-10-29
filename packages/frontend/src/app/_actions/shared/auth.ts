"use server";

import { getSession } from "~/lib/get-session";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return session;
}

export async function getOptionalSession() {
  return await getSession();
}
