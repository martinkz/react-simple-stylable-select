import { useReducer, useRef, useEffect, ReactNode } from "react";
import { useOnClickOutside } from "./utils";

type SelectProps = {
	id: string;
	name: string;
	options: string[];
	components?: DisplayComponents;
	defaultValue?: string | null;
	onChange?: (value: string) => void;
};

type DisplayComponents = {
	SelectValue?: React.FC<{ selectedIndex: number }>;
	OptionListWrapper?: React.FC<{ children: React.ReactNode }>;
	OptionValue?: React.FC<{ option: string; isSelected: boolean; isFocused: boolean }>;
	Icon?: React.ElementType;
};

type State = {
	optionsMounted: boolean;
	optionsVisible: boolean;
	selectedIndex: number;
	focusedOptionIndex: number;
};

type SelectAction =
	| { type: "SHOW_DROPDOWN"; index: number }
	| { type: "HIDE_DROPDOWN" }
	| { type: "ANIMATE_OPTIONS_IN" }
	| { type: "ANIMATE_OPTIONS_OUT" }
	| { type: "SET_SELECTED_INDEX"; index: number }
	| { type: "SET_FOCUSED_OPTION_INDEX"; index: number };

function reducer(state: State, action: SelectAction): State {
	switch (action.type) {
		case "SHOW_DROPDOWN":
			return { ...state, optionsMounted: true, focusedOptionIndex: action.index };
		case "HIDE_DROPDOWN":
			return { ...state, optionsMounted: false };
		case "ANIMATE_OPTIONS_IN":
			return { ...state, optionsVisible: true };
		case "ANIMATE_OPTIONS_OUT":
			return { ...state, optionsVisible: false };
		case "SET_SELECTED_INDEX":
			return { ...state, selectedIndex: action.index };
		case "SET_FOCUSED_OPTION_INDEX":
			return { ...state, focusedOptionIndex: action.index };
		default:
			return state;
	}
}

export function Select({ id, name, options, components, defaultValue, onChange }: SelectProps) {
	const initialIndex = options.indexOf(defaultValue ?? options[0]);
	const [state, dispatch] = useReducer(reducer, {
		optionsMounted: false,
		optionsVisible: false,
		selectedIndex: initialIndex,
		focusedOptionIndex: 0,
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

	useOnClickOutside({
		ref: [selectRef, optionsRef],
		callback: (_event) => {
			if (state.optionsVisible) {
				dispatch({ type: "ANIMATE_OPTIONS_OUT" });
			}
		},
	});

	const handleSelectOption = (index: number) => {
		dispatch({ type: "SET_SELECTED_INDEX", index });
		dispatch({ type: "ANIMATE_OPTIONS_OUT" });
		if (onChange) {
			onChange(options[index]);
		}
	};

	return (
		<>
			<SelectContainer
				selectRef={selectRef}
				id={id}
				options={options}
				optionsVisible={state.optionsVisible}
				focusedOptionIndex={state.focusedOptionIndex}
				onShowDropdown={() => dispatch({ type: "SHOW_DROPDOWN", index: state.selectedIndex })}
				onHideDropdown={() => dispatch({ type: "ANIMATE_OPTIONS_OUT" })}
				onChangeActiveIndex={(index) => dispatch({ type: "SET_FOCUSED_OPTION_INDEX", index })}
				onSelectOption={handleSelectOption}
				Icon={components?.Icon}
			>
				{SelectValue ? <SelectValue selectedIndex={state.selectedIndex} /> : options[state.selectedIndex]}
			</SelectContainer>

			{state.optionsMounted && (
				<OptionsContainer
					optionsRef={optionsRef}
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
								onSelectOption={() => handleSelectOption(index)}
								id={`${id}-${index}`}
							>
								{OptionValue ? (
									<OptionValue
										option={option}
										isSelected={state.selectedIndex === index}
										isFocused={state.focusedOptionIndex === index}
									/>
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
	selectRef: React.RefObject<HTMLDivElement>;
	optionsVisible: boolean;
	focusedOptionIndex: number;
	onShowDropdown: () => void;
	onHideDropdown: () => void;
	onChangeActiveIndex: (index: number) => void;
	onSelectOption: (index: number) => void;
	children: ReactNode;
	id: string;
	options: string[];
	Icon?: React.ElementType;
};

export const SelectContainer = ({
	selectRef,
	optionsVisible,
	focusedOptionIndex,
	onShowDropdown,
	onHideDropdown,
	onChangeActiveIndex,
	onSelectOption,
	children,
	id,
	options,
	Icon,
}: SelectContainerProps) => {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!optionsVisible) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				onShowDropdown();
			}
			return;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				onChangeActiveIndex((focusedOptionIndex + 1) % options.length);
				break;
			case "ArrowUp":
				event.preventDefault();
				onChangeActiveIndex((focusedOptionIndex - 1 + options.length) % options.length);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				onSelectOption(focusedOptionIndex);
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
			ref={selectRef}
			id={id}
			role="combobox"
			aria-haspopup="listbox"
			aria-expanded={optionsVisible}
			aria-activedescendant={`${id}-${focusedOptionIndex}`}
			tabIndex={0}
			onClick={() => {
				if (!optionsVisible) {
					onShowDropdown();
				} else {
					onHideDropdown();
				}
			}}
			onKeyDown={handleKeyDown}
			style={{
				position: "relative",
				cursor: "default",
			}}
		>
			{children}
			<span
				style={{
					position: "absolute",
					right: "1rem",
					top: "50%",
					transform: `translateY(-50%) ${optionsVisible ? "rotate(180deg)" : ""}`,
					transition: "transform 0.3s ease",
					zIndex: 9999,
				}}
			>
				{Icon && <Icon />}
			</span>
		</div>
	);
};

type OptionsContainerProps = {
	optionsRef: React.RefObject<HTMLDivElement>;
	optionsVisible: boolean;
	onTransitionEnd: () => void;
	children: ReactNode;
};

export const OptionsContainer = ({ optionsRef, optionsVisible, onTransitionEnd, children }: OptionsContainerProps) => {
	return (
		<div style={{ position: "relative" }}>
			<div
				ref={optionsRef}
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
};

type OptionItemProps = {
	isSelected: boolean;
	onSelectOption: () => void;
	id: string;
	children: ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export function OptionItem({ isSelected, onSelectOption, id, children, ...props }: OptionItemProps) {
	return (
		<div role="option" id={id} aria-selected={isSelected} tabIndex={-1} onClick={onSelectOption} {...props}>
			{children}
		</div>
	);
}
