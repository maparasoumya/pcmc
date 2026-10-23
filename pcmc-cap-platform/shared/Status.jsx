export default function Status({
  loading,
  error,
  reload,
  empty,
  language = "en",
}) {
  if (loading)
    return (
      <p role="status">
        {language === "mr" ? "माहिती लोड होत आहे…" : "Loading…"}
      </p>
    );
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={reload}>
          {language === "mr" ? "पुन्हा प्रयत्न करा" : "Try again"}
        </button>
      </div>
    );
  if (empty)
    return (
      <p>
        {language === "mr"
          ? "सध्या प्रकाशित माहिती उपलब्ध नाही."
          : "No published information is available yet."}
      </p>
    );
  return null;
}
