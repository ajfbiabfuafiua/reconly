"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdmin(user)) throw new Error("Not authorized");
  return user;
}

export async function setApproval(userId: string, approved: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id && !approved) {
    throw new Error("You cannot revoke your own access");
  }
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { approved },
  });
  revalidatePath("/dashboard/admin");
}
