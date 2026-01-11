import { Container } from "@/components/layout";

interface ServiceIntroProps {
  headline: string;
  highlightText: string;
  subheading: string;
  paragraphs: string[];
}

export function ServiceIntro({ headline, highlightText, subheading, paragraphs }: ServiceIntroProps) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="max-w-4xl">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
            {headline}{' '}
            <span className="relative inline-block">
              <span className="text-gradient-gold">{highlightText}</span>
              <svg 
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" 
                viewBox="0 0 200 12" 
                fill="none"
                preserveAspectRatio="none"
              >
                <path 
                  d="M2 10C50 4 150 4 198 10" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          
          <h2 className="font-serif text-2xl lg:text-3xl text-foreground mb-8">
            {subheading}
          </h2>
          
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
