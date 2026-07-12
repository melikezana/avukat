type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 inline-flex border-l-2 border-accent-1 pl-3 text-sm font-semibold text-accent-1">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl font-bold leading-tight text-primary md:text-5xl">{title}</h2>
      {description ? <p className="mt-5 leading-8 text-muted">{description}</p> : null}
    </div>
  );
}
