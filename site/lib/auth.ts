import type { User } from "@clerk/nextjs/server";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function primaryEmail(user: User): string {
  return (
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
}

export function isAdmin(user: User): boolean {
  return (
    adminEmails().includes(primaryEmail(user)) ||
    user.publicMetadata?.role === "admin"
  );
}

/** Admins are implicitly approved; everyone else needs the metadata flag. */
export function isApproved(user: User): boolean {
  return isAdmin(user) || user.publicMetadata?.approved === true;
}
