import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const GRAPHQL_URL = "https://graphql.anilist.co";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";
const BACKEND_ANIME_URL = `${API_BASE_URL}/animes`;
const BACKEND_GENRE_URL = `${API_BASE_URL}/genres`;
const BACKEND_LOGIN_URL = `${API_BASE_URL}/login`;
const BACKEND_ME_URL = `${API_BASE_URL}/me`;

let authToken = process.env.JWT_TOKEN || null;

// CLI args
const args = process.argv.slice(2);
const startArg = args.find((a) => a.startsWith("--start="));
const limitArg = args.find((a) => a.startsWith("--limit="));
const START_PAGE = startArg ? parseInt(startArg.split("=")[1]) : 1;
const PAGE_LIMIT = limitArg ? parseInt(limitArg.split("=")[1]) : 10; // 10 pages = 500 animes

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function ensureOk(response, context) {
  if (response.ok) return;

  const details = await parseJsonSafely(response);
  const message =
    typeof details === "string" ? details : JSON.stringify(details);

  throw new Error(`${context} failed (${response.status}): ${message}`);
}

async function getAuthToken() {
  if (authToken) return authToken;

  const email = process.env.ADMIN_EMAIL || process.env.AUTH_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.AUTH_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing authentication. Set JWT_TOKEN or ADMIN_EMAIL and ADMIN_PASSWORD in your environment."
    );
  }

  const response = await fetch(BACKEND_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  await ensureOk(response, "Login");

  const data = await parseJsonSafely(response);
  const token = data?.token;

  if (!token) {
    throw new Error("Login succeeded but no JWT token was returned.");
  }

  authToken = token;
  return authToken;
}

async function getAdminHeaders() {
  const token = await getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function ensureAdminUser() {
  const token = await getAuthToken();

  const response = await fetch(BACKEND_ME_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await ensureOk(response, "Fetching current user");

  const user = await parseJsonSafely(response);
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (!roles.includes("ROLE_ADMIN")) {
    throw new Error("Authenticated user is not an admin.");
  }

  console.log(`Authenticated as ${user.email} with admin access.`);
}

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

  await ensureOk(response, `AniList fetch for page ${page}`);
  const json = await response.json();
  return json.data.Page.media;
}

// Prevent duplicate genres
const genreCache = new Map();

async function getOrCreateGenre(name) {
  if (genreCache.has(name)) return genreCache.get(name);

  // Check if genre already exists
  const existingRes = await fetch(`${BACKEND_GENRE_URL}`);
  await ensureOk(existingRes, `Fetching genres before creating ${name}`);
  const existingGenres = await existingRes.json();
  const found = existingGenres.find((g) => g.name.toLowerCase() === name.toLowerCase());
  if (found) {
    genreCache.set(name, found.id);
    return found.id;
  }

  // Create it if not found
  const headers = await getAdminHeaders();
  const createRes = await fetch(`${BACKEND_GENRE_URL}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  await ensureOk(createRes, `Creating genre ${name}`);
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

  const headers = await getAdminHeaders();
  const response = await fetch(BACKEND_ANIME_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  await ensureOk(response, `Creating anime ${anime.title.romaji}`);
}

async function main() {
  await ensureAdminUser();
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
