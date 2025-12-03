import { OpportunityType } from '@linkinvests/shared';
import { getOpportunityHeaders } from './export-headers.service';

describe('export-headers.service', () => {
  describe('getOpportunityHeaders', () => {
    it('should return auction headers for AUCTION type', () => {
      const headers = getOpportunityHeaders(OpportunityType.AUCTION);

      expect(headers).toEqual({
        id: 'ID',
        label: 'Titre',
        address: 'Adresse',
        zipCode: 'Code postal',
        department: 'Département',
        opportunityDate: 'Date de vente',
        currentPrice: 'Prix actuel',
        reservePrice: 'Mise à prix',
        lowerEstimate: 'Estimation basse',
        upperEstimate: 'Estimation haute',
        squareFootage: 'Surface (m²)',
        rooms: 'Pièces',
        propertyType: 'Type de bien',
        energyClass: 'DPE',
        auctionVenue: 'Lieu de vente',
        occupationStatus: "Statut d'occupation",
        url: 'URL',
        source: 'Source',
        createdAt: 'Date de création',
      });
    });

    it('should return listing headers for REAL_ESTATE_LISTING type', () => {
      const headers = getOpportunityHeaders(OpportunityType.REAL_ESTATE_LISTING);

      expect(headers).toEqual({
        id: 'ID',
        label: 'Titre',
        address: 'Adresse',
        zipCode: 'Code postal',
        department: 'Département',
        opportunityDate: 'Date de publication',
        price: 'Prix',
        squareFootage: 'Surface (m²)',
        rooms: 'Pièces',
        bedrooms: 'Chambres',
        propertyType: 'Type de bien',
        energyClass: 'DPE',
        sellerType: 'Type de vendeur',
        url: 'URL',
        source: 'Source',
        createdAt: 'Date de création',
      });
    });

    it('should return succession headers for SUCCESSION type', () => {
      const headers = getOpportunityHeaders(OpportunityType.SUCCESSION);

      expect(headers).toEqual({
        id: 'ID',
        label: 'Titre',
        firstName: 'Prénom',
        lastName: 'Nom',
        address: 'Adresse',
        zipCode: 'Code postal',
        department: 'Département',
        opportunityDate: 'Date du décès',
        createdAt: 'Date de création',
      });
    });

    it('should return liquidation headers for LIQUIDATION type', () => {
      const headers = getOpportunityHeaders(OpportunityType.LIQUIDATION);

      expect(headers).toEqual({
        id: 'ID',
        label: 'Entreprise',
        siret: 'SIRET',
        address: 'Adresse',
        zipCode: 'Code postal',
        department: 'Département',
        opportunityDate: 'Date de liquidation',
        createdAt: 'Date de création',
      });
    });

    it('should return energy diagnostic headers for ENERGY_SIEVE type', () => {
      const headers = getOpportunityHeaders(OpportunityType.ENERGY_SIEVE);

      expect(headers).toEqual({
        id: 'ID',
        label: 'Titre',
        address: 'Adresse',
        zipCode: 'Code postal',
        department: 'Département',
        energyClass: 'DPE',
        squareFootage: 'Surface (m²)',
        opportunityDate: 'Date du diagnostic',
        createdAt: 'Date de création',
      });
    });

    it('should return empty object for unknown opportunity type', () => {
      const headers = getOpportunityHeaders('unknown' as OpportunityType);

      expect(headers).toEqual({});
    });

    it('should return empty object for DIVORCE type (no headers defined)', () => {
      const headers = getOpportunityHeaders(OpportunityType.DIVORCE);

      expect(headers).toEqual({});
    });

    describe('header translations', () => {
      it('should have all headers in French', () => {
        const allTypes = [
          OpportunityType.AUCTION,
          OpportunityType.REAL_ESTATE_LISTING,
          OpportunityType.SUCCESSION,
          OpportunityType.LIQUIDATION,
          OpportunityType.ENERGY_SIEVE,
        ];

        for (const type of allTypes) {
          const headers = getOpportunityHeaders(type);
          const values = Object.values(headers);

          // All values should be non-empty strings
          values.forEach((value) => {
            expect(value).toBeTruthy();
            expect(typeof value).toBe('string');
          });
        }
      });

      it('should have consistent common headers across types', () => {
        const auction = getOpportunityHeaders(OpportunityType.AUCTION);
        const listing = getOpportunityHeaders(OpportunityType.REAL_ESTATE_LISTING);
        const succession = getOpportunityHeaders(OpportunityType.SUCCESSION);
        const liquidation = getOpportunityHeaders(OpportunityType.LIQUIDATION);
        const energySieve = getOpportunityHeaders(OpportunityType.ENERGY_SIEVE);

        // Common headers should have same translations
        expect(auction.id).toBe(listing.id);
        expect(auction.id).toBe(succession.id);
        expect(auction.id).toBe(liquidation.id);
        expect(auction.id).toBe(energySieve.id);

        expect(auction.address).toBe(listing.address);
        expect(auction.address).toBe(succession.address);
        expect(auction.address).toBe(liquidation.address);
        expect(auction.address).toBe(energySieve.address);

        expect(auction.zipCode).toBe(listing.zipCode);
        expect(auction.department).toBe(listing.department);
        expect(auction.createdAt).toBe(listing.createdAt);
      });
    });

    describe('specific field coverage', () => {
      it('should include price-related fields for auctions', () => {
        const headers = getOpportunityHeaders(OpportunityType.AUCTION);

        expect(headers.currentPrice).toBeDefined();
        expect(headers.reservePrice).toBeDefined();
        expect(headers.lowerEstimate).toBeDefined();
        expect(headers.upperEstimate).toBeDefined();
      });

      it('should include property details for listings', () => {
        const headers = getOpportunityHeaders(OpportunityType.REAL_ESTATE_LISTING);

        expect(headers.price).toBeDefined();
        expect(headers.rooms).toBeDefined();
        expect(headers.bedrooms).toBeDefined();
        expect(headers.sellerType).toBeDefined();
      });

      it('should include person details for successions', () => {
        const headers = getOpportunityHeaders(OpportunityType.SUCCESSION);

        expect(headers.firstName).toBeDefined();
        expect(headers.lastName).toBeDefined();
      });

      it('should include business details for liquidations', () => {
        const headers = getOpportunityHeaders(OpportunityType.LIQUIDATION);

        expect(headers.siret).toBeDefined();
      });

      it('should include energy details for energy sieves', () => {
        const headers = getOpportunityHeaders(OpportunityType.ENERGY_SIEVE);

        expect(headers.energyClass).toBeDefined();
        expect(headers.squareFootage).toBeDefined();
      });
    });
  });
});
