import type { RefObject } from "react";
import { useEffect } from "react";

export function useOnClickOutside<T extends HTMLElement = HTMLElement>({
	ref,
	callback,
	dependencies,
}: {
	ref: RefObject<T> | RefObject<T>[];
	callback: (event: MouseEvent | TouchEvent | FocusEvent) => void;
	dependencies?: unknown[];
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
	}, [ref, callback, dependencies]);
}
