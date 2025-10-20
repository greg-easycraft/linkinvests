Je reprends la transcription pour structurer les spécifications fonctionnelles selon les sections demandées.

***

# Spécifications Fonctionnelles de l'Application de Sourcing Immobilier

L'application vise à identifier et qualifier des opportunités immobilières "off-market" en agrégeant et croisant différentes sources de données à l'échelle nationale.

## 1. Décès

Cette section concerne la source initiale des données permettant d'identifier les successions potentielles.

* **Source de Données :** Fichiers CSV de l'**LINC** (Liste des décès).
* **Périmètre :** Données sur l'intégralité de la France.
* **Règle d'Ingestion :** Les données récupérées doivent être filtrées pour ne conserver que les décès de personnes de **plus de 50 ans**.
* **Périodes Filtrables :** Le système doit permettre d'appliquer des filtres basés sur des périodes glissantes de **3, 6, 8, 24 ou 36 mois**.
* **Traitement :** Chaque ligne de décès pertinente est utilisée pour **créer une "Succession Potentielle"** en base de données (voir section 2).
* **Données Associées :** À partir du code lieu du décès, le système doit récupérer :
    * Les **coordonnées géographiques** (via une API d'État, ex: `data.gouv` / `go.google`).
    * Les coordonnées de la **mairie** (via une API d'État), notamment l'adresse e-mail.

## 2. Successions

Cette section est le cœur de la prospection par décès, impliquant la qualification et la confirmation des opportunités.

* **Objectif :** Identifier les **successions probables** et les qualifier.
* **Création :** Une `Succession Potentielle` est créée suite à l'ingestion d'un décès (point 1). Elle possède un **statut spécifique** (ex : "probable", "pas confirmée").
* **Qualification (DVF) :**
    * **Source :** Historique des transactions de biens (**DVF** - Demandes de Valeur Foncière).
    * **Croisement :** Croiser les informations de la succession avec le DVF (nom, prénom, adresse du défunt/propriétaire) pour savoir si une transaction a déjà eu lieu.
    * **Action :** Si le croisement avec DVF révèle une transaction (vente du bien à un tiers, signalant une **succession confirmée** et terminée), la succession probable doit être **retirée** de la liste des opportunités (car le bien ne peut plus être racheté au rabais).
* **Processus Utilisateur (Panier) :**
    * L'utilisateur doit pouvoir **sélectionner** (créer un "panier" ou une sélection) plusieurs points de successions sur la carte.
    * L'application doit permettre d'**envoyer un mail groupé** aux mairies associées à la sélection pour demander l'**acte de décès officiel**.
    * **But :** Obtenir le nom, prénom et l'adresse du propriétaire pour pouvoir contacter les héritiers (l'acte de décès officiel permet de confirmer les données et de savoir si le défunt était propriétaire).

## 3. Liquidations Professionnelles

Cette section concerne l'identification des opportunités liées aux actifs d'entreprises en difficulté.

* **Source d'Entreprise :** API de l'**INPI** (ou équivalent) pour obtenir la liste des entreprises en liquidation.
* **Source d'Actifs :** API et bases de données gouvernementales (ex: **Cadastre**, **Géoportail**) pour la localisation des établissements.
* **Processus :**
    1.  Récupérer les entreprises en liquidation.
    2.  Pour chaque entreprise, récupérer les établissements (biens immobiliers) qui lui appartiennent (via le SIREN/SIRET).
* **Affichage :** Les **établissements** appartenant à des entreprises en liquidation doivent être affichés sur la carte.

***

## 4. Dettes

* **Statut :** La collecte de données concernant les dettes de particuliers est considérée comme **hors périmètre** pour le développement initial.

***

## 5. Enchères

Cette section concerne l'affichage des biens immobiliers mis en vente aux enchères.

* **Source :** Plateforme nationale de vente aux enchères publiques (via API si disponible ou *scrapping* ciblé).
* **Règles :** Le système doit **filtrer** les données pour n'afficher que les enchères de nature **immobilière**.
* **Affichage :** Les biens en vente aux enchères sont affichés sur la carte.

***

## 6. Divorces

* **Statut :** La collecte de données concernant les divorces est considérée comme **hors périmètre** pour le développement initial.

***

## 7. Passoires Thermiques

Cette section concerne la qualification des biens via leur Diagnostic de Performance Énergétique (DPE).

* **Source :** Base de données nationale des DPE de l'**ADEM** (Open Data).
* **Objectif :** Afficher et utiliser les données de DPE pour identifier les **passoires thermiques** (biens classés F ou G).
* **Croisement :** Ces données sont essentielles pour le croisement avec les annonces immobilières afin d'estimer l'adresse exacte du bien (voir section 8).
* **Affichage :** Les passoires thermiques identifiées sont affichées sur la carte comme des opportunités d'achat à rénover.

## 8. Annonces Immo

Cette section concerne l'identification des biens en vente sur le marché classique pour potentiellement les requalifier.

* **Source :** Sites d'annonces immobilières (principalement **Le Bon Coin**, potentiellement *Se Loger*).
* **Méthode :** *Scrapping* des données d'annonces.
* **Portée :** **Clarification nécessaire** : Le système doit-il récupérer **toutes les annonces** et appliquer un filtre, ou seulement les annonces jugées prioritaires (ex: celles classées comme passoires thermiques) ?
* **Qualification/Croisement :** L'application doit recouper les annonces avec la base **ADEM/DPE** (point 7) en utilisant la localisation approximative, la surface et le DPE déclaré (si disponible).
* **Résultat :** Ce croisement permet de déduire et d'afficher une **adresse plus précise** que celle fournie par l'annonce.
* **Indice de Confiance :** Un **indice de confiance** doit être calculé et affiché pour indiquer la probabilité que l'adresse estimée par le croisement soit la bonne.

***

## Résumé du Périmètre

L'application se concentre sur l'agrégation et la cartographie des données de **Décès/Successions**, **Liquidations Professionnelles**, **Enchères** et **Annonces/Passoires Thermiques**, en excluant initialement les Dettes et les Divorces. Le livrable de la V1 est d'abord axé sur la partie **sourcing opérationnel** et la **préparation au contact des mairies**.