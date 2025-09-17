# Guide de Gestion de Projet Solo - "Scrum Solo"

Guide complet pour la gestion de projet individuelle avec GitHub Projects, Issues et Pull Requests, adapté aux apprenants en développement.

## 🎯 Philosophie : Scrum Solo

Adaptation des méthodologies Agile/Scrum pour un développeur unique, en gardant les bénéfices organisationnels sans la complexité collaborative.

### Rôles Unifiés
En tant qu'apprenant solo, vous cumulez :
- **Product Owner** : Définir les besoins et priorités
- **Scrum Master** : Organiser et structurer le travail
- **Developer** : Implémenter les fonctionnalités

## 🏗️ Structure du Projet GitHub

### 1. Configuration des Labels

**Type (préfixe type:) :**
- `✨ type: feature` - Nouvelles fonctionnalités
- `🐛 type: bug` - Corrections de bugs
- `🔧 type: enhancement` - Améliorations existantes
- `📚 type: documentation` - Documentation
- `🧹 type: chore` - Tâches de maintenance

**Statut (un seul par issue) :**
- `🚧 status: in-progress` - En cours
- `👀 status: needs-review` - Prêt pour révision
- `⏸️ status: blocked` - Bloqué
- `✅ status: completed` - Terminé

**Priorité (optionnel) :**
- `🔥 priority: high` - Critique pour le brief

### 2. Structure des Branches

**Branches Principales :**
- `main` : Code stable, prêt pour production
- `develop` : Branche de développement principal

**Branches de Features :**
- `feature/nom-de-la-feature` : Pour les nouvelles fonctionnalités
- `fix/nom-du-bug` : Pour les corrections de bugs
- `docs/nom-doc` : Pour la documentation
- `refactor/nom-refactor` : Pour le refactoring

**Exemple de nommage :**
```
feature/user-authentication
fix/login-validation-error
docs/api-endpoints
refactor/database-connection
```

## 📋 Méthodologie de Travail

### 1. Sprint Planning (Planification)

**À chaque nouveau brief :** Créer un nouveau sprint/milestone

**Processus :**
1. **Créer un Milestone** pour le brief dans GitHub
2. **Définir l'objectif** du brief (1-2 phrases)
3. **Découper le brief** en issues/tâches
4. **Estimer la charge** (story points ou heures)

### 2. Création d'Issues Détaillées

**Template d'Issue pour Feature :**
```markdown
# 🚀 [Titre de la fonctionnalité]

## 📝 Résumé
Description courte en 1-2 phrases de ce qu'on veut implémenter.

## 🎯 Objectif
Quel problème on résout ou quelle amélioration on apporte ?

## ✅ Critères d'Acceptation
- [ ] La fonctionnalité fait X
- [ ] L'utilisateur peut Y  
- [ ] Le système répond Z

## 🔧 Tâches Techniques
- [ ] Créer le modèle/schema
- [ ] Implémenter l'endpoint API
- [ ] Ajouter les tests
- [ ] Documenter l'usage

## 🧪 Comment Tester
1. Étape 1 pour tester
2. Étape 2 pour vérifier
3. Résultat attendu

## 🏷️ Labels Suggérés
`feature`, `api`, `database`...
```

**Exemple concret - Issue pour le Brief Hello-API :**
```markdown
# 🚀 Endpoint de health check de la base de données

## 📝 Résumé
Créer un endpoint API qui teste la connexion à la base de données et retourne le statut.

## 🎯 Objectif
Vérifier que l'infrastructure (API + Database) fonctionne correctement avant de développer les vraies fonctionnalités.

## ✅ Critères d'Acceptation
- [ ] L'endpoint `/health` répond en GET
- [ ] Il exécute une requête SQL simple (SELECT 1)
- [ ] Il retourne un JSON avec le statut de la DB
- [ ] Il gère les erreurs de connexion

## 🔧 Tâches Techniques
- [ ] Configurer la connexion à la base de données
- [ ] Créer l'endpoint `/health`
- [ ] Implémenter la requête de test SQL
- [ ] Ajouter la gestion d'erreur
- [ ] Tester avec Postman/curl

## 🧪 Comment Tester
1. Lancer `docker compose up`
2. Appeler `GET localhost:3000/health`
3. Vérifier la réponse JSON avec le statut
4. Arrêter la DB et vérifier l'erreur

## 🏷️ Labels Suggérés
`feature`, `api`, `database`, `health-check`
```

**Template d'Issue pour Bug :**
```markdown
## 🐛 Problème
Description claire du bug

## 🔄 Reproduction
1. Étape 1
2. Étape 2
3. Résultat observé

## ✅ Comportement Attendu
Ce qui devrait se passer

## 🌍 Environnement
- OS :
- Navigateur :
- Version :

## 📸 Captures d'écran
[Si applicable]
```

### 3. Conventions de Nommage

#### Nommage des Branches
**Format :** `type/description-kebab-case`

**Types de branches :**
- `feature/` : Nouvelles fonctionnalités
- `fix/` : Corrections de bugs
- `docs/` : Documentation
- `refactor/` : Refactoring
- `test/` : Ajout de tests
- `chore/` : Tâches de maintenance

**Exemples :**
```
feature/user-authentication
feature/database-connection-test
fix/login-validation-error
docs/api-documentation
refactor/clean-database-layer
test/integration-tests
chore/update-dependencies
```

#### Convention des Commits (Conventional Commits)
**Format :** `type(scope): description`

**Types principaux :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (pas de changement de code)
- `refactor` : Refactoring de code
- `test` : Ajout ou modification de tests
- `chore` : Maintenance, configuration

**Exemples :**
```
feat(auth): add user login endpoint
fix(database): resolve connection timeout issue
docs(api): update endpoint documentation
test(auth): add integration tests for login
chore(deps): update express to v4.18
refactor(utils): extract validation helpers
```

**Scope optionnel :**
- `auth` : authentification
- `api` : endpoints API
- `database` : base de données
- `config` : configuration
- `utils` : utilitaires

### 4. Workflow de Développement

**Étapes pour chaque Feature :**

1. **Créer l'Issue** avec les labels appropriés
2. **Créer la branche** selon la convention de nommage
3. **Développer par micro-commits** (commits atomiques)
4. **Tester localement**
5. **Créer la Pull Request**
6. **Auto-review** de votre code
7. **Merger** dans develop
8. **Fermer l'Issue**

**Exemple de workflow Git :**
```bash
# 1. Créer et basculer sur la nouvelle branche
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. Développer avec commits atomiques
git add .
git commit -m "feat(auth): add user model with validation"
git commit -m "feat(auth): implement login endpoint"
git commit -m "test(auth): add unit tests for user model"

# 3. Pousser et créer la PR
git push -u origin feature/user-authentication
# Créer la PR via GitHub UI

# 4. Après merge, nettoyer
git checkout develop
git pull origin develop
git branch -d feature/user-authentication
```

### 4. GitHub Projects - Configuration

**Colonnes Kanban recommandées :**
- `📋 Backlog` - Issues à traiter
- `🎯 Sprint Actuel` - Issues du sprint en cours
- `🚧 En Cours` - Actuellement en développement
- `👀 Review` - Prêt pour révision
- `✅ Terminé` - Complété ce sprint

**Vues Utiles :**
- **Vue Board** : Kanban pour le suivi quotidien
- **Vue Table** : Liste détaillée avec filtres
- **Vue Roadmap** : Timeline des milestones

## 🎯 Micro-Features : Découpage Intelligent

### Principe du Découpage

**Règle des 2-8 heures :** Chaque feature doit pouvoir être implémentée en 2-8h maximum.

**Exemple de découpage :**
```
❌ Mauvais : "Système d'authentification"
✅ Bon découpage :
  - Modèle utilisateur en base
  - API de création de compte
  - API de connexion
  - Middleware d'authentification
  - Interface de connexion
  - Interface d'inscription
  - Tests d'authentification
```

### Priorisation MoSCoW

- **Must Have** 🔴 : Fonctionnalités critiques
- **Should Have** 🟡 : Importantes mais pas critiques
- **Could Have** 🟢 : Souhaitables si le temps le permet
- **Won't Have** ⚪ : Exclues de ce sprint

## 📊 Suivi et Métriques

### Daily Solo Standup (5 min/jour)

**Questions à se poser :**
1. Qu'ai-je accompli hier ?
2. Que vais-je faire aujourd'hui ?
3. Quels obstacles m'empêchent d'avancer ?

### Métriques à Suivre

- **Vélocité** : Issues/story points complétés par sprint
- **Burndown** : Progression dans le sprint
- **Temps par type de tâche** : Développement vs. debugging vs. tests
- **Cycle time** : Temps de l'issue à la mise en production

## 🛠️ Outils et Templates

### GitHub Templates

**Template de Pull Request :**
```markdown
## 🎯 Objectif
Description de ce que fait cette PR

## 🔄 Changements
- Changement 1
- Changement 2

## ✅ Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Testé manuellement

## 📝 Notes de Review
Points spécifiques à vérifier lors de la review

## 🔗 Issue Liée
Closes #[numéro]
```

### Automatisations Recommandées

**GitHub Actions basiques :**
- Tests automatiques sur PR
- Linting automatique
- Déploiement automatique sur merge main

## 🎓 Conseils pour Apprenants

### Bonnes Pratiques

1. **Commencer petit** : Préférer 10 petites features à 1 énorme
2. **Documenter au fur et à mesure** : Éviter la dette technique
3. **Tester régulièrement** : Ne pas accumuler les bugs
4. **Réviser son propre code** : Développer l'œil critique
5. **Tenir un carnet de bord** : Noter les apprentissages

### Éviter les Pièges

- ❌ Issues trop vastes (> 8h de travail)
- ❌ Branches qui traînent trop longtemps
- ❌ Commits peu descriptifs
- ❌ Oublier de fermer les issues
- ❌ Ne pas utiliser les labels

### Progression Pédagogique

**Premier brief :** Configuration et première feature simple
**Briefs suivants :** Adoption du workflow complet
**Projets avancés :** Optimisation et métriques

## 🚀 Mise en Place Rapide

### Checklist de Démarrage

- [ ] Configurer les labels dans le repo
- [ ] Créer les templates d'issues et PR
- [ ] Configurer GitHub Projects avec les bonnes vues
- [ ] Créer le premier milestone
- [ ] Créer 3-5 premières issues bien détaillées
- [ ] Configurer les branches de protection
- [ ] Mettre en place les premières automations

### Premier Sprint Exemple

**Objectif :** "Mettre en place l'architecture de base de l'application"

**Issues :**
1. Configuration de l'environnement de développement
2. Structure de base du projet
3. Configuration de la base de données
4. Premier endpoint API
5. Tests de base et CI/CD

---

*Ce guide évolue avec votre expérience. N'hésitez pas à l'adapter selon vos besoins et apprentissages !*