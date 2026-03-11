<?php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class HealthController
{
    #[Route('/api/health', name: 'api_health')]
    public function index(EntityManagerInterface $em, LoggerInterface $logger): JsonResponse
    {
        try {
            $em->getConnection()->executeQuery("SELECT 1");
            $logger->info("Database connection successful.");
            return new JsonResponse([
                "status" => "ok",
                "message" => "API connected to database!"
            ]);
        } catch (\Exception $e) {
            $logger->error("Database connection failed: " . $e->getMessage());
            return new JsonResponse([
                "status" => "error",
                "message" => "Database connection failed"
            ], 500);
        }
    }
}
