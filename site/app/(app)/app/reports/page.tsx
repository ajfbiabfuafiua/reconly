import { requireActiveUser } from "@/lib/profile";
import { getReports } from "@/lib/data";
import { EmptyState } from "@/components/app/Bits";
import GenerateReportButton from "@/components/app/GenerateReport";
import { AskAssistButton } from "@/components/assist/AssistEntry";

const TYPE_LABEL: Record<string, string> = {
  monthly_close: "Monthly close",
  datev_export: "DATEV export",
  compliance_report: "Compliance report",
};

export default async function ReportsPage() {
  const { profile } = await requireActiveUser();
  const reports = await getReports(profile.clerk_user_id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-white">Reports</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Generated exports for your tax advisor and compliance team
          </p>
        </div>
        <GenerateReportButton />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          hint="Generate a monthly close, a DATEV export, or a compliance report — files are stored securely and can be re-downloaded anytime."
          action={<GenerateReportButton />}
        />
      ) : (
        <div className="glass light-seam divide-y divide-white/8 rounded-xl">
          {reports.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {TYPE_LABEL[r.type]} · {r.period}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  generated {r.created_at.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <AskAssistButton
                  prompt={`Summarize my ${TYPE_LABEL[r.type]} for ${r.period} so I can paste it into an email to my tax advisor.`}
                  context={{ label: `Report ${r.period}`, reportId: r.id }}
                >
                  Summarize for my tax advisor
                </AskAssistButton>
                <a
                  href={`/api/reports/${r.id}/download`}
                  className="btn-ghost border !border-white/20 !px-5 !py-2 text-xs"
                >
                  Download ↓
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs leading-relaxed text-[#6B7280]">
        Reports are generated from your reconciled sub-ledger and stored in EU-hosted storage.
        Software only — verify figures with your tax advisor.
      </p>
    </div>
  );
}
