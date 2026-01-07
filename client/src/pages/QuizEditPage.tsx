import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authHeaders } from "../auth/authHeaders";

type HintForm = {
  id?: number;
  orderNumber: number;
  hintText: string;
  hintType: "text" | "image";
  hintImage?: string;
  hintImageFile?: File;
  hintImagePreview?: string;
};

function QuizEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animeId, setAnimeId] = useState<number | null>(null);
  const [quizDate, setQuizDate] = useState("");
  const [quizType, setQuizType] = useState("anime");
  const [hints, setHints] = useState<HintForm[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`http://localhost:8080/api/quizzes/${id}`)
      .then((res) => res.json())
      .then((quiz) => {
        setAnimeId(quiz.anime.id);
        setQuizDate(quiz.quizDate);
        setQuizType(quiz.quizType);

        setHints(
          quiz.hints.map((h: any) => ({
            id: h.id,
            orderNumber: h.orderNumber,
            hintText: h.hintText,
            hintType: h.hintType,
            hintImage: h.hintImage,
            hintImagePreview: h.hintImage
              ? `http://localhost:8080/uploads/hints/${h.hintImage}`
              : undefined,
          }))
        );
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!animeId) return;

    const formData = new FormData();
    formData.append("animeId", animeId.toString());
    formData.append("quizDate", quizDate);
    formData.append("quizType", quizType);

    hints.forEach((hint, index) => {
      formData.append(`hints[${index}][orderNumber]`, hint.orderNumber.toString())
      formData.append(`hints[${index}][hintText]`, hint.hintText)
      formData.append(`hints[${index}][hintType]`, hint.hintType)
    
      if (hint.hintType === "image") {
        // If a new file was uploaded, send it
        if (hint.hintImageFile) {
          formData.append(`hints[${index}][hintImage]`, hint.hintImageFile)
        }
        // NEW: Send existing image filename to preserve it
        else if (hint.hintImage) {
          formData.append(`hints[${index}][existingImage]`, hint.hintImage)
        }
      }
    })

    formData.append("_method", "PUT");
    await fetch(`http://localhost:8080/api/quizzes/${id}`, {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });

    navigate("/quizzes");
  };

  return (
    <div className="page-container">
      <h2>Edit Quiz</h2>

      <form onSubmit={submit}>
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

        {hints.map((hint, index) => (
          <div key={index} className="hint-block">
            {/* Header */}
            <div className="hint-header">
              <strong>Hint #{index + 1}</strong>

              <button
                type="button"
                onClick={() => {
                  const copy = [...hints];
                  copy.splice(index, 1);
                  setHints(copy);
                }}
              >
                ❌ Remove
              </button>
            </div>

            <div className="form-group">
              <label>Order number</label>
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
            </div>

            <div className="form-group">
              <label>Hint type</label>
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
            </div>

            <div className="form-group">
              <label>Hint text</label>
              <textarea
                value={hint.hintText}
                onChange={(e) => {
                  const copy = [...hints];
                  copy[index].hintText = e.target.value;
                  setHints(copy);
                }}
                placeholder="Enter hint text..."
              />
            </div>

            {hint.hintType === "image" && (
              <div className="form-group">
                <label>Hint image</label>

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


        <div className="form-actions">
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

          <button type="submit">Save quiz</button>
        </div>
      </form>
    </div>
  );
}

export default QuizEditPage;
