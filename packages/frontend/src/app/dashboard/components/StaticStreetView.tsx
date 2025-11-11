import { env } from "~/lib/env";


export const StaticStreetView = ({ longitude, latitude, address }: { longitude: number, latitude: number, address?: string | null }) => {
  const location = address ? encodeURIComponent(address) : `${latitude},${longitude}`;
  const staticImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=96x72&location=${location}&heading=270&pitch=0&key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  return (
    <img src={staticImageUrl} alt="Static Street View" />
  );
};