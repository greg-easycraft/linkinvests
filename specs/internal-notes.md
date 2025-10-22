# Link Invest Conception

## Opportunités
Il semble qu'au final, l'objectif principal de l'application soit d'identifier des "opportunités off-market".
Ainsi, peut-être que toutes les données importées devraient aboutir à des `Opportunités` de différents types (Succession, Liquidation, Passoire Thermique, etc.)

## Scraping
- leboncoin et/ou seloger doivent être scrapés par des scrapers professionnels car ils utilisent des protections anti-bots de premier rang.
- ordre de grandeur du pricing /mois : 
    - 250 000 visites => 50€
    - 1 000 000 visites => 100€
    - 3 000 000 visites => 300€
    - 8 000 000 visites => 600€
- N.B. le premier mois sera le plus cher car on récupère l'historique. Après ça, mise à jour des données ajoutées/modifiées depuis dernière sycnhro

## Proposition
### Temps passé
- Estimation : ~25j => 25j * 700€/j = 17500€

### Forfait
- 21k€ for functional + platform specs
    - engagement de résultat
    - budget maitrisé
    - difficile de vérifier le temps passé
- Alt. 18k€ sans scraping

## Architecture
    - conception modulaire pour ajout facile de sources données
    - possible fallback sur API payantes pour éviter les interruptions de données en cas de blocage des scrapings etc

## Garantie Qualité
    - setup professionnel (CI/CD)
    - tests
    - code modulaire & robuste
    - maintenabilité & evolutivité

- Malt comme tiers de confiance
    - pas d'accompte
    - sécurité pour moi car la mission est provisionnée avant de démarrer
    - sécurité pour eux car les fonds ne me sont versés que quand ils déclarent la mission términée
    - (on peut envisager de passer en direct après cette 1ere mission)
- Couts de run et maintenance à définir
    - infra à leurs frais
    - maintenance : fixe + variable par user