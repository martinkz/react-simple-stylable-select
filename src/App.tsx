import { CustomSelect } from "./CustomSelect/CustomSelect";

const countries = ["France", "South Africa", "Japan", "Antigua and Barbuda", "Germany", "United Kingdom"];

function App() {
	return (
		<form action="/">
			<h1>Custom select</h1>
			{/* <input type="text" id="test" name="test" /> */}
			<CustomSelect className="test" options={countries} id="test-select" name="test-select" />
			<br />
			<select>
				<option value="volvo">Volvo</option>
				<option value="saab">Saab</option>
				<option value="mercedes">Mercedes</option>
			</select>
			{/* <button type="submit">Submit</button> */}
		</form>
	);
}

export default App;
