import React, { useReducer, useRef, useEffect, ReactNode, forwardRef, createContext, useContext } from "react";

type SelectProps = {
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
	| { type: "SHOW_DROPDOWN"; index: number }
	| { type: "HIDE_DROPDOWN" }
	| { type: "ANIMATE_OPTIONS_IN" }
	| { type: "ANIMATE_OPTIONS_OUT" }
	| { type: "SET_SELECTED_INDEX"; index: number }
	| { type: "SET_ACTIVE_INDEX"; index: number };

type SelectContextType = {
	state: State;
	dispatch: React.Dispatch<SelectAction>;
	id: string;
	options: string[];
};

const SelectContext = createContext<SelectContextType | undefined>(undefined);

function useSelectContext() {
	const context = useContext(SelectContext);
	if (!context) {
		throw new Error("useSelectContext must be used within a SelectProvider");
	}
	return context;
}

function reducer(state: State, action: SelectAction): State {
	switch (action.type) {
		case "SHOW_DROPDOWN":
			return { ...state, optionsMounted: true, activeIndex: action.index };
		case "HIDE_DROPDOWN":
			return { ...state, optionsMounted: false };
		case "ANIMATE_OPTIONS_IN":
			return { ...state, optionsVisible: true };
		case "ANIMATE_OPTIONS_OUT":
			return { ...state, optionsVisible: false };
		case "SET_SELECTED_INDEX":
			return { ...state, selectedIndex: action.index };
		case "SET_ACTIVE_INDEX":
			return { ...state, activeIndex: action.index };
		default:
			return state;
	}
}

export function Select({ id, name, options }: SelectProps) {
	const [state, dispatch] = useReducer(reducer, {
		optionsMounted: false,
		optionsVisible: false,
		selectedIndex: 0,
		activeIndex: 0,
	});

	const selectRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (state.optionsMounted) {
			dispatch({ type: "ANIMATE_OPTIONS_IN" });
		}
	}, [state.optionsMounted]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent | TouchEvent) {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node) &&
				optionsRef.current &&
				!optionsRef.current.contains(event.target as Node)
			) {
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [state.optionsVisible]);

	return (
		<SelectContext.Provider value={{ state, dispatch, id, options }}>
			<>
				<SelectContainer
					ref={selectRef}
					style={{
						cursor: "default",
						backgroundColor: "#333",
						padding: "0.5rem",
						minWidth: "200px",
					}}
				>
					{options[state.selectedIndex]}
				</SelectContainer>

				{state.optionsMounted && (
					<OptionsContainer
						ref={optionsRef}
						style={{
							gridTemplateRows: state.optionsVisible ? "1fr" : "0fr",
							backgroundColor: "#333",
							display: "grid",
							position: "absolute",
							left: 0,
							top: 0,
							width: "100%",
							transition: "all 0.3s ease",
							cursor: "default",
						}}
					>
						{options.map((option, index) => (
							<OptionItem
								key={index}
								index={index}
								style={{
									padding: "0.5rem",
									backgroundColor: state.activeIndex === index ? "#555" : "transparent",
								}}
							>
								{state.selectedIndex === index ? "✓ " : ""}
								{option}
							</OptionItem>
						))}
					</OptionsContainer>
				)}

				<input type="hidden" id={id} name={name} value={options[state.selectedIndex]} />
			</>
		</SelectContext.Provider>
	);
}

type SelectContainerProps = {
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export const SelectContainer = forwardRef<HTMLDivElement, SelectContainerProps>(({ children, ...props }, ref) => {
	const { state, dispatch, id, options } = useSelectContext();

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!state.optionsVisible) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				dispatch({ type: "SHOW_DROPDOWN", index: state.selectedIndex });
			}
			return;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				dispatch({
					type: "SET_ACTIVE_INDEX",
					index: (state.activeIndex + 1) % options.length,
				});
				break;
			case "ArrowUp":
				event.preventDefault();
				dispatch({
					type: "SET_ACTIVE_INDEX",
					index: (state.activeIndex - 1 + options.length) % options.length,
				});
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				dispatch({ type: "SET_SELECTED_INDEX", index: state.activeIndex });
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				break;
			case "Escape":
				event.preventDefault();
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				break;
			case "Tab":
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				break;
			default:
				break;
		}
	};

	return (
		<div
			ref={ref}
			id={id}
			role="combobox"
			aria-haspopup="listbox"
			aria-expanded={state.optionsVisible}
			aria-activedescendant={`${id}-${state.activeIndex}`}
			tabIndex={0}
			onClick={() => {
				if (!state.optionsMounted) {
					dispatch({ type: "SHOW_DROPDOWN", index: state.selectedIndex });
				} else if (state.optionsVisible) {
					dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				}
			}}
			onKeyDown={handleKeyDown}
			{...props}
		>
			{children}
		</div>
	);
});

type OptionsContainerProps = {
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export const OptionsContainer = forwardRef<HTMLDivElement, OptionsContainerProps>(({ children, ...props }, ref) => {
	const { state, dispatch } = useSelectContext();

	return (
		<div style={{ position: "relative" }}>
			<div
				ref={ref}
				role="listbox"
				tabIndex={-1}
				onTransitionEnd={() => {
					if (!state.optionsVisible) {
						dispatch({ type: "HIDE_DROPDOWN" });
					}
				}}
				{...props}
			>
				<div style={{ overflow: "hidden" }}>{children}</div>
			</div>
		</div>
	);
});

type OptionItemProps = {
	index: number;
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export function OptionItem({ index, children, ...props }: OptionItemProps) {
	const { state, dispatch, id } = useSelectContext();

	return (
		<div
			role="option"
			id={`${id}-${index}`}
			aria-selected={index === state.selectedIndex}
			tabIndex={-1}
			onClick={() => {
				dispatch({ type: "SET_SELECTED_INDEX", index });
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
			}}
			{...props}
		>
			{children}
		</div>
	);
}
