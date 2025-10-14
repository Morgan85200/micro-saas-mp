import { useState } from "react";

function App() {
  const [result, setResult] = useState<string | null>(null);

  const testApi = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/health");
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Erreur de connexion à l'API");
    }
  };

  return (
    <div>
      <h1>Site Morgan Front-End (Vite + React + TS)</h1>
      <button onClick={testApi}>Tester la connexion API</button>
      <pre>{result}</pre>
    </div>
  );
}

export default App;
