<?php
namespace App\Controller;

use App\Entity\TestItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TestController
{
    #[Route('/api/test/create', methods: ['GET', 'POST'])]
    public function create(EntityManagerInterface $em): JsonResponse
    {
        $item = new TestItem();
        $item->setName('Hello Database 2!');
        $em->persist($item);
        $em->flush();

        return new JsonResponse([
            'status' => 'created',
            'id' => $item->getId(),
            'name' => $item->getName(),
        ]);
    }

    #[Route('/api/test/list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $items = $em->getRepository(TestItem::class)->findAll();
        $data = array_map(fn($i) => ['id' => $i->getId(), 'name' => $i->getName()], $items);

        return new JsonResponse($data);
    }
}
