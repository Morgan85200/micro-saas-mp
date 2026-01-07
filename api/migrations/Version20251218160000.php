<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251218160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add users and quiz attempts';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE app_user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, username VARCHAR(80) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, avatar_path VARCHAR(255) DEFAULT NULL, UNIQUE INDEX uniq_user_email (email), UNIQUE INDEX uniq_user_username (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE quiz_attempt (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, quiz_id INT NOT NULL, status VARCHAR(20) NOT NULL, hints_used INT NOT NULL, guess_value VARCHAR(255) DEFAULT NULL, guessed_at DATETIME NOT NULL, UNIQUE INDEX uniq_user_quiz (user_id, quiz_id), INDEX IDX_6D7B9D74A76ED395 (user_id), INDEX IDX_6D7B9D74853CD175 (quiz_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT FK_6D7B9D74A76ED395 FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE quiz_attempt ADD CONSTRAINT FK_6D7B9D74853CD175 FOREIGN KEY (quiz_id) REFERENCES quiz (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY FK_6D7B9D74A76ED395');
        $this->addSql('ALTER TABLE quiz_attempt DROP FOREIGN KEY FK_6D7B9D74853CD175');
        $this->addSql('DROP TABLE quiz_attempt');
        $this->addSql('DROP TABLE app_user');
    }
}
