the job message should contain a departmenId (int) and a sinceDate (dateString). using the api described below, fetch the company failures for the departmentId in question (use a map to convert departmentId to offical departnemnt name and fetch all data with parution dates higher or equal to sinceDate). fetch as csv and upload the file to S3. then trigger the SOURCE_COMPANY_BUILDINGS_QUEUE with the path to the uploaded csv.


API DESCRIPTION: 
Absolument \! L'API Opendatasoft permet d'extraire les données filtrées par date et au format **CSV** très facilement.

Voici comment procéder en une seule requête.

-----

## Requête API pour l'extraction CSV

Vous devez utiliser l'endpoint `/api/records/1.0/export/` et spécifier le format de sortie `format=csv`. Le filtrage par date se fait avec la clause `q=dateparution`.

### 1\. La Requête (URL GET)

Pour obtenir toutes les annonces de procédures collectives depuis une date précise (par exemple, le **1er janvier 2024**) au format CSV :

```url
https://bodacc-datadila.opendatasoft.com/api/records/1.0/export/?
dataset=annonces-commerciales&
q=familleavis:collective AND dateparution>=2024-01-01&
rows=-1&
format=csv&
fields=numerodepartement,departement_nom_officiel,familleavis_lib,typeavis_lib,dateparution,denomination,ville,cp
```

| Paramètre | Valeur | Description |
| :--- | :--- | :--- |
| `dataset` | `annonces-commerciales` | L'identifiant du jeu de données. |
| `q` | `familleavis:collective AND dateparution>=AAAA-MM-JJ` | **Le filtre combiné :**<br>1. Filtre sur les **procédures collectives** (`familleavis:collective`).<br>2. Filtre les annonces publiées **à partir de la date spécifiée** (`dateparution>=2024-01-01`). |
| `rows` | `-1` | Demande tous les enregistrements correspondants au filtre (aucune limite, ce qui est essentiel pour l'export). |
| `format` | `csv` | Spécifie le format de sortie du fichier (téléchargeable directement). |
| `fields` | (Liste des champs) | **Sélectionne les colonnes** que vous souhaitez inclure dans votre fichier CSV. J'ai inclus les plus pertinentes pour votre demande. |

### 2\. Conseils sur les champs (`fields`)

Dans l'exemple ci-dessus, j'ai sélectionné une liste de champs de base :

  * `numerodepartement`
  * `departement_nom_officiel`
  * `familleavis_lib` (Libellé : Procédures collectives)
  * `typeavis_lib` (Libellé : Avis initial, Jugement de clôture, etc.)
  * `dateparution`
  * `ville`
  * `cp` (Code Postal)
  * **⚠️ Attention :** Le nom de l'entreprise (`denomination`) et les détails du jugement (`jugement`) sont souvent **imbriqués dans des champs JSON** comme `listepersonnes` et `jugement`. Lors de l'export CSV, ces champs sont généralement exportés comme des **chaînes de caractères JSON brutes**, nécessitant un traitement après l'export (ex : par un script ou une feuille de calcul avancée) pour en extraire la dénomination et la nature du jugement.

Pour une extraction plus complète, vous pouvez ajouter tous les champs qui vous intéressent à la liste `fields` (séparés par des virgules).

**Exemple de filtre de date à utiliser dans `q` :**

  * **À partir d'une date :** `dateparution>=2024-01-01`
  * **Entre deux dates :** `dateparution:[2024-01-01 TO 2024-01-31]`
  * **Sur une seule date :** `dateparution:2024-01-01`



  Additional API info retrievable at : https://bodacc-datadila.opendatasoft.com/explore/dataset/annonces-commerciales/information/