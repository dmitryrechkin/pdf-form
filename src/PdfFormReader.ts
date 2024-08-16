import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFField } from 'pdf-lib';

export class PdfFormReader
{
	/**
	 * Reads the form fields of a PDF and returns their values.
	 *
	 * @param {Uint8Array} input - The input PDF form as a byte array.
	 * @returns {Promise<Record<string, string>>} - The form field values as a key-value pair.
	 */
	async readForm(input: Uint8Array): Promise<Record<string, string>>
	{
		const pdfDoc = await PDFDocument.load(input);
		const form = pdfDoc.getForm();
		const data: Record<string, string> = {};

		// Read the form fields
		form.getFields().forEach((field: PDFField) =>
		{
			const name = field.getName();
			// Add a variation of the name without the '_es_' suffix, which can be preset in Signature or Date fields
			const nameBeforeEs = name.split('_es_')[0];
			const value = this.getFieldValue(field);

			data[name] = value;
			data[nameBeforeEs] = value;
		});

		return data;
	}

	/**
	 * Gets the value of a form field based on its type.
	 *
	 * @param {PDFField} field
	 * @returns {string}
	 */
	private getFieldValue(field: PDFField): string
	{
		if (field instanceof PDFTextField)
		{
			return field.getText() ?? '';
		}

		if (field instanceof PDFCheckBox)
		{
			return field.isChecked() ? 'true' : 'false';
		}

		if (field instanceof PDFRadioGroup)
		{
			return field.getSelected() || '';
		}

		if (field instanceof PDFDropdown)
		{
			return field.getSelected().join(', ');
		}

		return '';
	}
}
