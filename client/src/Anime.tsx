import React, { useEffect, useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface Anime {
  id?: number;
  titleJapanese: string;
  titleEnglish?: string;
  releaseDate: string;
  genreIds: number[]; // used when creating/updating
  genres?: Genre[];   // returned by the API
}

export default function Anime() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [form, setForm] = useState<Anime>({
    titleJapanese: "",
    titleEnglish: "",
    releaseDate: "",
    genreIds: [],
  });

  const fetchAnimes = async () => {
    const res = await fetch("http://localhost:8080/api/animes");
    const data = await res.json();
    setAnimes(data);
  };

  const fetchGenres = async () => {
    const res = await fetch("http://localhost:8080/api/genres");
    const data = await res.json();
    setGenres(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:8080/api/animes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ titleJapanese: "", titleEnglish: "", releaseDate: "", genreIds: [] });
    fetchAnimes();
  };

  const deleteAnime = async (id: number) => {
    await fetch(`http://localhost:8080/api/animes/${id}`, { method: "DELETE" });
    fetchAnimes();
  };

  useEffect(() => {
    fetchAnimes();
    fetchGenres();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Animes</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          type="text"
          placeholder="Japanese Title"
          value={form.titleJapanese}
          onChange={(e) => setForm({ ...form, titleJapanese: e.target.value })}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="English Title (optional)"
          value={form.titleEnglish}
          onChange={(e) => setForm({ ...form, titleEnglish: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="date"
          value={form.releaseDate}
          onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
          className="border p-2 w-full"
          required
        />

        <select
          multiple
          value={form.genreIds.map(String)}
          onChange={(e) =>
            setForm({
              ...form,
              genreIds: Array.from(e.target.selectedOptions, (opt) => Number(opt.value)),
            })
          }
          className="border p-2 w-full h-32"
        >
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Add Anime
        </button>
      </form>

      <ul className="space-y-3">
        {animes.map((a) => (
          <li key={a.id} className="border p-3 rounded">
            <h2 className="font-semibold">{a.titleJapanese}</h2>
            {a.titleEnglish && <p>({a.titleEnglish})</p>}
            <p>Release: {a.releaseDate}</p>
            <p>
              Genres:{" "}
              {a.genres && a.genres.length > 0
                ? a.genres.map((g: any) => g.name).join(", ")
                : "—"}
            </p>
            <button
              onClick={() => a.id && deleteAnime(a.id)}
              className="text-red-500 mt-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
