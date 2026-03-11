<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260302153717 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE quiz ADD quiz_image VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY `FK_6D7B9D74853CD175`');
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY `FK_6D7B9D74A76ED395`');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT FK_AB6AFC6A76ED395 FOREIGN KEY (user_id) REFERENCES app_user (id)');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT FK_AB6AFC6853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id)');
        $this->addSql('ALTER TABLE quiz_attempt RENAME INDEX idx_6d7b9d74a76ed395 TO IDX_AB6AFC6A76ED395');
        $this->addSql('ALTER TABLE quiz_attempt RENAME INDEX idx_6d7b9d74853cd175 TO IDX_AB6AFC6853CD175');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE quiz DROP quiz_image');
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY FK_AB6AFC6A76ED395');
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY FK_AB6AFC6853CD175');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT `FK_6D7B9D74853CD175` FOREIGN KEY (quiz_id) REFERENCES quiz (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT `FK_6D7B9D74A76ED395` FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE quiz_attempt RENAME INDEX idx_ab6afc6853cd175 TO IDX_6D7B9D74853CD175');
        $this->addSql('ALTER TABLE quiz_attempt RENAME INDEX idx_ab6afc6a76ed395 TO IDX_6D7B9D74A76ED395');
    }
}
