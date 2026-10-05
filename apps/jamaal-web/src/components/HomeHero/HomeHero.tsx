import { Button, Container, Hero } from "@fhdamd/threads";

export interface HomeHeroProps {
  ctaHref?: string;
  ctaLabel?: string;
}

/** Placeholder home hero. The full landing sections are built in #387. */
export default function HomeHero({
  ctaHref = "#join",
  ctaLabel = "Join the list",
}: Readonly<HomeHeroProps>) {
  return (
    <Container as="div">
      <Hero
        eyebrow="iPhone · iPad · Mac"
        heading="One list. Just today."
        subheading={<em>Beautifully ordered.</em>}
        body="A calm daily planner. One list for today, a short plan each evening, and nothing that nags."
        actions={
          <Button href={ctaHref} variant="solid-terra">
            {ctaLabel}
          </Button>
        }
      />
    </Container>
  );
}
