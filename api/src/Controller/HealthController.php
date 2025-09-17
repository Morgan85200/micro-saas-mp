<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class HealthController
{
    #[Route('/api/health', name: 'api_health')]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        try {
            $em->getConnection()->executeQuery("SELECT 1");
            return new JsonResponse([
                "status" => "ok",
                "message" => "API connected to database!"
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                "status" => "error",
                "message" => "Database connection failed"
            ], 500);
        }
    }
}
