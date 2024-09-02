// import "@testing-library/jest-dom";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitForElementToBeRemoved, waitFor, logRoles, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { CustomSelect } from "./CustomSelect";

describe("Select", () => {
	// beforeEach(() => {
	// 	vi.useFakeTimers({ shouldAdvanceTime: true });
	// });

	// afterEach(() => {
	// 	vi.runOnlyPendingTimers();
	// 	vi.useRealTimers();
	// });

	test("Can select options", async () => {
		const user = userEvent.setup();
		// const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		render(<CustomSelect id="custom-select" name="custom-select" options={["Option 1", "Option 2", "Option 3"]} />);

		const select = screen.getByRole("combobox");
		expect(select.textContent === "Option 1").toBeTruthy();
		// logRoles(select);

		await user.click(select);

		const option1 = screen.getByRole("option", { name: "Option 2" });

		await user.click(option1);

		const selectUpdated = screen.getByRole("combobox");
		expect(selectUpdated.textContent === "Option 2").toBeTruthy();
		// console.log(selectUpdated.textContent);
	});
});
