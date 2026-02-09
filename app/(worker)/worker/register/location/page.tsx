"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistration } from "../_components/RegistrationProvider";
import { useRegisterWorkerStep3Mutation } from "@/lib/api/workerRegistrationApi";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFieldErrors } from "@/lib/hooks/useServerFieldErrors";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { locationSchema, type LocationFormValues } from "../_schemas/location";

const logoMark = "https://www.figma.com/api/mcp/asset/7515972f-ae3f-493a-8636-887c84646c06";
const arrowRight = "https://www.figma.com/api/mcp/asset/f3cc806a-630c-4dec-8247-f6460315dde9";

export default function WorkerRegisterLocationPage() {
  const router = useRouter();
  const { data, setLocation } = useRegistration();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registerWorkerStep3, { isLoading }] = useRegisterWorkerStep3Mutation();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: data.location,
  });

  const radius = watch("radius");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const streetField = register("street");
  const handleServerError = useServerFieldErrors<LocationFormValues>(setError, [
    { field: "street", pattern: /street|address/i },
    { field: "city", pattern: /city/i },
    { field: "state", pattern: /state/i },
    { field: "zip", pattern: /zip/i },
    { field: "radius", pattern: /radius/i },
  ]);

  const onSubmit = async (values: LocationFormValues) => {
    setLocation({
      ...values,
      unit: values.unit ?? "",
      radius: Number(values.radius),
    });
    setSubmitError(null);

    if (!data.userId) {
      setSubmitError("Please complete steps 1-2 first.");
      return;
    }

    try {
      await registerWorkerStep3({
        userId: data.userId,
        street: values.street,
        unit: values.unit,
        city: values.city,
        state: values.state,
        zip: values.zip,
        serviceRadiusMiles: Number(values.radius),
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
      }).unwrap();
      router.push("/worker/register/verify");
    } catch (err) {
      const result = handleServerError(err, "Registration failed");
      if (!result.handled) setSubmitError(result.message);
    }
  };

  const initialCenter = useMemo(() => {
    const latNum = typeof latitude === "number" ? latitude : latitude ? Number(latitude) : null;
    const lngNum = typeof longitude === "number" ? longitude : longitude ? Number(longitude) : null;
    if (typeof latNum === "number" && typeof lngNum === "number" && !Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
      return { lat: latNum, lng: lngNum };
    }
    return { lat: 37.7749, lng: -122.4194 };
  }, [latitude, longitude]);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    loadGoogleMaps()
      .then(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 12,
          disableDefaultUI: true,
        });
        mapInstanceRef.current = map;

        const marker = new google.maps.Marker({
          position: initialCenter,
          map,
          draggable: true,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) return;
          setValue("latitude", pos.lat(), { shouldValidate: true });
          setValue("longitude", pos.lng(), { shouldValidate: true });
        });

        if (inputRef.current) {
          autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            fields: ["address_components", "geometry"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete?.getPlace();
            const components = place?.address_components ?? [];

            const getComponent = (type: string) =>
              components.find((c) => c.types.includes(type))?.long_name || "";

            const streetNumber = getComponent("street_number");
            const route = getComponent("route");
            const line1 = [streetNumber, route].filter(Boolean).join(" ");

            setValue("street", line1 || getComponent("premise") || "", { shouldValidate: true });
            setValue("city", getComponent("locality") || getComponent("postal_town") || "", { shouldValidate: true });
            setValue("state", getComponent("administrative_area_level_1") || "", { shouldValidate: true });
            setValue("zip", getComponent("postal_code") || "", { shouldValidate: true });

            const loc = place?.geometry?.location;
            if (loc) {
              const lat = typeof loc.lat === "function" ? loc.lat() : Number(loc.lat);
              const lng = typeof loc.lng === "function" ? loc.lng() : Number(loc.lng);
              setValue("latitude", lat, { shouldValidate: true });
              setValue("longitude", lng, { shouldValidate: true });
              map.setCenter({ lat, lng });
              marker.setPosition({ lat, lng });
            }
          });
        }
      })
      .catch(() => {});

    return () => {
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [initialCenter, setValue]);

  return (
    <main className="min-h-screen bg-white">
      <nav className="w-full border-b border-neutral-border bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 pb-[25px] pt-[24px] sm:px-12 lg:px-[48px]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center" aria-hidden>
              <img src={logoMark} alt="" className="h-6 w-6" />
            </div>
            <span className="text-[20px] font-bold leading-[30px] text-black">LocalPros</span>
          </Link>
          <div className="text-[14px] leading-[21px] text-neutral-muted">
            Need help?{" "}
            <Link href="/support" className="font-medium text-brand-green">
              Support
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-[#dbf7e5] px-6 py-[64px] sm:px-12 lg:px-[24px]">
        <div className="mx-auto w-full max-w-[680px] rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)]">
          <div className="px-12 pt-10">
            <Link href="/worker/register/work-details" className="text-[12px] leading-[18px] text-neutral-muted">
              ← Back to Work Details
            </Link>
          </div>

          <div className="relative flex items-center justify-center px-12 pt-6">
            <div className="absolute left-1/2 top-[16px] h-[2px] w-[240px] -translate-x-1/2 bg-[#e8e8e8]">
              <div className="h-full w-[75%] bg-brand-green" />
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Account</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                ✓
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Work Details</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green p-[2px] text-[14px] font-semibold text-white">
                3
              </div>
              <span className="text-[12px] font-semibold leading-[18px] text-black">Location</span>
            </div>
            <div className="flex w-[90px] flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e8e8e8] p-[2px] text-[14px] font-semibold text-neutral-muted">
                4
              </div>
              <span className="text-[12px] font-medium leading-[18px] text-neutral-muted">Verify</span>
            </div>
          </div>

          <div className="px-12 pt-[32px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-[22px] font-bold leading-[33px] text-black">Where do you work?</h1>
              <p className="text-[13px] leading-[19.5px] text-neutral-muted">
                Set your base location and service radius to get matched with nearby jobs
              </p>
            </div>
          </div>

          <form className="px-12 pb-12 pt-[28px]" onSubmit={handleSubmit(onSubmit)}>
            <label className="flex flex-col gap-2 text-[12px] font-medium leading-[18px] text-black">
              Street Address
              <input
                type="text"
                placeholder="e.g. 123 Main Street"
                className="h-[34px] rounded-[6px] border border-[#e8e8e8] bg-[#f8f8f7] px-3 text-[12px] text-black placeholder:text-[#757575]"
                {...streetField}
                ref={(element) => {
                  streetField.ref(element);
                  inputRef.current = element;
                }}
              />
              {errors.street ? <span className="text-[11px] text-red-500">{errors.street.message}</span> : null}
            </label>

            <label className="mt-4 flex flex-col gap-2 text-[12px] font-medium leading-[18px] text-black">
              Apartment, suite, etc. (Optional)
              <input
                type="text"
                placeholder="e.g. Unit 4B"
                className="h-[34px] rounded-[6px] border border-[#e8e8e8] bg-[#f8f8f7] px-3 text-[12px] text-black placeholder:text-[#757575]"
                {...register("unit")}
              />
            </label>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-[12px] font-medium leading-[18px] text-black">
                City
                <input
                  type="text"
                  placeholder="City"
                  className="h-[34px] rounded-[6px] border border-[#e8e8e8] bg-[#f8f8f7] px-3 text-[12px] text-black placeholder:text-[#757575]"
                  {...register("city")}
                />
                {errors.city ? <span className="text-[11px] text-red-500">{errors.city.message}</span> : null}
              </label>
              <label className="flex flex-col gap-2 text-[12px] font-medium leading-[18px] text-black">
                State
                <input
                  type="text"
                  placeholder="State"
                  className="h-[34px] rounded-[6px] border border-[#e8e8e8] bg-[#f8f8f7] px-3 text-[12px] text-black placeholder:text-[#757575]"
                  {...register("state")}
                />
                {errors.state ? <span className="text-[11px] text-red-500">{errors.state.message}</span> : null}
              </label>
              <label className="flex flex-col gap-2 text-[12px] font-medium leading-[18px] text-black">
                ZIP Code
                <input
                  type="text"
                  placeholder="12345"
                  className="h-[34px] rounded-[6px] border border-[#e8e8e8] bg-[#f8f8f7] px-3 text-[12px] text-black placeholder:text-[#757575]"
                  {...register("zip")}
                />
                {errors.zip ? <span className="text-[11px] text-red-500">{errors.zip.message}</span> : null}
              </label>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px] font-medium text-black">
                <span>Service Radius</span>
                <span className="text-[11px] text-neutral-muted">Max: 100 miles</span>
              </div>
              <div className="mt-3 rounded-[8px] bg-[#e8e8e8] px-4 py-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-muted">
                  <span>{radius ?? 25} miles</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  className="mt-2 w-full accent-brand-green"
                  {...register("radius")}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-muted">
                You will receive job alerts within this distance from your base address.
              </p>
              {errors.radius ? <span className="text-[11px] text-red-500">{errors.radius.message}</span> : null}
            </div>

            <div className="mt-6 overflow-hidden rounded-[12px] border border-[#e8e8e8]">
              <div className="relative h-[200px]">
                <div ref={mapRef} className="h-full w-full" />
                <div className="absolute bottom-4 right-4 rounded-[8px] bg-white px-3 py-2 text-[11px] text-neutral-muted shadow">
                  Drag the pin to refine
                </div>
              </div>
            </div>

            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-[40px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand-green text-[13px] font-semibold text-white disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Continue to Verification"}
              <img src={arrowRight} alt="" className="h-4 w-4" />
            </button>
            {submitError ? (
              <p className="mt-3 text-center text-[11px] text-red-500">{submitError}</p>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
