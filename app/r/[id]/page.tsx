import { getPageById } from "../../../lib/store";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = getPageById(id);

  const answer = page?.answer;

  return (
    <main className="page">
      <section
        className="hero"
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          {answer === "yes" ? (
            <img
  src="/images/yes.png"
  alt="Yes"
  style={{
    width: "220px",
    maxWidth: "80vw",
    height: "auto",
    borderRadius: "20px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
  }}
/>

          ) : (
            <span
              style={{
                fontSize: "96px",
                lineHeight: 1,
              }}
            >
              {answer === "no" ? "😬💀" : "🤔"}
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
