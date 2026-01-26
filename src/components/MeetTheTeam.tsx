import { Container, Section, SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { teamMembers, featuredTeamMembers } from "@/data/teamData";
import { ArrowRight, Users } from "lucide-react";

interface MeetTheTeamProps {
  variant?: "full" | "compact";
}

export function MeetTheTeam({ variant = "full" }: MeetTheTeamProps) {
  const members = variant === "compact" ? featuredTeamMembers : teamMembers;
  const isCompact = variant === "compact";

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-section pointer-events-none" />
      <Container className="relative z-10">
        <SectionHeader
          title={isCompact ? "Meet Our Team" : "The People Behind Your Move"}
          subtitle={
            isCompact
              ? "Real Denver locals who care about your move."
              : "Every member of our team is dedicated to making your moving experience exceptional. We're not just movers — we're your neighbors."
          }
        />

        {/* Team grid */}
        <div
          className={`grid gap-6 ${
            isCompact
              ? "grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {members.map((member, index) => (
            <TeamMemberCard
              key={member.name}
              member={member}
              index={index}
              compact={isCompact}
            />
          ))}
        </div>

        {/* CTA for compact version */}
        {isCompact && (
          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white shadow-depth-1"
            >
              <Link to="/about">
                <Users className="mr-2 w-4 h-4" />
                Meet the Full Team
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Hiring CTA for full version */}
        {!isCompact && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card shadow-depth-2">
              <span className="text-muted-foreground">
                Want to join us?
              </span>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                <Link to="/contact">
                  Get in Touch <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
