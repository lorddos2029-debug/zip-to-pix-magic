import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { getTrackedPixHref } from "@/lib/campaign-attribution";

type TrackedPixLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href">;

/**
 * Preserva UTMify da landing até /pix; relê as tags na URL do checkout.
 * href começa igual no SSR e no browser, evitando erros de hidratação.
 */
export function TrackedPixLink({ onClick, ...props }: TrackedPixLinkProps) {
  const [href, setHref] = useState("/pix");

  useEffect(() => {
    setHref(getTrackedPixHref());
  }, []);

  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const latestHref = getTrackedPixHref();
        if (latestHref !== href) {
          event.preventDefault();
          window.location.assign(latestHref);
        }
      }}
    />
  );
}
