import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Anime {
  id: number;
  titleJapanese: string;
}

type HintForm = {
  orderNumber: number;
  hintText: string;
  hintType: "text" | "image";
  hintImageFile?: File;
  hintImagePreview?: string;
};


function QuizCreatePage() {
  const [animeId, setAnimeId] = useState<number | null>(null);
  const [quizDate, setQuizDate] = useState("");
  const [quizType, setQuizType] = useState("anime");
  const [hints, setHints] = useState<HintForm[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/animes?limit=500")
      .then((res) => res.json())
      .then((json) => setAnimes(json.animes));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!animeId) return;
  
    const formData = new FormData();
  
    formData.append("animeId", animeId.toString());
    formData.append("quizDate", quizDate);
    formData.append("quizType", quizType);
  
    hints.forEach((hint, index) => {
      formData.append(`hints[${index}][orderNumber]`, hint.orderNumber.toString());
      formData.append(`hints[${index}][hintText]`, hint.hintText);
      formData.append(`hints[${index}][hintType]`, hint.hintType);
  
      if (hint.hintType === "image" && hint.hintImageFile) {
        formData.append(
          `hints[${index}][hintImage]`,
          hint.hintImageFile
        );
      }
    });
  
    await fetch("http://localhost:8080/api/quizzes", {
      method: "POST",
      body: formData, // 🚨 NO headers
    });
  
    navigate("/quizzes");
  };
  

  return (
    <div className="page-container">
      <h2>Create Quiz</h2>

      <form onSubmit={submit}>
        <select onChange={(e) => setAnimeId(Number(e.target.value))} required>
          <option value="">Select anime</option>
          {animes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.titleJapanese}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={quizDate}
          onChange={(e) => setQuizDate(e.target.value)}
          required
        />

        <select value={quizType} onChange={(e) => setQuizType(e.target.value)}>
          <option value="anime">Anime</option>
          <option value="manga">Manga</option>
        </select>

        <div className="margin-bottom-10">
          <button
            type="button"
            onClick={() =>
              setHints([
                ...hints,
                {
                  orderNumber: hints.length + 1,
                  hintText: "",
                  hintType: "text",
                },
              ])
            }
          >
            + Add hint
          </button>
        </div>


        {hints.map((hint, index) => (
          <div key={index} className="hint-block">
            <input
              type="number"
              min={1}
              value={hint.orderNumber}
              onChange={(e) => {
                const copy = [...hints];
                copy[index].orderNumber = Number(e.target.value);
                setHints(copy);
              }}
            />

            <select
              value={hint.hintType}
              onChange={(e) => {
                const copy = [...hints];
                copy[index].hintType = e.target.value as "text" | "image";
                setHints(copy);
              }}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>

            {/* ALWAYS visible */}
            <textarea
              value={hint.hintText}
              onChange={(e) => {
                const copy = [...hints];
                copy[index].hintText = e.target.value;
                setHints(copy);
              }}
              placeholder="Hint text"
            />

            {/* ONLY if image */}
            {hint.hintType === "image" && (
              <div className="hint-image-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const copy = [...hints];
                    copy[index].hintImageFile = file;
                    copy[index].hintImagePreview = URL.createObjectURL(file);
                    setHints(copy);
                  }}
                />

                {hint.hintImagePreview && (
                  <img
                    src={hint.hintImagePreview}
                    alt="Hint preview"
                    className="hint-image-preview"
                  />
                )}
              </div>
            )}
          </div>
        ))}

        <div>
          <button type="submit">Create Quiz</button>
        </div>
      </form>
    </div>
  );
}

export default QuizCreatePage;
