<?php

namespace App\Entity;

use App\Repository\QuizRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: QuizRepository::class)]
class Quiz
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'quizzes')]
    private ?anime $anime = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $quizDate = null;

    /**
     * @var Collection<int, Hint>
     */
    #[ORM\OneToMany(targetEntity: Hint::class, mappedBy: 'quiz')]
    private Collection $hints;

    public function __construct()
    {
        $this->hints = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAnime(): ?anime
    {
        return $this->anime;
    }

    public function setAnime(?anime $anime): static
    {
        $this->anime = $anime;

        return $this;
    }

    public function getQuizDate(): ?\DateTime
    {
        return $this->quizDate;
    }

    public function setQuizDate(?\DateTime $quizDate): static
    {
        $this->quizDate = $quizDate;

        return $this;
    }

    /**
     * @return Collection<int, Hint>
     */
    public function getHints(): Collection
    {
        return $this->hints;
    }

    public function addHint(Hint $hint): static
    {
        if (!$this->hints->contains($hint)) {
            $this->hints->add($hint);
            $hint->setQuiz($this);
        }

        return $this;
    }

    public function removeHint(Hint $hint): static
    {
        if ($this->hints->removeElement($hint)) {
            // set the owning side to null (unless already changed)
            if ($hint->getQuiz() === $this) {
                $hint->setQuiz(null);
            }
        }

        return $this;
    }
}
