import { currentUser } from "@clerk/nextjs/server";
import { isApproved } from "@/lib/auth";
import { datevCsv, generateTxs } from "@/lib/ledger";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !isApproved(user)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const month = new URL(req.url).searchParams.get("month") ?? "";
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return new Response("Invalid month, expected yyyy-mm", { status: 400 });
  }

  const csv = datevCsv(generateTxs(), month);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reconly-datev-${month}.csv"`,
    },
  });
}
