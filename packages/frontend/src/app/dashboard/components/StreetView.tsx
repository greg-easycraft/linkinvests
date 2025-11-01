"use client";

interface StreetViewProps {
  address?: string | null;
  latitude: number;
  longitude: number;
  className?: string;
}

// @ts-expect-error props is not yet used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StreetView(props: StreetViewProps): React.ReactElement {
  return (
    <div>Street View</div>
  );
}
