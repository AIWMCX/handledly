import { Shield, CheckCircle } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-accent text-primary py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>NO HIDDEN FEES — JUST A FLAT HOURLY RATE</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Licensed & Insured</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Same-Day Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}