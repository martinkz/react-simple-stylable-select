import { useReducer, useRef, useEffect, ReactNode, forwardRef } from "react";

type SelectProps = {
	id: string;
	name: string;
	options: string[];
	className?: string;
	components?: DisplayComponents;
};

type DisplayComponents = {
	SelectValue?: React.FC<{ selectedIndex: number }>;
	OptionListWrapper?: React.FC<{ children: React.ReactNode }>;
	OptionValue?: React.FC<{ option: string; index: number; selectedIndex: number }>;
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

export function Select({ id, name, options, components }: SelectProps) {
	const [state, dispatch] = useReducer(reducer, {
		optionsMounted: false,
		optionsVisible: false,
		selectedIndex: 0,
		activeIndex: 0,
	});

	const { SelectValue, OptionListWrapper, OptionValue } = components || {};

	const OptionListWrapperComponent = OptionListWrapper ?? "div";

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
				id={id}
				options={options}
				isVisible={state.optionsVisible}
				activeIndex={state.activeIndex}
				onShowDropdown={() => dispatch({ type: "SHOW_DROPDOWN", index: state.selectedIndex })}
				onHideDropdown={() => dispatch({ type: "ANIMATE_OPTIONS_OUT" })}
				onChangeActiveIndex={(index) => dispatch({ type: "SET_ACTIVE_INDEX", index })}
				onSelectOption={(index) => {
					dispatch({ type: "SET_SELECTED_INDEX", index });
					dispatch({ type: "ANIMATE_OPTIONS_OUT" });
				}}
			>
				{SelectValue ? <SelectValue selectedIndex={state.selectedIndex} /> : options[state.selectedIndex]}
			</SelectContainer>

			{state.optionsMounted && (
				<OptionsContainer
					ref={optionsRef}
					optionsVisible={state.optionsVisible}
					onTransitionEnd={() => {
						if (!state.optionsVisible) {
							dispatch({ type: "HIDE_DROPDOWN" });
						}
					}}
				>
					<OptionListWrapperComponent>
						{options.map((option, index) => (
							<OptionItem
								key={index}
								isSelected={state.selectedIndex === index}
								isActive={state.activeIndex === index}
								onSelectOption={() => {
									dispatch({ type: "SET_SELECTED_INDEX", index });
									dispatch({ type: "ANIMATE_OPTIONS_OUT" });
								}}
								id={`${id}-${index}`}
								style={{
									outlineOffset: "-2px",
									outline: state.activeIndex === index ? "2px dotted currentColor" : "none",
								}}
							>
								{OptionValue ? (
									<OptionValue option={option} index={index} selectedIndex={state.selectedIndex} />
								) : (
									<>
										{state.selectedIndex === index ? "✓ " : ""}
										{option}
									</>
								)}
							</OptionItem>
						))}
					</OptionListWrapperComponent>
				</OptionsContainer>
			)}

			<input type="hidden" id={id} name={name} value={options[state.selectedIndex]} />
		</>
	);
}

type SelectContainerProps = {
	isVisible: boolean;
	activeIndex: number;
	onShowDropdown: () => void;
	onHideDropdown: () => void;
	onChangeActiveIndex: (index: number) => void;
	onSelectOption: (index: number) => void;
	children: ReactNode;
	id: string;
	options: string[];
} & React.HTMLProps<HTMLDivElement>;

export const SelectContainer = forwardRef<HTMLDivElement, SelectContainerProps>(
	(
		{
			isVisible,
			activeIndex,
			onShowDropdown,
			onHideDropdown,
			onChangeActiveIndex,
			onSelectOption,
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
					onSelectOption(activeIndex);
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
	optionsVisible: boolean;
	onTransitionEnd: () => void;
	children: ReactNode;
};

export const OptionsContainer = forwardRef<HTMLDivElement, OptionsContainerProps>(
	({ optionsVisible, onTransitionEnd, children }, ref) => {
		return (
			<div style={{ position: "relative" }}>
				<div
					ref={ref}
					role="listbox"
					tabIndex={-1}
					onTransitionEnd={onTransitionEnd}
					style={{
						gridTemplateRows: optionsVisible ? "1fr" : "0fr",
						display: "grid",
						position: "absolute",
						left: 0,
						top: 0,
						width: "100%",
						transition: "all 0.3s ease",
						cursor: "default",
					}}
				>
					<div style={{ overflow: "hidden" }}>{children}</div>
				</div>
			</div>
		);
	}
);

type OptionItemProps = {
	isSelected: boolean;
	isActive: boolean;
	onSelectOption: () => void;
	id: string;
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export function OptionItem({ isSelected, isActive, onSelectOption, id, children, ...props }: OptionItemProps) {
	return (
		<div role="option" id={id} aria-selected={isSelected} tabIndex={-1} onClick={onSelectOption} {...props}>
			{children}
		</div>
	);
}
