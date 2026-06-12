interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[] | null;
}

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((item) => (
        <script
          key={JSON.stringify(item).slice(0, 80)}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
