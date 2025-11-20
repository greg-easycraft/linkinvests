"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Home,
  Euro,
  FileText,
  MapPin as VenueIcon,
  Phone,
  Mail,
  Globe,
  Building,
  Calendar,
  ExternalLink,
  Square,
  Bed,
  ParkingCircle,
  TreePine,
  Zap,
  Shield,
  Building2,
  Contact
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { EnergyClass, Listing } from "@linkinvests/shared";
import { ENERGY_CLASS_INFO } from "~/constants/energy-classes";
import { DpeBadge } from "~/components/ui/dpe-badge";

interface ListingDetailsProps {
  opportunity: Listing;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatSquareFootage = (squareFootage: number): string => {
  return `${squareFootage} m²`;
};

const formatPropertyType = (propertyType: string): string => {
  const types: Record<string, string> = {
    'APP': 'Appartement',
    'MAI': 'Maison',
    'TER': 'Terrain',
    'LOC': 'Local commercial',
    'IMM': 'Immeuble',
    'GAR': 'Garage/Parking',
    'CAV': 'Cave',
    'BOX': 'Box',
  };
  return types[propertyType] || propertyType;
};

const formatTransactionType = (transactionType: string): string => {
  const types: Record<string, string> = {
    'VENTE': 'Vente',
    'VENTE_EN_L_ETAT_FUTUR_D_ACHEVEMENT': 'VEFA',
    'VENTE_AUX_ENCHERES': 'Enchères',
    'LOCATION': 'Location',
    'LOCATION_VENTE': 'Location-vente',
  };
  return types[transactionType] || transactionType;
};

export function ListingDetails({ opportunity }: ListingDetailsProps) {
  const hasPriceInfo = opportunity.price || opportunity.fees || opportunity.charges;
  const hasPropertyInfo = opportunity.propertyType || opportunity.squareFootage ||
                         opportunity.landArea || opportunity.rooms || opportunity.bedrooms ||
                         opportunity.dpe || opportunity.constructionYear || opportunity.floor;
  const hasFeatures = opportunity.balcony || opportunity.terrace || opportunity.garden ||
                     opportunity.garage || opportunity.parking || opportunity.elevator;
  const hasContactInfo = opportunity.sellerContact && (
    opportunity.sellerContact.name ||
    opportunity.sellerContact.address ||
    opportunity.sellerContact.phone ||
    opportunity.sellerContact.email ||
    opportunity.sellerContact.website ||
    opportunity.sellerContact.contact ||
    opportunity.sellerContact.siret
  );

  const energyClassInfo = ENERGY_CLASS_INFO[opportunity.dpe as EnergyClass];
  console.log(energyClassInfo);

  if (!hasPriceInfo && !hasPropertyInfo && !hasFeatures && !hasContactInfo && !opportunity.url && !opportunity.description) {
    return null;
  }

  return (
    <Card className="mt-6 text-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Home className="h-5 w-5" />
          Détails de l&apos;annonce
        </CardTitle>
        {opportunity.url && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(opportunity.url!, '_blank', 'noopener,noreferrer')}
              title="Voir l'annonce originale"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir l&apos;annonce
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction and Property Type */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Type de transaction</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Transaction:</span>
              <Badge variant="outline" className="!text-blue-600 border-blue-600">
                {formatTransactionType(opportunity.transactionType)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Type de bien:</span>
              <Badge variant="outline" className="!text-purple-600 border-purple-600">
                {formatPropertyType(opportunity.propertyType)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Price Information */}
        {hasPriceInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Prix et frais</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {opportunity.price && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Prix:</span>
                  <Badge variant="outline" className="!text-green-600 border-green-600">
                    {formatPrice(Number(opportunity.price))}
                  </Badge>
                  {opportunity.priceType && (
                    <span className="text-gray-500 text-xs">({opportunity.priceType})</span>
                  )}
                </div>
              )}
              {opportunity.fees && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Frais:</span>
                  <span className="text-orange-600">{formatPrice(Number(opportunity.fees))}</span>
                </div>
              )}
              {opportunity.charges && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Charges:</span>
                  <span className="text-red-600">{formatPrice(Number(opportunity.charges))} /mois</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Information */}
        {hasPropertyInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Caractéristiques du bien</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {opportunity.squareFootage && (
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Surface habitable:</span>
                  <span>{formatSquareFootage(Number(opportunity.squareFootage))}</span>
                </div>
              )}
              {opportunity.landArea && (
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Surface terrain:</span>
                  <span>{formatSquareFootage(Number(opportunity.landArea))}</span>
                </div>
              )}
              {opportunity.rooms && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Nombre de pièces:</span>
                  <span>{opportunity.rooms}</span>
                </div>
              )}
              {opportunity.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Chambres:</span>
                  <span>{opportunity.bedrooms}</span>
                </div>
              )}
              {opportunity.dpe && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">DPE:</span>
                  <DpeBadge
                    dpe={opportunity.dpe as EnergyClass}
                  />
                </div>
              )}
              {opportunity.constructionYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Année de construction:</span>
                  <span>{opportunity.constructionYear}</span>
                </div>
              )}
              {opportunity.floor !== undefined && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Étage:</span>
                  <span>
                    {opportunity.floor}
                    {opportunity.totalFloors && ` / ${opportunity.totalFloors}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {hasFeatures && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Équipements et services</h4>
            <div className="flex flex-wrap gap-2">
              {opportunity.balcony && (
                <Badge variant="secondary" className="text-xs">
                  <Home className="h-3 w-3 mr-1" />
                  Balcon
                </Badge>
              )}
              {opportunity.terrace && (
                <Badge variant="secondary" className="text-xs">
                  <Square className="h-3 w-3 mr-1" />
                  Terrasse
                </Badge>
              )}
              {opportunity.garden && (
                <Badge variant="secondary" className="text-xs">
                  <TreePine className="h-3 w-3 mr-1" />
                  Jardin
                </Badge>
              )}
              {opportunity.garage && (
                <Badge variant="secondary" className="text-xs">
                  <ParkingCircle className="h-3 w-3 mr-1" />
                  Garage
                </Badge>
              )}
              {opportunity.parking && (
                <Badge variant="secondary" className="text-xs">
                  <ParkingCircle className="h-3 w-3 mr-1" />
                  Parking
                </Badge>
              )}
              {opportunity.elevator && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Ascenseur
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {opportunity.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {opportunity.description}
            </p>
          </div>
        )}

        {/* Notary Contact Information */}
        {hasContactInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Informations notariales</h4>
            <div className="space-y-2 text-sm">
              {(opportunity.sellerContact?.name || opportunity.sellerContact?.address) && (
                <div className="flex items-start gap-2">
                  <VenueIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    {opportunity.sellerContact.name && (
                      <div className="font-medium">{opportunity.sellerContact.name}</div>
                    )}
                    {opportunity.sellerContact.address && (
                      <div className="text-gray-600">{opportunity.sellerContact.address}</div>
                    )}
                  </div>
                </div>
              )}

              {opportunity.sellerContact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.sellerContact.phone}</span>
                </div>
              )}

              {opportunity.sellerContact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>{opportunity.sellerContact.email}</span>
                </div>
              )}

              {opportunity.sellerContact?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <a
                    href={opportunity.sellerContact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.sellerContact.website}
                  </a>
                </div>
              )}

              {opportunity.sellerContact?.contact && (
                <div className="flex items-center gap-2">
                  <Contact className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Contact:</span>
                  <span>{opportunity.sellerContact.contact}</span>
                </div>
              )}

              {opportunity.sellerContact?.siret && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">SIRET:</span>
                  <span className="font-mono text-xs">{opportunity.sellerContact.siret}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listing Date */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Date de publication</h4>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span>
              {format(new Date(opportunity.opportunityDate), "PPPP", { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}