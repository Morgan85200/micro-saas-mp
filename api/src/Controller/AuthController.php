<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        return new JsonResponse(['message' => 'Login handled by firewall'], 200);
    }

    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = isset($data['email']) ? trim($data['email']) : '';
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = (string) ($data['password'] ?? '');

        if (!$email || !$username || !$password) {
            return new JsonResponse(['error' => 'email, username and password are required'], 400);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'Email already in use'], 409);
        }

        if ($userRepository->findOneBy(['username' => $username])) {
            return new JsonResponse(['error' => 'Username already in use'], 409);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setUsername($username);
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($passwordHasher->hashPassword($user, $password));

        $em->persist($user);
        $em->flush();

        return new JsonResponse(['message' => 'User registered'], 201);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $attempts = $user->getQuizAttempts()->toArray();
        usort($attempts, fn($a, $b) => $b->getGuessedAt() <=> $a->getGuessedAt());

        $attemptData = array_map(function ($attempt) {
            $quiz = $attempt->getQuiz();
            $anime = $quiz?->getAnime();

            return [
                'id' => $attempt->getId(),
                'status' => $attempt->getStatus(),
                'hintsUsed' => $attempt->getHintsUsed(),
                'guessValue' => $attempt->getGuessValue(),
                'guessedAt' => $attempt->getGuessedAt()?->format(DATE_ATOM),
                'quiz' => [
                    'id' => $quiz?->getId(),
                    'quizDate' => $quiz?->getQuizDate()?->format('Y-m-d'),
                    'quizType' => $quiz?->getQuizType(),
                ],
                'answer' => [
                    'animeId' => $anime?->getId(),
                    'titleJapanese' => $anime?->getTitleJapanese(),
                    'titleEnglish' => $anime?->getTitleEnglish(),
                ],
            ];
        }, $attempts);

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles(),
            'avatarPath' => $user->getAvatarPath(),
            'attempts' => $attemptData,
        ]);
    }

    #[Route('/me/avatar', methods: ['POST'])]
    public function uploadAvatar(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        /** @var UploadedFile|null $file */
        $file = $request->files->get('avatar');
        if (!$file) {
            return new JsonResponse(['error' => 'avatar file is required'], 400);
        }

        $filename = uniqid('avatar_') . '_' . $file->getClientOriginalName();
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/avatar';
        $file->move($uploadDir, $filename);

        $user->setAvatarPath($filename);
        $em->flush();

        return new JsonResponse([
            'avatarPath' => $filename,
            'avatarUrl' => '/uploads/avatar/' . $filename,
        ]);
    }
}
