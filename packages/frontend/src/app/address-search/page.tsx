import { Metadata } from 'next';
import AddressSearchPageContent from "./AddressSearchPageContent";

export const metadata: Metadata = {
  title: 'Recherche d\'Adresse | Linkinvest',
  description: 'Trouvez des adresses de propriétés en recherchant dans les dossiers de diagnostics énergétiques. Découvrez les propriétés correspondantes basées sur la classe DPE, la superficie, le code postal et d\'autres critères.',
  keywords: ['recherche d\'adresse', 'découverte de propriété', 'diagnostic énergétique', 'DPE', 'immobilier', 'correspondance de propriété'],
};

export default function AddressSearchPage(): React.ReactElement {
  return <AddressSearchPageContent />;
}