Lundi 15
Samedi

Dimanche
- map bounds on search
- map should not move on item clicked
- [ ] recherche dans un rayon autour de moi ou d'un code postal

Lundi
- [ ] authentification (fermée)
- [ ] addresse mairie zipcode cedex
- [ ] deploy sur staging.linkinvests.com
- [ ] CI/CD

- [X] rename address fields into streetAddress & handle as such
- [X] succession, mémorisation si email envoyé (handle via status)
- [X] search UI refactor
    - filters as aside w/ backdrop, triggered by btn in header
    - map/list/cards from header
- [X] recherche sur plusieurs types d'opportunités
- [X] periode depuis, jusqu'à
- [X] sauvegarde recherches
- [X] auto scrape deceases
- [X] classe gaz sur DPEs (GES) pour affiner scoring
- [X] interface admin (gestion users)
- [X] favoris

TO TEST
 - class gaz 
    - dpe
    - auctions
    - listings
- addresses
    - dpe
    - listings
    - auctions
    - succesions
    - liquidations

- deceases scraping
- email invitation
- email magic link

BUGS
- saved search array in url


Later
- [ ] liquidations, handles status
- [ ] favoris (notes, addresse, statut)
- [ ] handle "viewed" status on opportunities
- [ ] statuts : courrier envoyé, relance 1, relance 2, contacter vendeur, visite prévue, visite ok, rejeté, offre ok, offre acceptée, offre refusée, contre-offre, 
- [ ] courrier avec La Poste (annonces, successions)
- [ ] créer corps du msg pour email mairie
- [ ] address refinment opti



https://linkinvests.easycraft.cloud/listings/62b24e4a-55b0-4513-bf46-c475b57f8928

LATER
- [ ] historique des encheres avec filtre réalisées (judiciaires uniquement) vs non réalisées
- [ ] extension Chrome








--------------------------------------------

BUG CAROLE 
3508c6d45-93f4447431aac32b.js:1 Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
    at ud (508c6d45-93f4447431aac32b.js:1:96626)
    at uf (508c6d45-93f4447431aac32b.js:1:96076)
    at ud (508c6d45-93f4447431aac32b.js:1:96927)
    at uf (508c6d45-93f4447431aac32b.js:1:96076)
    at ud (508c6d45-93f4447431aac32b.js:1:97012)
    at uf (508c6d45-93f4447431aac32b.js:1:96076)
    at ud (508c6d45-93f4447431aac32b.js:1:96514)
    at uf (508c6d45-93f4447431aac32b.js:1:96076)
    at ud (508c6d45-93f4447431aac32b.js:1:97012)
    at uf (508c6d45-93f4447431aac32b.js:1:96076)Understand this error


    - when clicking on type, type de biens, type de vendeur modif, deconnecter
    - when deconnecting


On map view mode, we should remove pagination and limit the requests to 500 items. if count is > 500, a disclaimer should be displayed

    We should now setup search within a radius around the user's location or a given zip code. There should be a new icon button in the header, dedicated to radius search. when clicked, a modal opens, allow the user to pick a radius and input a zip code or trigger geolocation.
    then, the radius should be applied to search filters