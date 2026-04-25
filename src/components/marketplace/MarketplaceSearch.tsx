import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceSearchProps {
  className?: string;
  variant?: "hero" | "compact";
}

export function MarketplaceSearch({ className, variant = "hero" }: MarketplaceSearchProps) {
  const navigate = useNavigate();
  const [originZip, setOriginZip] = useState("");
  const [destZip, setDestZip] = useState("");
  const [moveSize, setMoveSize] = useState("");
  const [moveDate, setMoveDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (originZip) params.set("from", originZip);
    if (destZip) params.set("to", destZip);
    if (moveSize) params.set("size", moveSize);
    if (moveDate) params.set("date", moveDate);
    // Routes to be built in next phase
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "w-full rounded-3xl bg-card border border-border shadow-depth-3 p-4 sm:p-6",
        className
      )}
      aria-label="Find moving companies"
    >
      <div className={cn(
        "grid gap-3",
        variant === "hero" ? "md:grid-cols-2 lg:grid-cols-5" : "md:grid-cols-5"
      )}>
        <div className="relative">
          <label htmlFor="from-zip" className="sr-only">Moving from (ZIP)</label>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            id="from-zip"
            placeholder="From ZIP"
            value={originZip}
            onChange={(e) => setOriginZip(e.target.value)}
            className="pl-9 h-12"
            inputMode="numeric"
            maxLength={5}
          />
        </div>

        <div className="relative">
          <label htmlFor="to-zip" className="sr-only">Moving to (ZIP)</label>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
          <Input
            id="to-zip"
            placeholder="To ZIP"
            value={destZip}
            onChange={(e) => setDestZip(e.target.value)}
            className="pl-9 h-12"
            inputMode="numeric"
            maxLength={5}
          />
        </div>

        <div className="relative">
          <label htmlFor="move-size" className="sr-only">Move size</label>
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" aria-hidden />
          <Select value={moveSize} onValueChange={setMoveSize}>
            <SelectTrigger id="move-size" className="pl-9 h-12">
              <SelectValue placeholder="Move size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="1br">1 Bedroom</SelectItem>
              <SelectItem value="2br">2 Bedrooms</SelectItem>
              <SelectItem value="3br">3 Bedrooms</SelectItem>
              <SelectItem value="4br+">4+ Bedrooms</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <label htmlFor="move-date" className="sr-only">Move date</label>
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" aria-hidden />
          <Input
            id="move-date"
            type="date"
            value={moveDate}
            onChange={(e) => setMoveDate(e.target.value)}
            className="pl-9 h-12"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 gradient-gold text-white shadow-gold hover:opacity-90"
        >
          <Search className="w-4 h-4 mr-2" />
          Compare Movers
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Free quotes from verified moving companies. No spam, no calls until you choose.
      </p>
    </form>
  );
}