# React simple styleable and accessible select

This is a simple animatable select implementation which is customisable via several components that can be passed in. It uses the [ARIA combobox pattern ](https://www.w3.org/WAI/ARIA/apg/#combobox) for accessibility and is modelled after the [sonder-ui select](https://github.com/microsoft/sonder-ui/tree/master/src/components/select) (see that page for more notes on accessibility).

# Installation and usage

```
npm install react-simple-stylable-select
```

Usage:

```js
const countries = ["France", "South Africa", "Japan", "Antigua and Barbuda", "Germany", "United Kingdom"];

<Select
	name="select"
	options={countries}
	defaultValue="United Kingdom"
	components={{
		SelectValue: ({ selectedIndex }: { selectedIndex: number }) => (
			<div
				style={{
					backgroundColor: "#333",
					padding: "0.5rem",
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
		OptionValue: ({ option, isSelected, isFocused }: { option: string, isSelected: boolean, isFocused: boolean }) => (
			<div
				style={{
					padding: "0.5rem",
					outlineOffset: "-2px",
					outline: isFocused ? "2px solid #45cd4f" : "none",
				}}
			>
				{isSelected ? "✓ " : ""}
				{option}
			</div>
		),
	}}
/>;
```

## Props

| Prop            | Type                      | Description                                                                          |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| `name`          | `string`                  | The name of the Select when submitted as part of a form                              |
| `options`       | `string[]`                | List of options                                                                      |
| `id?`           | `string`                  | HTML `id` attribute, it is passed inside                                             |
| `value?`        | `string`                  | Controllable value which can be used to set the value of the Select                  |
| `defaultValue?` | `string`                  | Initial value of the Select                                                          |
| `onChange?`     | `(value: string) => void` | A callback function which is called when the value of the Select changes             |
| `components?`   | `DisplayComponents`       | Components which allow additional html/jsx and styling to be added (see table below) |

## Anatomy

![Select view](/docs/custom-select.png)

## Display components

| Component            | Props                                     | Type                                | Description                         |
| -------------------- | ----------------------------------------- | ----------------------------------- | ----------------------------------- |
| `SelectValue?`       | `selectedIndex`                           | `number`                            | The selected option                 |
| `OptionListWrapper?` | `children`                                | `React.ReactNode`                   | Wraps all options                   |
| `OptionValue?`       | `option`<br/>`isSelected`<br/>`isFocused` | `string`<br>`boolean`<br/>`boolean` | Wraps each option                   |
| `Icon?`              |                                           | `React.ElementType`                 | Any html/jsx can be used as an icon |
