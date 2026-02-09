"use client";

import { useEffect, useState } from "react";

type ServiceType = {
  id: string;
  name: string;
  slug: string;
};

type UseServiceTypesOptions = {
  includeAll?: boolean;
};

export function useServiceTypes(options: UseServiceTypesOptions = {}) {
  const { includeAll = false } = options;
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/services")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        const mapped = list.map((item: ServiceType) => item);
        if (includeAll) {
          setServices([{ id: "all", name: "All Services", slug: "all-services" }, ...mapped]);
        } else {
          setServices(mapped);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [includeAll]);

  return { services, loading, error };
}
