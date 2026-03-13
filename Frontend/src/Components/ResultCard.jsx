export default function ResultCard({ result }) {
  if (!result) return null;

  let data;
  try {
    data = JSON.parse(result);
  } catch {
    return <pre>{result}</pre>;
  }

  return (
    <div className="result">
      <h2>Report Analysis</h2>

      <p><b>Patient:</b> {data.patient_name}</p>
      <p><b>Diagnosis:</b> {data.diagnosis}</p>
      <p><b>Risk:</b> {data.risk_level}</p>

      <h3>Abnormal Values</h3>
      <ul>
        {data.abnormal_values?.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>

      <p><b>Summary:</b> {data.summary}</p>
    </div>
  );
}
