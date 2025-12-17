<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251217133756 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE hint CHANGE hint_image hint_image VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE quiz ADD quiz_type VARCHAR(50) NOT NULL, CHANGE quiz_date quiz_date DATE NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE hint CHANGE hint_image hint_image VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE quiz DROP quiz_type, CHANGE quiz_date quiz_date DATE DEFAULT NULL');
    }
}
