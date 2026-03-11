<?php

namespace App\Controller;

use App\Entity\Hint;
use App\Form\HintType;
use App\Repository\HintRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/hint')]
final class HintController extends AbstractController
{
    #[Route(name: 'app_hint_index', methods: ['GET'])]
    public function index(HintRepository $hintRepository): Response
    {
        return $this->render('hint/index.html.twig', [
            'hints' => $hintRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_hint_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $hint = new Hint();
        $form = $this->createForm(HintType::class, $hint);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($hint);
            $entityManager->flush();

            return $this->redirectToRoute('app_hint_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('hint/new.html.twig', [
            'hint' => $hint,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_hint_show', methods: ['GET'])]
    public function show(Hint $hint): Response
    {
        return $this->render('hint/show.html.twig', [
            'hint' => $hint,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_hint_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Hint $hint, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(HintType::class, $hint);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_hint_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('hint/edit.html.twig', [
            'hint' => $hint,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_hint_delete', methods: ['POST'])]
    public function delete(Request $request, Hint $hint, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$hint->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($hint);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_hint_index', [], Response::HTTP_SEE_OTHER);
    }
}
