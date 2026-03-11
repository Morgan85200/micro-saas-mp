import React, { useEffect, useState } from "react";
import { apiUrl } from "./config/api";

interface Genre {
  id?: number;
  name: string;
}

export default function Genre() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [name, setName] = useState("");

  const fetchGenres = async () => {
    const res = await fetch(apiUrl("/api/genres"));
    const data = await res.json();
    setGenres(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(apiUrl("/api/genres"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    fetchGenres();
  };

  const deleteGenre = async (id: number) => {
    await fetch(apiUrl(`/api/genres/${id}`), { method: "DELETE" });
    fetchGenres();
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Genres</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Genre name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 flex-grow"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {genres.map((genre) => (
          <li
            key={genre.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{genre.name}</span>
            <button
              onClick={() => genre.id && deleteGenre(genre.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
