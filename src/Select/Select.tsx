import { useReducer, useRef, useEffect, ReactNode, forwardRef } from "react";

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
		<>
			<SelectContainer
				ref={selectRef}
				isVisible={state.optionsVisible}
				selectedIndex={state.selectedIndex}
				activeIndex={state.activeIndex}
				onShowDropdown={() => dispatch({ type: "SHOW_DROPDOWN", index: state.selectedIndex })}
				onHideDropdown={() => dispatch({ type: "ANIMATE_OPTIONS_OUT" })}
				onChangeActiveIndex={(index) => dispatch({ type: "SET_ACTIVE_INDEX", index })}
				onSelect2={(index) => {
					dispatch({ type: "SET_SELECTED_INDEX", index });
					dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				}}
				id={id}
				options={options}
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
					// isVisible={state.optionsVisible}
					onTransitionEnd={() => {
						if (!state.optionsVisible) {
							dispatch({ type: "HIDE_DROPDOWN" });
						}
					}}
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
							isSelected={state.selectedIndex === index}
							isActive={state.activeIndex === index}
							onSelect2={() => {
								dispatch({ type: "SET_SELECTED_INDEX", index });
								dispatch({ type: "ANIMATE_OPTIONS_OUT" });
							}}
							id={`${id}-${index}`}
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
	);
}

type SelectContainerProps = {
	isVisible: boolean;
	selectedIndex: number;
	activeIndex: number;
	onShowDropdown: () => void;
	onHideDropdown: () => void;
	onChangeActiveIndex: (index: number) => void;
	onSelect2: (index: number) => void;
	children: ReactNode;
	id: string;
	options: string[];
} & React.HTMLProps<HTMLDivElement>;

export const SelectContainer = forwardRef<HTMLDivElement, SelectContainerProps>(
	(
		{
			isVisible,
			selectedIndex,
			activeIndex,
			onShowDropdown,
			onHideDropdown,
			onChangeActiveIndex,
			onSelect2,
			children,
			id,
			options,
			...props
		},
		ref
	) => {
		const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
			if (!isVisible) {
				if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onShowDropdown();
				}
				return;
			}

			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					onChangeActiveIndex((activeIndex + 1) % options.length);
					break;
				case "ArrowUp":
					event.preventDefault();
					onChangeActiveIndex((activeIndex - 1 + options.length) % options.length);
					break;
				case "Enter":
				case " ":
					event.preventDefault();
					onSelect2(activeIndex);
					break;
				case "Escape":
					event.preventDefault();
					onHideDropdown();
					break;
				case "Tab":
					onHideDropdown();
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
				aria-expanded={isVisible}
				aria-activedescendant={`${id}-${activeIndex}`}
				tabIndex={0}
				onClick={() => {
					if (!isVisible) {
						onShowDropdown();
					} else {
						onHideDropdown();
					}
				}}
				onKeyDown={handleKeyDown}
				{...props}
			>
				{children}
			</div>
		);
	}
);

type OptionsContainerProps = {
	// isVisible: boolean;
	onTransitionEnd: () => void;
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export const OptionsContainer = forwardRef<HTMLDivElement, OptionsContainerProps>(
	({ onTransitionEnd, children, ...props }, ref) => {
		return (
			<div style={{ position: "relative" }}>
				<div ref={ref} role="listbox" tabIndex={-1} onTransitionEnd={onTransitionEnd} {...props}>
					<div style={{ overflow: "hidden" }}>{children}</div>
				</div>
			</div>
		);
	}
);

type OptionItemProps = {
	isSelected: boolean;
	isActive: boolean;
	onSelect2: () => void;
	id: string;
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export function OptionItem({ isSelected, isActive, onSelect2, id, children, ...props }: OptionItemProps) {
	return (
		<div role="option" id={id} aria-selected={isSelected} tabIndex={-1} onClick={onSelect2} {...props}>
			{children}
		</div>
	);
}
