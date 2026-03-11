<?php

namespace App\Controller;

use App\Entity\Anime;
use App\Repository\AnimeRepository;
use App\Repository\GenreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/animes')]
class AnimeController
{
    #[Route('', methods: ['GET'])]
    public function index(Request $request, AnimeRepository $repo): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', 20));
        $offset = ($page - 1) * $limit;

        $animes = $repo->findBy([], null, $limit, $offset); // get slice
        $total = $repo->count([]);

        $data = array_map(fn(Anime $a) => [
            'id' => $a->getId(),
            'titleJapanese' => $a->getTitleJapanese(),
            'titleEnglish' => $a->getTitleEnglish(),
            'releaseDate' => $a->getReleaseDate()->format('Y-m-d'),
            'genres' => array_map(fn($g) => ['id' => $g->getId(), 'name' => $g->getName()], $a->getGenres()->toArray())
        ], $animes);

        return new JsonResponse([
            'animes' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, GenreRepository $genreRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $anime = new Anime();
        $anime->setTitleJapanese($data['titleJapanese'] ?? '');
        $anime->setTitleEnglish($data['titleEnglish'] ?? null);
        $anime->setReleaseDate(new \DateTime($data['releaseDate'] ?? 'now'));

        if (!empty($data['genreIds'])) {
            foreach ($data['genreIds'] as $genreId) {
                $genre = $genreRepo->find($genreId);
                if ($genre) {
                    $anime->addGenre($genre);
                }
            }
        }

        $em->persist($anime);
        $em->flush();

        return new JsonResponse(['message' => 'Anime created', 'id' => $anime->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em, AnimeRepository $repo, GenreRepository $genreRepo): JsonResponse
    {
        $anime = $repo->find($id);
        if (!$anime) return new JsonResponse(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        $anime->setTitleJapanese($data['titleJapanese'] ?? $anime->getTitleJapanese());
        $anime->setTitleEnglish($data['titleEnglish'] ?? $anime->getTitleEnglish());
        if (isset($data['releaseDate'])) {
            $anime->setReleaseDate(new \DateTime($data['releaseDate']));
        }

        // Reset and re-add genres if genreIds is provided
        if (isset($data['genreIds'])) {
            foreach ($anime->getGenres() as $g) {
                $anime->removeGenre($g);
            }
            foreach ($data['genreIds'] as $genreId) {
                $genre = $genreRepo->find($genreId);
                if ($genre) {
                    $anime->addGenre($genre);
                }
            }
        }

        $em->flush();
        return new JsonResponse(['message' => 'Anime updated']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, AnimeRepository $repo): JsonResponse
    {
        $anime = $repo->find($id);
        if (!$anime) return new JsonResponse(['error' => 'Not found'], 404);

        $em->remove($anime);
        $em->flush();
        return new JsonResponse(['message' => 'Anime deleted']);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id, AnimeRepository $repo): JsonResponse
    {
        $anime = $repo->find($id);
        if (!$anime) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        // Map to JSON
        return new JsonResponse([
            'id' => $anime->getId(),
            'titleJapanese' => $anime->getTitleJapanese(),
            'titleEnglish' => $anime->getTitleEnglish(),
            'releaseDate' => $anime->getReleaseDate()->format('Y-m-d'),
            'genreIds' => $anime->getGenres()->map(fn($g) => $g->getId())->toArray(),
        ]);
    }
}
