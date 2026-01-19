export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio: string;
  experience: string;
  specialty?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Marcus Johnson",
    role: "Founder & Lead Coordinator",
    image: "/team/marcus.jpg",
    bio: "Started Handledly with a single truck and a vision for stress-free moving in Denver.",
    experience: "15+ years",
    specialty: "Operations & Customer Experience",
  },
  {
    name: "Sarah Mitchell",
    role: "Operations Manager",
    image: "/team/sarah.jpg",
    bio: "Ensures every move runs like clockwork with her exceptional organizational skills.",
    experience: "8+ years",
    specialty: "Logistics & Scheduling",
  },
  {
    name: "David Chen",
    role: "Lead Moving Specialist",
    image: "/team/david.jpg",
    bio: "Our go-to expert for pianos, antiques, and delicate specialty items.",
    experience: "10+ years",
    specialty: "Piano & Specialty Items",
  },
  {
    name: "Mike Torres",
    role: "Senior Crew Lead",
    image: "/team/mike.jpg",
    bio: "Known for his attention to detail and making customers feel at ease.",
    experience: "7+ years",
    specialty: "Residential Moves",
  },
  {
    name: "Jennifer Adams",
    role: "Customer Success Manager",
    image: "/team/jennifer.jpg",
    bio: "Your first point of contact, dedicated to making your experience exceptional.",
    experience: "5+ years",
    specialty: "Client Relations",
  },
  {
    name: "Carlos Rivera",
    role: "Commercial Moving Lead",
    image: "/team/carlos.jpg",
    bio: "Specializes in office relocations and commercial projects across Denver.",
    experience: "9+ years",
    specialty: "Commercial & Office Moves",
  },
];

// Compact version for homepage preview
export const featuredTeamMembers = teamMembers.slice(0, 4);
