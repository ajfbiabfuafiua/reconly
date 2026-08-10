import { RibbonLoader } from "@/components/ReconlyMark";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <RibbonLoader size={40} />
    </div>
  );
}
