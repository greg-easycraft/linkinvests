J'ai compris. En plus des spécifications fonctionnelles des fonctionnalités de sourcing, nous allons définir les spécifications générales de la plateforme, incluant les profils utilisateurs et le processus d'authentification.

Voici les spécifications générales de la plateforme :

-----

# Spécifications Générales de la Plateforme

## 1\. Architecture et Affichage des Données

  * **Couverture Géographique :** L'intégralité des données collectées (Décès/Successions, Liquidations, Enchères, Annonces) doit couvrir le **territoire français métropolitain**.
  * **Affichage Principal :** L'interface utilisateur principale est une **application cartographique** (carte interactive) affichant les points d'opportunités identifiés et géolocalisés.
  * **Performance :** Étant donné le volume de données attendu (centaines de milliers de données), le *back-end* et l'affichage cartographique doivent être optimisés pour la rapidité des requêtes et la gestion des gros jeux de données (via indexation, requêtes SQL pures si nécessaire, ou ORM optimisé comme Drizzle/Prisma).

## 2\. Gestion des Utilisateurs et Rôles

La plateforme doit gérer deux types d'utilisateurs avec des droits distincts :

| Rôle | Description | Droits et Fonctionnalités Clés |
| :--- | :--- | :--- |
| **ADMIN** | Administrateur et gestionnaire de la plateforme. | **Gestion des Utilisateurs :** Créer, modifier, désactiver et inviter de nouveaux comptes `USER`. <br> **Gestion des Données :** Superviser les processus d'ingestion et de synchronisation des données. |
| **USER** | Utilisateur final de la plateforme (Marchand de Biens ou Affilié). | **Accès aux Fonctionnalités :** Visualiser la carte, appliquer les filtres, utiliser les outils de sélection (panier) et de contact (envoi de mails aux mairies). |

## 3\. Authentification et Accès

L'accès à la plateforme est **privé** et nécessite une authentification. La gestion des comptes est centralisée par l'administrateur.

### 3.1. Mécanisme d'Invitation

1.  **Création du Compte (ADMIN) :** L'administrateur crée un nouveau compte `USER` et saisit l'adresse e-mail de l'utilisateur.
2.  **Invitation :** L'administrateur déclenche l'envoi d'un e-mail d'invitation à l'adresse fournie.
3.  **Activation/Première Connexion (USER) :** L'utilisateur reçoit l'e-mail d'invitation et peut cliquer sur un lien pour activer son compte et choisir son mode d'authentification ou se connecter pour la première fois.
4.  **Accès :** Seuls les utilisateurs invités et dont le compte a été activé peuvent se connecter.

### 3.2. Modes d'Authentification

La plateforme doit proposer des options de connexion simplifiées pour les utilisateurs (après l'étape d'invitation) :

  * **Option 1 : Google (SSO)**

      * Permettre la connexion via le compte Google de l'utilisateur.
      * Nécessite une vérification que l'adresse e-mail du compte Google corresponde à l'adresse e-mail invitée par l'administrateur.

  * **Option 2 : Magic Link (Lien Magique)**

      * L'utilisateur saisit son adresse e-mail sur la page de connexion.
      * Un e-mail contenant un lien de connexion temporaire (Magic Link) est envoyé.
      * L'utilisateur clique sur le lien pour se connecter sans mot de passe.
      * Ce mode nécessite également que l'adresse e-mail soit enregistrée et activée par l'administrateur.

### 3.3. Accès Sécurisé

  * Toutes les données de sourcing et les fonctionnalités de la plateforme doivent être **situées derrière un mur d'authentification** (`login-gated`). Le contenu n'est pas accessible aux utilisateurs non connectés, ce qui élimine le besoin de SEO/référencement pour le contenu principal.