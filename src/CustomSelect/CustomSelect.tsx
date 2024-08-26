import { useEffect, useReducer } from "react";

export type SelectProps = {
	id: string;
	name: string;
	options: string[];
	className?: string;
};

type State = {
	optionsMounted: boolean;
	optionsVisible: boolean;
	value: string;
};

type SelectAction =
	| { type: "SHOW_DROPDOWN" }
	| { type: "HIDE_DROPDOWN" }
	| { type: "ANIMATE_OPTIONS_IN" }
	| { type: "ANIMATE_OPTIONS_OUT" }
	| { type: "SET_VALUE"; payload: string };

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
		case "SET_VALUE":
			return { ...state, value: action.payload };
		default:
			return state;
	}
}

export default function Select({ id, name, options }: SelectProps) {
	const [state, dispatch] = useReducer(reducer, {
		optionsMounted: false,
		optionsVisible: false,
		value: options[0],
	});

	useEffect(() => {
		if (state.optionsMounted) {
			dispatch({ type: "ANIMATE_OPTIONS_IN" });
		}
	}, [state.optionsMounted]);

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
				aria-expanded="false"
				aria-activedescendant={`${id}-0`}
				aria-autocomplete="none"
				onClick={() => {
					if (!state.optionsMounted) {
						dispatch({ type: "SHOW_DROPDOWN" });
					}
					if (state.optionsVisible) {
						dispatch({ type: "ANIMATE_OPTIONS_OUT" });
					}
				}}
				style={{ cursor: "default", backgroundColor: "#333", padding: "0.5rem", minWidth: "200px" }}
			>
				{state.value}
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
										style={{ padding: "0.5rem" }}
										role="option"
										id={`${id}-${index}`}
										key={index}
										aria-selected={option === state.value}
										onClick={() => {
											dispatch({ type: "SET_VALUE", payload: option });
											dispatch({ type: "ANIMATE_OPTIONS_OUT" });
										}}
									>
										{option}
									</div>
								))}
						</div>
					</div>
				</div>
			)}

			<input type="hidden" id={id} name={name} value={state.value} />
		</div>
	);
}
