<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251015135158 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE anime (id INT AUTO_INCREMENT NOT NULL, title_japanese VARCHAR(255) NOT NULL, title_english VARCHAR(255) DEFAULT NULL, release_date DATE NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE genre (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE genre_anime (genre_id INT NOT NULL, anime_id INT NOT NULL, INDEX IDX_AE0246874296D31F (genre_id), INDEX IDX_AE024687794BBE89 (anime_id), PRIMARY KEY (genre_id, anime_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE hint (id INT AUTO_INCREMENT NOT NULL, order_number INT NOT NULL, hint_text VARCHAR(255) NOT NULL, hint_image VARCHAR(255) NOT NULL, hint_type VARCHAR(255) DEFAULT NULL, quiz_id INT NOT NULL, INDEX IDX_34C60353853CD175 (quiz_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE quiz (id INT AUTO_INCREMENT NOT NULL, quiz_date DATE DEFAULT NULL, anime_id INT DEFAULT NULL, INDEX IDX_A412FA92794BBE89 (anime_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE genre_anime ADD CONSTRAINT FK_AE0246874296D31F FOREIGN KEY (genre_id) REFERENCES genre (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE genre_anime ADD CONSTRAINT FK_AE024687794BBE89 FOREIGN KEY (anime_id) REFERENCES anime (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hint ADD CONSTRAINT FK_34C60353853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id)');
        $this->addSql('ALTER TABLE quiz ADD CONSTRAINT FK_A412FA92794BBE89 FOREIGN KEY (anime_id) REFERENCES anime (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE genre_anime DROP FOREIGN KEY FK_AE0246874296D31F');
        $this->addSql('ALTER TABLE genre_anime DROP FOREIGN KEY FK_AE024687794BBE89');
        $this->addSql('ALTER TABLE hint DROP FOREIGN KEY FK_34C60353853CD175');
        $this->addSql('ALTER TABLE quiz DROP FOREIGN KEY FK_A412FA92794BBE89');
        $this->addSql('DROP TABLE anime');
        $this->addSql('DROP TABLE genre');
        $this->addSql('DROP TABLE genre_anime');
        $this->addSql('DROP TABLE hint');
        $this->addSql('DROP TABLE quiz');
    }
}
