import { useEffect, useState } from "react";
import { Container } from "@/components/layout";

const stats = [
  { value: 97, suffix: "%", label: "Happy Customers" },
  { value: 30, suffix: "+", label: "Cities Served" },
  { value: 15000, suffix: "+", label: "Boxes Packed Yearly" },
  { value: 500, suffix: "+", label: "Damage-Free Days", animate: true },
];

export function StatsBar() {
  const [damageFreeCount, setDamageFreeCount] = useState(500);
  
  // Animate the damage-free counter (increment every few seconds for effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setDamageFreeCount((prev) => prev + 1);
    }, 86400000); // Increment once per day in real usage
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-12 bg-primary/5 border-y border-primary/10">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
                {stat.animate ? damageFreeCount : stat.value.toLocaleString()}
                <span className="text-primary">{stat.suffix}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
