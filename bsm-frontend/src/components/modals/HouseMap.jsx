import { useMemo } from "react";

export default function HouseMap({ address }) {
  const mapUrl = useMemo(() => {
    if (!address?.trim()) return null;

    const query = encodeURIComponent(address.trim());
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }, [address]);

  if (!mapUrl) return null;

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border">
      <iframe
        title="google-map"
        src={mapUrl}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="border-0"
      />
    </div>
  );
}