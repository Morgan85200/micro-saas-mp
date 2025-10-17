<?php

namespace App\Entity;

use App\Repository\HintRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HintRepository::class)]
class Hint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'hints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?quiz $quiz = null;

    #[ORM\Column]
    private ?int $orderNumber = null;

    #[ORM\Column(length: 255)]
    private ?string $hintText = null;

    #[ORM\Column(length: 255)]
    private ?string $hintImage = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $hintType = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuiz(): ?quiz
    {
        return $this->quiz;
    }

    public function setQuiz(?quiz $quiz): static
    {
        $this->quiz = $quiz;

        return $this;
    }

    public function getOrderNumber(): ?int
    {
        return $this->orderNumber;
    }

    public function setOrderNumber(int $orderNumber): static
    {
        $this->orderNumber = $orderNumber;

        return $this;
    }

    public function getHintText(): ?string
    {
        return $this->hintText;
    }

    public function setHintText(string $hintText): static
    {
        $this->hintText = $hintText;

        return $this;
    }

    public function getHintImage(): ?string
    {
        return $this->hintImage;
    }

    public function setHintImage(string $hintImage): static
    {
        $this->hintImage = $hintImage;

        return $this;
    }

    public function getHintType(): ?string
    {
        return $this->hintType;
    }

    public function setHintType(?string $hintType): static
    {
        $this->hintType = $hintType;

        return $this;
    }
}
