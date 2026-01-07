<?php

namespace App\Entity;

use App\Repository\QuizAttemptRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: QuizAttemptRepository::class)]
#[ORM\Table(name: 'quiz_attempt')]
#[ORM\UniqueConstraint(name: 'uniq_user_quiz', columns: ['user_id', 'quiz_id'])]
class QuizAttempt
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'quizAttempts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Quiz $quiz = null;

    #[ORM\Column(length: 20)]
    private ?string $status = null;

    #[ORM\Column]
    private ?int $hintsUsed = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $guessValue = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $guessedAt = null;

    public function __construct()
    {
        $this->guessedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getQuiz(): ?Quiz
    {
        return $this->quiz;
    }

    public function setQuiz(?Quiz $quiz): static
    {
        $this->quiz = $quiz;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getHintsUsed(): ?int
    {
        return $this->hintsUsed;
    }

    public function setHintsUsed(int $hintsUsed): static
    {
        $this->hintsUsed = $hintsUsed;

        return $this;
    }

    public function getGuessValue(): ?string
    {
        return $this->guessValue;
    }

    public function setGuessValue(?string $guessValue): static
    {
        $this->guessValue = $guessValue;

        return $this;
    }

    public function getGuessedAt(): ?\DateTimeImmutable
    {
        return $this->guessedAt;
    }

    public function setGuessedAt(\DateTimeImmutable $guessedAt): static
    {
        $this->guessedAt = $guessedAt;

        return $this;
    }
}
