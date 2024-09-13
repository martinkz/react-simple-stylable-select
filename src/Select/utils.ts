import type { RefObject } from "react";
import { useEffect } from "react";

export function useOnClickOutside<T extends HTMLElement = HTMLElement>({
	ref,
	dependencies,
	callback,
}: {
	ref: RefObject<T> | RefObject<T>[];
	dependencies: unknown[];
	callback: (event: MouseEvent | TouchEvent | FocusEvent) => void;
}) {
	useEffect(() => {
		function handleEvent(event: MouseEvent | TouchEvent | FocusEvent) {
			const target = event.target as Node;

			const isOutside = Array.isArray(ref)
				? ref.filter((r) => Boolean(r.current)).every((r) => r.current && !r.current.contains(target))
				: ref.current && !ref.current.contains(target);

			if (isOutside) {
				callback(event);
			}
		}

		const events = ["mousedown", "touchstart", "focusin"] as const;

		events.forEach((event) => {
			document.addEventListener(event, handleEvent);
		});

		return () => {
			events.forEach((event) => {
				document.removeEventListener(event, handleEvent);
			});
		};
	}, [dependencies, ref, callback]);
}
