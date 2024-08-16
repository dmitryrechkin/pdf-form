import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFField } from 'pdf-lib';

export class PdfFormFiller
{
	/**
	 * Fills the form fields of a PDF template with the provided data.
	 *
	 * @param {Uint8Array} input - The input PDF form as a byte array.
	 * @param {Record<string, string>} data - A key-value pair of field names with their values.
	 * @returns {Promise<Uint8Array>} - The modified PDF as a byte array.
	 */
	async fillForm(input: Uint8Array, data: Record<string, string>): Promise<Uint8Array>
	{
		const pdfDoc = await PDFDocument.load(input);
		const form = pdfDoc.getForm();

		// Read the form fields
		form.getFields().forEach((field: PDFField) =>
		{
			const value = this.getValueForField(field.getName(), data);
			this.setFieldValue(field, value);
		});

		// Serialize the new PDF
		const pdfBytes = await pdfDoc.save();
		return new Uint8Array(pdfBytes);
	}

	/**
	 * Gets the value for a field from the provided data.
	 *
	 * @param {string} name - The name of the field.
	 * @param {Record<string, string>} data - The data to search for the field value.
	 * @returns {string} - The value of the field.
	 */
	private getValueForField(name: string, data: Record<string, string>): string
	{
		let value = data[name];
		if (value === undefined && name.includes('_es_'))
		{
			value = data[name.split('_es_')[0]];
		}

		return value ?? '';
	}

	/**
	 * Sets the value of a form field based on its type.
	 *
	 * @param {PDFField} field
	 * @param {string} value
	 * @returns {void}
	 */
	private setFieldValue(field: PDFField, value: string): void
	{
		if (field instanceof PDFTextField)
		{
			field.setText(value);

			return;
		}

		if (field instanceof PDFCheckBox)
		{
			if (value.toLowerCase() === 'yes' || value === 'true' || value === '1')
			{
				field.check();
			}
			else
			{
				field.uncheck();
			}

			return;
		}

		if (field instanceof PDFRadioGroup)
		{
			field.select(value);

			return;
		}

		if (field instanceof PDFDropdown)
		{
			field.select(value);

			return;
		}
	}
}
