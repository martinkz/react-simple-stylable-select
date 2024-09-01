import { useEffect, useReducer, useRef } from "react";

export type SelectProps = {
	id: string;
	name: string;
	options: string[];
	className?: string;
};

type State = {
	optionsMounted: boolean;
	optionsVisible: boolean;
	selectedIndex: number;
	activeIndex: number;
};

type SelectAction =
	| { type: "SHOW_DROPDOWN" }
	| { type: "HIDE_DROPDOWN" }
	| { type: "ANIMATE_OPTIONS_IN" }
	| { type: "ANIMATE_OPTIONS_OUT" }
	| { type: "SET_SELECTED_INDEX"; payload: number }
	| { type: "SET_ACTIVE_INDEX"; payload: number };

function reducer(state: State, action: SelectAction): State {
	switch (action.type) {
		case "SHOW_DROPDOWN":
			return { ...state, optionsMounted: true };
		case "HIDE_DROPDOWN":
			return { ...state, optionsMounted: false };
		case "ANIMATE_OPTIONS_IN":
			return { ...state, optionsVisible: true };
		case "ANIMATE_OPTIONS_OUT":
			return { ...state, optionsVisible: false };
		case "SET_SELECTED_INDEX":
			return { ...state, selectedIndex: action.payload };
		case "SET_ACTIVE_INDEX":
			return { ...state, activeIndex: action.payload };
		default:
			return state;
	}
}

export default function Select({ id, name, options }: SelectProps) {
	const [state, dispatch] = useReducer(reducer, {
		optionsMounted: false,
		optionsVisible: false,
		selectedIndex: 0,
		activeIndex: 0,
	});

	const selectRef = useRef<HTMLDivElement>(null);
	const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (state.optionsMounted) {
			dispatch({ type: "ANIMATE_OPTIONS_IN" });
		}
	}, [state.optionsMounted]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!state.optionsVisible) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				dispatch({ type: "SHOW_DROPDOWN" });
			}
			return;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				dispatch({
					type: "SET_ACTIVE_INDEX",
					payload: (state.activeIndex + 1) % options.length,
				});
				break;
			case "ArrowUp":
				event.preventDefault();
				dispatch({
					type: "SET_ACTIVE_INDEX",
					payload: (state.activeIndex - 1 + options.length) % options.length,
				});
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				dispatch({ type: "SET_SELECTED_INDEX", payload: state.activeIndex });
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				selectRef.current!.focus();
				break;
			case "Escape":
				event.preventDefault();
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				selectRef.current!.focus();
				break;
			case "Tab":
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				break;
			default:
				break;
		}
	};

	return (
		<div style={{ maxWidth: "320px" }}>
			<label id="select-label">Make a choice</label>

			<div
				id="custom-select"
				role="combobox"
				aria-labelledby="select-label"
				aria-controls="listbox-container"
				aria-owns="listbox-container"
				aria-haspopup="listbox"
				aria-expanded={state.optionsVisible}
				aria-activedescendant={`${id}-${state.activeIndex}`}
				aria-autocomplete="none"
				tabIndex={0}
				onKeyDown={handleKeyDown}
				onClick={() => {
					if (!state.optionsMounted) {
						dispatch({ type: "SHOW_DROPDOWN" });
						dispatch({ type: "SET_ACTIVE_INDEX", payload: state.selectedIndex });
					}
					if (state.optionsVisible) {
						dispatch({ type: "ANIMATE_OPTIONS_OUT" });
					}
				}}
				style={{
					cursor: "default",
					backgroundColor: "#333",
					padding: "0.5rem",
					minWidth: "200px",
				}}
				ref={selectRef}
			>
				{options[state.selectedIndex]}
			</div>

			{state.optionsMounted && (
				<div style={{ position: "relative" }}>
					<div
						id="listbox-container"
						aria-labelledby="select-label"
						role="listbox"
						tabIndex={-1}
						style={{
							gridTemplateRows: state.optionsVisible ? "1fr" : "0fr",
							display: "grid",
							position: "absolute",
							left: 0,
							top: 0,
							width: "100%",
							backgroundColor: "#444",
							transition: "all 0.3s ease",
							cursor: "default",
						}}
						onTransitionEnd={() => {
							if (!state.optionsVisible) {
								dispatch({ type: "HIDE_DROPDOWN" });
							}
						}}
					>
						<div style={{ overflow: "hidden" }}>
							{options &&
								options.map((option, index) => (
									<div
										ref={(el) => (optionRefs.current[index] = el)}
										style={{
											padding: "0.5rem",
											backgroundColor: state.activeIndex === index ? "#555" : "transparent",
										}}
										role="option"
										id={`${id}-${index}`}
										key={index}
										aria-selected={index === state.selectedIndex}
										tabIndex={-1}
										onClick={() => {
											dispatch({ type: "SET_SELECTED_INDEX", payload: index });
											dispatch({ type: "ANIMATE_OPTIONS_OUT" });
											selectRef.current!.focus();
										}}
									>
										{state.selectedIndex === index ? "✓ " : ""}
										{option}
									</div>
								))}
						</div>
					</div>
				</div>
			)}

			<input type="hidden" id={id} name={name} value={options[state.selectedIndex]} />
		</div>
	);
}
