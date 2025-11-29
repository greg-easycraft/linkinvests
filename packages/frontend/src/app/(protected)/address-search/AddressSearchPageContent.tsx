"use client";

import { useState } from "react";
import { AddressSearchForm } from "./_components/AddressSearchForm";
import { SearchResults } from "./_components/SearchResults";
import { searchAddressByEnergyDiagnostics, getEnergyDiagnosticDetails } from "~/app/_actions/address-search/queries";
import type { AddressSearchInput, AddressSearchResult, EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { OpportunityDetailsModal } from "../search/_components/OpportunityDetailsModal";

export default function AddressSearchPageContent(): React.ReactElement {
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEnergyDiagnostic, setSelectedEnergyDiagnostic] = useState<EnergyDiagnostic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: AddressSearchInput) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(false);

    try {
      const searchResults = await searchAddressByEnergyDiagnostics(data);
      setResults(searchResults);
      setHasSearched(true);

      // Show success message if we found results
      if (searchResults.length === 0) {
        setError("Aucune adresse correspondante trouvée. Essayez d&apos;ajuster vos critères de recherche.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s&apos;est produite lors de la recherche';
      setError(errorMessage);
      console.error('Address search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (result: AddressSearchResult) => {
    if (!result.energyDiagnosticId) {
      setError("Aucune information détaillée disponible pour ce résultat.");
      return;
    }

    try {
      const diagnostic = await getEnergyDiagnosticDetails(result.energyDiagnosticId);
      if (diagnostic) {
        setSelectedEnergyDiagnostic(diagnostic);
        setIsModalOpen(true);
      } else {
        setError("Échec du chargement des informations détaillées pour cette adresse.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec du chargement des détails';
      setError(errorMessage);
      console.error('Error loading diagnostic details:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedEnergyDiagnostic(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Search Form */}
      <AddressSearchForm onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="max-w-4xl bg-[var(--secundary)] shadow-sm mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de Recherche</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success/Info Messages */}
      {hasSearched && results.length > 0 && (
        <Alert className="max-w-4xl mx-auto border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Recherche Terminée</AlertTitle>
          <AlertDescription className="text-green-700">
            {results.length} adresse{results.length === 1 ? '' : 's'} correspondante{results.length === 1 ? '' : 's'} trouvée{results.length === 1 ? '' : 's'} selon vos critères.
            Les résultats sont classés par niveau de confiance.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Alert className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Recherche en cours...</AlertTitle>
          <AlertDescription className="text-blue-700">
            Analyse des dossiers de diagnostics énergétiques pour trouver les adresses correspondantes.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {(hasSearched || results.length > 0) && (
        <SearchResults
          results={results}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* No Results State with Tips */}
      {hasSearched && results.length === 0 && !error && !isLoading && (
        <div className="max-w-4xl mx-auto text-center space-y-6 py-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Aucune Adresse Trouvée</h3>
            <div className="text-sm  space-y-2">
              <p className="font-medium">Essayez ces conseils pour améliorer votre recherche :</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Retirez le filtre de classe énergétique DPE pour inclure plus de propriétés</li>
                <li>Essayez un code postal différent dans la même zone</li>
                <li>Retirez l&apos;exigence de superficie</li>
                <li>Utilisez moins de mots dans le champ adresse</li>
                <li>Vérifiez que le code postal est correct (5 chiffres)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Details Modal */}
      {selectedEnergyDiagnostic && (
        <OpportunityDetailsModal
          type={OpportunityType.ENERGY_SIEVE}
          opportunity={selectedEnergyDiagnostic}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}