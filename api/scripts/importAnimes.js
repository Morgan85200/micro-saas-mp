import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GRAPHQL_URL = "https://graphql.anilist.co";
const BACKEND_ANIME_URL = "http://localhost:8080/api/animes";
const BACKEND_GENRE_URL = "http://localhost:8080/api/genres";

// CLI args
const args = process.argv.slice(2);
const startArg = args.find((a) => a.startsWith("--start="));
const limitArg = args.find((a) => a.startsWith("--limit="));
const START_PAGE = startArg ? parseInt(startArg.split("=")[1]) : 1;
const PAGE_LIMIT = limitArg ? parseInt(limitArg.split("=")[1]) : 10; // default = 10 pages (500 anime)

// GraphQL query
const query = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, status: FINISHED, isAdult: false, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
      }
      genres
      startDate {
        year
        month
        day
      }
      popularity
    }
  }
}
`;

async function fetchAnimesFromAniList(page) {
  const variables = { page, perPage: 50 };

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();
  return json.data.Page.media;
}

// Cache to avoid duplicate genre creations
const genreCache = new Map();

async function getOrCreateGenre(name) {
  if (genreCache.has(name)) return genreCache.get(name);

  // Check if genre already exists
  const existingRes = await fetch(`${BACKEND_GENRE_URL}`);
  const existingGenres = await existingRes.json();
  const found = existingGenres.find((g) => g.name.toLowerCase() === name.toLowerCase());
  if (found) {
    genreCache.set(name, found.id);
    return found.id;
  }

  // Create it if not found
  const createRes = await fetch(`${BACKEND_GENRE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const created = await createRes.json();
  const genreId = created.id;
  genreCache.set(name, genreId);
  console.log(`Created new genre: ${name}`);
  return genreId;
}

async function saveAnimeToLocalDB(anime) {
  // Format date
  const releaseDate = anime.startDate?.year
    ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, "0")}-${String(anime.startDate.day || 1).padStart(2, "0")}`
    : null;

  // Map genre names → IDs
  const genreIds = [];
  for (const g of anime.genres || []) {
    const id = await getOrCreateGenre(g);
    if (id) genreIds.push(id);
  }

  const payload = {
    titleJapanese: anime.title.romaji,
    titleEnglish: anime.title.english,
    releaseDate,
    genreIds,
  };

  await fetch(BACKEND_ANIME_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function main() {
  console.log(`Starting import from page ${START_PAGE} to ${START_PAGE + PAGE_LIMIT - 1}...`);

  for (let page = START_PAGE; page < START_PAGE + PAGE_LIMIT; page++) {
    console.log(`Fetching page ${page}...`);
    const animes = await fetchAnimesFromAniList(page);

    for (const anime of animes) {
      try {
        await saveAnimeToLocalDB(anime);
        console.log(`Saved: ${anime.title.romaji}`);
      } catch (err) {
        console.error(`Failed to save ${anime.title.romaji}:`, err);
      }
    }
  }

  console.log("🎉 Import completed!");
}

main().catch(console.error);
