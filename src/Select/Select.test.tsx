import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "./Select";

const selectOptions = ["Option 1", "Option 2", "Option 3"];

describe("Select", () => {
	test("It renders with the first option selected", () => {
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		expect(select).toHaveTextContent("Option 1");
	});

	test("It selects option on click", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		await user.click(select);
		const option2 = screen.getByRole("option", { name: "Option 2" });
		await user.click(option2);
		expect(select).toHaveTextContent("Option 2");
	});

	test("It opens dropdown with Enter key", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}");

		const optionsList = screen.getByRole("listbox");
		expect(optionsList).toBeVisible();
	});

	test("It opens dropdown with Space key", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard(" ");

		const optionsList = screen.getByRole("listbox");
		expect(optionsList).toBeVisible();
	});

	test("It navigates options with arrow keys", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}");

		const optionsList = screen.getByRole("listbox");
		const optionIds = within(optionsList)
			.getAllByRole("option")
			.map((option) => option.id);

		await user.keyboard("{ArrowDown}");
		expect(select).toHaveAttribute("aria-activedescendant", optionIds[1]);

		await user.keyboard("{ArrowUp}");
		expect(select).toHaveAttribute("aria-activedescendant", optionIds[0]);
	});

	test("It selects option with Enter key", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}{ArrowDown}{Enter}");

		expect(select).toHaveTextContent("Option 2");
	});

	test("It selects option with Space key", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}{ArrowDown} ");

		expect(select).toHaveTextContent("Option 2");
	});

	test("It wraps around when navigating past last or first option", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}");

		const optionsList = screen.getByRole("listbox");
		const optionIds = within(optionsList)
			.getAllByRole("option")
			.map((option) => option.id);

		// Navigate down past the last option
		await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
		expect(select).toHaveAttribute("aria-activedescendant", optionIds[0]);

		// Navigate up past the first option
		await user.keyboard("{ArrowUp}");
		expect(select).toHaveAttribute("aria-activedescendant", optionIds[2]);
	});

	test("It maintains selected option when closing and reopening dropdown", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}{ArrowDown}{Enter}");

		expect(select).toHaveTextContent("Option 2");

		await user.keyboard("{Enter}");
		const optionsList = screen.getByRole("listbox");
		const optionIds = within(optionsList)
			.getAllByRole("option")
			.map((option) => option.id);

		expect(select).toHaveAttribute("aria-activedescendant", optionIds[1]);
	});

	test("It closes dropdown with Escape key", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		select.focus();
		await user.keyboard("{Enter}");

		const optionsList = screen.getByRole("listbox");
		expect(optionsList).toBeVisible();

		await user.keyboard("{Escape}");
		fireEvent.transitionEnd(optionsList);
		expect(optionsList).not.toBeInTheDocument();
	});

	test("It closes dropdown when clicking outside", async () => {
		const user = userEvent.setup();
		render(<Select id="react-simple-select" name="react-simple-select" options={selectOptions} />);

		const select = screen.getByRole("combobox");
		await user.click(select);
		const optionsList = screen.getByRole("listbox");
		await user.click(document.body);
		fireEvent.transitionEnd(optionsList);

		expect(optionsList).not.toBeInTheDocument();
	});
});
