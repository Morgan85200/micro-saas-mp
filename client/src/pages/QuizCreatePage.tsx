import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { apiUrl } from "../config/api";

interface Anime {
  id: number;
  titleJapanese: string;
  titleEnglish?: string | null;
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
  const [animeQuery, setAnimeQuery] = useState("");
  const [quizDate, setQuizDate] = useState("");
  const [quizType, setQuizType] = useState("anime");
  const [quizImageFile, setQuizImageFile] = useState<File | null>(null);
  const [quizImagePreview, setQuizImagePreview] = useState<string | null>(null);
  const [hints, setHints] = useState<HintForm[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetch(apiUrl("/api/animes?limit=500"))
      .then((res) => res.json())
      .then((json) => setAnimes(json.animes ?? []));
  }, []);

  const resolveAnimeId = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const match = animes.find((anime) => {
      const jp = anime.titleJapanese?.trim().toLowerCase() ?? "";
      const en = anime.titleEnglish?.trim().toLowerCase() ?? "";
      return normalized === jp || normalized === en;
    });
    setAnimeId(match?.id ?? null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!animeId) return;

    const formData = new FormData();

    formData.append("animeId", animeId.toString());
    formData.append("quizDate", quizDate);
    formData.append("quizType", quizType);
    if (quizImageFile) {
      formData.append("quizImage", quizImageFile);
    }

    hints.forEach((hint, index) => {
      formData.append(`hints[${index}][orderNumber]`, hint.orderNumber.toString());
      formData.append(`hints[${index}][hintText]`, hint.hintText);
      formData.append(`hints[${index}][hintType]`, hint.hintType);

      if (hint.hintType === "image" && hint.hintImageFile) {
        formData.append(`hints[${index}][hintImage]`, hint.hintImageFile);
      }
    });

    await fetch(apiUrl("/api/quizzes"), {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });

    navigate("/quizzes");
  };

  return (
    <div className="page-container">
      <h2>Creer un quizz</h2>

      <form onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="anime-query">Selectionner une oeuvre</label>
          <input
            id="anime-query"
            list="anime-options"
            type="text"
            placeholder="Ex: Dragon Ball"
            value={animeQuery}
            onChange={(e) => {
              const value = e.target.value;
              setAnimeQuery(value);
              resolveAnimeId(value);
            }}
            required
          />
          <datalist id="anime-options">
            {animes.map((anime) => (
              <option key={`${anime.id}-jp`} value={anime.titleJapanese} />
            ))}
            {animes
              .filter((anime) => anime.titleEnglish)
              .map((anime) => (
                <option key={`${anime.id}-en`} value={anime.titleEnglish || ""} />
              ))}
          </datalist>
        </div>

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

        <div className="form-group">
          <label>Image de couverture du quizz (fin de partie)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setQuizImageFile(file);
              setQuizImagePreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          {quizImagePreview && (
            <img src={quizImagePreview} alt="Quiz cover preview" className="hint-image-preview" />
          )}
        </div>

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
            + Ajouter un indice
          </button>
        </div>

        {hints.map((hint, index) => (
          <div key={index} className="hint-block">
            <div className="hint-header">
              <strong>Indice #{index + 1}</strong>

              <button
                type="button"
                onClick={() => {
                  const copy = [...hints];
                  copy.splice(index, 1);
                  setHints(copy);
                }}
              >
                Supprimer
              </button>
            </div>

            <div className="form-group">
              <label>Ordre</label>
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
              <label>Type d'indice</label>
              <select
                value={hint.hintType}
                onChange={(e) => {
                  const copy = [...hints];
                  copy[index].hintType = e.target.value as "text" | "image";
                  setHints(copy);
                }}
              >
                <option value="text">Texte</option>
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
                placeholder="Annee de publication : 2007"
              />
            </div>

            {hint.hintType === "image" && (
              <div className="form-group">
                <label>Image de l'indice</label>

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
                  <img src={hint.hintImagePreview} alt="Hint preview" className="hint-image-preview" />
                )}
              </div>
            )}
          </div>
        ))}

        <div>
          <button type="submit">Creer</button>
        </div>
      </form>
    </div>
  );
}

export default QuizCreatePage;
