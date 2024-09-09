import { Select } from "./Select/Select";

const countries = ["France", "South Africa", "Japan", "Antigua and Barbuda", "Germany", "United Kingdom"];

function App() {
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
			<div style={{ maxWidth: "320px" }}>
				<label htmlFor="custom-select" id="select-label">
					Make a choice
				</label>
				<Select
					components={{
						SelectValue: ({ selectedIndex }: { selectedIndex: number }) => (
							<div
								style={{
									cursor: "default",
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
							index,
							selectedIndex,
						}: {
							option: string;
							index: number;
							selectedIndex: number;
						}) => (
							<div
								style={{
									padding: "0.5rem",
								}}
							>
								{selectedIndex === index ? "✓ " : ""}
								{option}
							</div>
						),
					}}
					options={countries}
					id="custom-select"
					name="custom-select"
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
