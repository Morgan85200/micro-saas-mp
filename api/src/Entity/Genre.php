<?php

namespace App\Entity;

use App\Repository\GenreRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GenreRepository::class)]
class Genre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $name = null;

    /**
     * @var Collection<int, anime>
     */
    #[ORM\ManyToMany(targetEntity: anime::class, inversedBy: 'genres')]
    private Collection $anime;

    public function __construct()
    {
        $this->anime = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return Collection<int, anime>
     */
    public function getAnime(): Collection
    {
        return $this->anime;
    }

    public function addAnime(anime $anime): static
    {
        if (!$this->anime->contains($anime)) {
            $this->anime->add($anime);
        }

        return $this;
    }

    public function removeAnime(anime $anime): static
    {
        $this->anime->removeElement($anime);

        return $this;
    }
}
