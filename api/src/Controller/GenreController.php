<?php

namespace App\Controller;

use App\Entity\Genre;
use App\Repository\GenreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/genres')]
class GenreController
{
    #[Route('', methods: ['GET'])]
    public function index(Request $request, GenreRepository $repo): JsonResponse
    {
        $name = $request->query->get('name');

        if ($name) {
            $genres = $repo->findBy(['name' => $name]);
        } else {
            $genres = $repo->findAll();
        }

        $data = array_map(fn(Genre $g) => [
            'id' => $g->getId(),
            'name' => $g->getName(),
        ], $genres);

        return new JsonResponse($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id, GenreRepository $repo): JsonResponse
    {
        $genre = $repo->find($id);
        if (!$genre) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        return new JsonResponse([
            'id' => $genre->getId(),
            'name' => $genre->getName(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['name'])) {
            return new JsonResponse(['error' => 'Missing name'], 400);
        }

        $genre = new Genre();
        $genre->setName($data['name']);

        $em->persist($genre);
        $em->flush();

        return new JsonResponse(['message' => 'Genre created', 'id' => $genre->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em, GenreRepository $repo): JsonResponse
    {
        $genre = $repo->find($id);
        if (!$genre) return new JsonResponse(['error' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true);
        if (isset($data['name'])) {
            $genre->setName($data['name']);
        }

        $em->flush();

        return new JsonResponse(['message' => 'Genre updated']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, GenreRepository $repo): JsonResponse
    {
        $genre = $repo->find($id);
        if (!$genre) return new JsonResponse(['error' => 'Not found'], 404);

        $em->remove($genre);
        $em->flush();

        return new JsonResponse(['message' => 'Genre deleted']);
    }
}
