import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "@/data/teamData";

interface TeamMemberCardProps {
  member: TeamMember;
  index?: number;
  compact?: boolean;
}

export function TeamMemberCard({ member, index = 0, compact = false }: TeamMemberCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Generate initials from name
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Generate a consistent gradient based on name
  const gradientColors = [
    "from-primary/80 to-primary/60",
    "from-accent/80 to-accent/60",
    "from-primary/70 to-accent/50",
    "from-accent/70 to-primary/50",
  ];
  const gradientClass = gradientColors[index % gradientColors.length];

  return (
    <div
      className={`group relative rounded-2xl glass-card shadow-depth-2 hover:shadow-depth-3 transition-all hover-lift animate-fade-in overflow-hidden ${
        compact ? "p-4" : "p-6"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Photo or Avatar */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`relative rounded-full overflow-hidden mb-4 ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all ${
            compact ? "w-20 h-20" : "w-28 h-28"
          }`}
        >
          {member.image && !imageError ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientClass}`}
            >
              <span
                className={`font-heading font-bold text-white ${
                  compact ? "text-xl" : "text-2xl"
                }`}
              >
                {initials}
              </span>
            </div>
          )}
          
          {/* Experience badge */}
          {!compact && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <Badge className="bg-accent text-white border-0 shadow-md text-xs px-2 py-0.5">
                {member.experience}
              </Badge>
            </div>
          )}
        </div>

        {/* Name & Role */}
        <h3
          className={`font-heading font-semibold text-primary ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {member.name}
        </h3>
        <p
          className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}
        >
          {member.role}
        </p>

        {/* Bio - only show in full version */}
        {!compact && (
          <>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {member.bio}
            </p>
            {member.specialty && (
              <div className="mt-3 pt-3 border-t border-border/50 w-full">
                <p className="text-xs text-accent font-medium">
                  Specialty: {member.specialty}
                </p>
              </div>
            )}
          </>
        )}

        {/* Compact experience badge */}
        {compact && (
          <p className="text-xs text-accent font-medium mt-1">
            {member.experience}
          </p>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </div>
  );
}
