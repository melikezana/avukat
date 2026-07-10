type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-sm font-semibold text-gold-600">{eyebrow}</p>
      <h2 className="font-serif text-4xl font-bold leading-tight text-navy-900 md:text-5xl">{title}</h2>
      {description ? <p className="mt-5 leading-8 text-ink/72">{description}</p> : null}
    </div>
  );
}
