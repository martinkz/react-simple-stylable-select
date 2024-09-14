import { Select } from "./Select/Select";
import { useState } from "react";

const countries = ["France", "South Africa", "Japan", "Antigua and Barbuda", "Germany", "United Kingdom"];

function App() {
	const [selected, setSelected] = useState<string>("Japan");
	return (
		<form action="/">
			<h1>Custom select</h1>
			{/* <input type="text" id="test" name="test" /> */}
			{/* <div style={{ maxWidth: "320px" }}>
				<label htmlFor="test-select" id="select-label">
					Make a choice
				</label>
				<Select className="test" options={countries} id="test-select" name="test-select" />
			</div> */}
			{/* <br /> */}
			<label htmlFor="custom-select" id="select-label">
				Make a choice
			</label>
			<div style={{ maxWidth: "320px" }}>
				<Select
					id="custom-select"
					name="custom-select"
					options={countries}
					defaultValue={selected}
					onChange={setSelected}
					components={{
						SelectValue: ({ selectedIndex }: { selectedIndex: number }) => (
							<div
								style={{
									backgroundColor: "#333",
									padding: "0.5rem",
									minWidth: "200px",
								}}
							>
								{countries[selectedIndex]}
							</div>
						),
						OptionListWrapper: ({ children }: { children: React.ReactNode }) => (
							<div
								style={{
									backgroundColor: "#333",
								}}
							>
								{children}
							</div>
						),
						OptionValue: ({
							option,
							isSelected,
							isFocused,
						}: {
							option: string;
							isSelected: boolean;
							isFocused: boolean;
						}) => (
							<div
								style={{
									padding: "0.5rem",
									outlineOffset: "-1px",
									outline: isFocused ? "1px dotted #ffffff" : "none",
								}}
							>
								{isSelected ? "✓ " : ""}
								{option}
							</div>
						),
						Icon: () => (
							<svg width="10px" height="10px">
								<polygon points="0,0 5,10 10,0" fill="currentColor" />
							</svg>
						),
					}}
				/>
			</div>
			{/* ------ */}
			<br />
			<label htmlFor="cars" id="cars">
				Choose a car
			</label>
			&nbsp;
			<select id="cars" name="cars">
				<option value="volvo">Volvo</option>
				<option value="saab">Saab</option>
				<option value="mercedes">Mercedes</option>
			</select>
			&nbsp;
			<button type="submit">Submit</button>
		</form>
	);
}

export default App;
