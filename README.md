
# PDF Form Utility

**PDF Form Utility is a TypeScript library designed to facilitate the filling and reading of PDF forms.** This library provides a simple and efficient way to populate PDF forms with data from a `Record<string, string>` structure and retrieve that data back from the PDF form. 

## Installation

Install the package using pnpm:

```bash
pnpm add @dmitryrechkin/pdf-form
```

## Features

- **Fill PDF Forms**: Automatically populate PDF form fields from a `Record<string, string>` structure.
- **Extract Data**: Retrieve data from filled PDF forms into a `Record<string, string>` structure.
- **Automation Friendly**: Ideal for automating workflows that involve PDF form manipulation.

## Usage

### Filling a PDF Form

```typescript
import { PdfFormFiller } from "@dmitryrechkin/pdf-form";

const formFiller = new PdfFormFiller();
const filledPdfBytes = await formFiller.fill(pdfBuffer, {
    name: "John Doe",
    date: "2024-08-15",
    reason: "Booking Request"
});

// Save or process `filledPdfBytes` as needed
```

### Reading Data from a PDF Form

```typescript
import { PdfFormReader } from "@dmitryrechkin/pdf-form";

const formReader = new PdfFormReader();
const formData = await formReader.read(filledPdfBuffer);

console.log(formData);
// Output: { name: "John Doe", date: "2024-08-15", reason: "Booking Request" }
```

## When to Use

This library is particularly useful for automating tasks that involve:

- Generating contracts, agreements, or other documents that require form filling.
- Processing completed forms to extract data for further processing or storage.
- Integrating PDF form management into larger automated workflows.

## Installation & Setup

Install the package using pnpm:

```bash
pnpm add @dmitryrechkin/pdf-form
```

Ensure that your project is set up to handle TypeScript and supports ES modules, as this library is built with modern JavaScript standards.

## Contributing

Contributions are welcome! Feel free to fork this project and submit pull requests. Before submitting, please ensure your code passes all linting and unit tests.

You can run unit tests using:

```bash
pnpm test
```
