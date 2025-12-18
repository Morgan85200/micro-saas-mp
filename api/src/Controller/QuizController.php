<?php

namespace App\Controller;

use App\Entity\Quiz;
use App\Entity\Hint;
use App\Repository\QuizRepository;
use App\Repository\AnimeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/quizzes')]
class QuizController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(Request $request, QuizRepository $repo): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', 20));
        $offset = ($page - 1) * $limit;

        $quizzes = $repo->findBy(
            [],
            ['quizDate' => 'DESC'],
            $limit,
            $offset
        );

        $total = $repo->count([]);

        $data = array_map(fn(Quiz $q) => [
            'id' => $q->getId(),
            'quizDate' => $q->getQuizDate()?->format('Y-m-d'),
            'quizType' => $q->getQuizType(),
            'anime' => [
                'id' => $q->getAnime()?->getId(),
                'titleJapanese' => $q->getAnime()?->getTitleJapanese(),
            ],
            'hintCount' => $q->getHints()->count(),
        ], $quizzes);

        return new JsonResponse([
            'quizzes' => $data,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit),
            'total' => $total,
        ]);
    }

    #[Route('/today', methods: ['GET'])]
    public function today(Request $request, QuizRepository $repo): JsonResponse
    {
        $type = $request->query->get('type');
        if (!$type) {
            return new JsonResponse(['error' => 'quizType is required'], 400);
        }

        $today = new \DateTime('today');

        $quiz = $repo->findOneBy([
            'quizDate' => $today,
            'quizType' => $type,
        ]);

        if (!$quiz) {
            return new JsonResponse(['error' => 'No quiz for today'], 404);
        }

        return $this->quizToJson($quiz);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id, QuizRepository $repo): JsonResponse
    {
        $quiz = $repo->find($id);
        if (!$quiz) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        return $this->quizToJson($quiz);
    }

    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        AnimeRepository $animeRepo
    ): JsonResponse {
        $data = $request->request->all();
        $files = $request->files->all();

        $anime = $animeRepo->find($data['animeId'] ?? null);
        if (!$anime) {
            return new JsonResponse(['error' => 'Invalid animeId'], 400);
        }

        $quiz = new Quiz();
        $quiz->setAnime($anime);
        $quiz->setQuizType($data['quizType'] ?? 'anime');
        $quiz->setQuizDate(new \DateTime($data['quizDate'] ?? 'today'));

        foreach ($data['hints'] ?? [] as $index => $h) {
            $hint = new Hint();
            $hint->setOrderNumber((int) $h['orderNumber']);
            $hint->setHintText($h['hintText']);
            $hint->setHintType($h['hintType'] ?? null);

            if (
                ($h['hintType'] ?? null) === 'image'
                && isset($files['hints'][$index]['hintImage'])
            ) {
                $file = $files['hints'][$index]['hintImage'];
                $filename = uniqid().'_'.$file->getClientOriginalName();

                $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/hints';

                $file->move($uploadDir, $filename);

                $hint->setHintImage($filename);
            }

            $quiz->addHint($hint);
        }

        $em->persist($quiz);
        $em->flush();

        return new JsonResponse(['message' => 'Quiz created'], 201);
    }

    #[Route('/{id}', methods: ['PUT', 'POST'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        QuizRepository $repo,
        AnimeRepository $animeRepo
    ): JsonResponse {
        
        $quiz = $repo->find($id);
        if (!$quiz) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        $data = $request->request->all();
        $files = $request->files->all();

        if (isset($data['animeId'])) {
            $anime = $animeRepo->find($data['animeId']);
            if ($anime) {
                $quiz->setAnime($anime);
            }
        }

        if (isset($data['quizDate'])) {
            $quiz->setQuizDate(new \DateTime($data['quizDate']));
        }

        if (isset($data['quizType'])) {
            $quiz->setQuizType($data['quizType']);
        }
        
        // 🔥 Properly delete old hints
        foreach ($quiz->getHints() as $oldHint) {
            $quiz->removeHint($oldHint);
            $em->remove($oldHint);
        }

        // Recreate hints from form
        foreach ($data['hints'] ?? [] as $index => $h) {
            $hint = new Hint();
            $hint->setOrderNumber((int) $h['orderNumber']);
            $hint->setHintText($h['hintText']);
            $hint->setHintType($h['hintType'] ?? null);

            if (($h['hintType'] ?? null) === 'image') {
                // Check if a new file was uploaded
                if (isset($files['hints'][$index]['hintImage'])) {
                    $file = $files['hints'][$index]['hintImage'];
                    $filename = uniqid().'_'.$file->getClientOriginalName();

                    $uploadDir = $this->getParameter('kernel.project_dir').'/public/uploads/hints';
                    $file->move($uploadDir, $filename);

                    $hint->setHintImage($filename);
                } elseif (isset($h['existingImage']) && !empty($h['existingImage'])) {
                    // Preserve the existing image filename
                    $hint->setHintImage($h['existingImage']);
                }
            }

            $quiz->addHint($hint);
        }

        $em->flush();

        return new JsonResponse(['message' => 'Quiz updated']);
    }


    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em, QuizRepository $repo): JsonResponse
    {
        $quiz = $repo->find($id);
        if (!$quiz) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        $em->remove($quiz);
        $em->flush();

        return new JsonResponse(['message' => 'Quiz deleted']);
    }

    private function quizToJson(Quiz $quiz): JsonResponse
    {
        $hints = $quiz->getHints()
            ->toArray();

        usort($hints, fn($a, $b) => $a->getOrderNumber() <=> $b->getOrderNumber());

        return new JsonResponse([
            'id' => $quiz->getId(),
            'quizDate' => $quiz->getQuizDate()?->format('Y-m-d'),
            'quizType' => $quiz->getQuizType(),
            'anime' => [
                'id' => $quiz->getAnime()?->getId(),
                'titleJapanese' => $quiz->getAnime()?->getTitleJapanese(),
            ],
            'hints' => array_map(fn(Hint $h) => [
                'id' => $h->getId(),
                'orderNumber' => $h->getOrderNumber(),
                'hintText' => $h->getHintText(),
                'hintImage' => $h->getHintImage(),
                'hintType' => $h->getHintType(),
            ], $hints),
        ]);
    }
}
