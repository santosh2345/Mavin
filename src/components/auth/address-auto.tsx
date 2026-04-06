/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

interface Props {
  onSelect: (value: any) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    postcode?: string;
    country_code?: string;
    [k: string]: any;
  };
}

/**
 * Worldwide address autocomplete backed by OpenStreetMap's Nominatim service.
 * No API key, no credit card, no signup. We respect their usage policy by
 * debouncing requests and sending a descriptive User-Agent equivalent via
 * the Referer header (browsers add this automatically).
 *
 * Nominatim docs: https://nominatim.org/release-docs/latest/api/Search/
 */
export default function AddressAuto({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '8');
        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Geocoder error');
        const data: NominatimResult[] = await res.json();
        if (!cancelled) {
          setResults(data);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function pick(result: NominatimResult) {
    setQuery(result.display_name);
    setOpen(false);
    onSelect({
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      postcode: result.address?.postcode || '',
      country_code: result.address?.country_code || '',
    });
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder="Search any address worldwide…"
        className="appearance-none text-13px text-dark dark:text-light w-full px-4 lg:px-5 py-2 h-11 md:h-12 xl:h-[50px] rounded bg-transparent border border-light-500 dark:border-dark-600 ring-[0.5px] ring-light-500 dark:ring-dark-600 focus:ring-[0.5px] focus:border-brand dark:focus:border-brand focus:ring-brand dark:focus:ring-brand"
      />
      {open && (loading || results.length > 0) && (
        <div className="absolute z-20 w-full bg-light shadow-lg dark:bg-dark-250 max-h-72 overflow-y-auto">
          {loading && (
            <div className="py-2 px-4 text-dark dark:text-light text-sm">
              Searching…
            </div>
          )}
          {!loading &&
            results.map((r) => (
              <div
                key={r.place_id}
                onClick={() => pick(r)}
                className="py-2 px-4 text-dark dark:text-light hover:bg-light-200 dark:hover:bg-dark-200 cursor-pointer text-sm"
              >
                {r.display_name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
