import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFField } from 'pdf-lib';
import { type TypePdfFormFieldValue, type TypePdfFormFieldValues } from './Type';

export class PdfFormFiller
{
	/**
	 * Fills the form fields of a PDF template with the provided data.
	 *
	 * @param {Uint8Array} input - The input PDF form as a byte array.
	 * @param {RTypePdfFormValues} data - A key-value pair of field names with their values.
	 * @returns {Promise<Uint8Array>} - The modified PDF as a byte array.
	 */
	async fillForm(input: Uint8Array, data: TypePdfFormFieldValues): Promise<Uint8Array>
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
	 * @param {TypePdfFormFieldValues} data - The data to search for the field value.
	 * @returns {TypePdfFormFieldValue} - The value of the field.
	 */
	private getValueForField(name: string, data: TypePdfFormFieldValues): TypePdfFormFieldValue
	{
		let value = name in data ? data[name] : undefined;
		if (value === undefined && name.includes('_es_'))
		{
			value = data[name.split('_es_')[0]];
		}

		return value;
	}

	/**
	 * Sets the value of a form field based on its type.
	 *
	 * @param {PDFField} field
	 * @param {TypePdfFormFieldValue} value
	 * @returns {void}
	 */
	private setFieldValue(field: PDFField, value: TypePdfFormFieldValue): void
	{
		const stringValue = value?.toString();
		if (field instanceof PDFTextField)
		{
			field.setText(stringValue);

			return;
		}

		if (field instanceof PDFCheckBox)
		{
			const lowerCasedStringValue = stringValue?.toLowerCase();

			if (lowerCasedStringValue === 'yes' || lowerCasedStringValue === 'true' || lowerCasedStringValue === '1')
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
			field.select(stringValue ?? '');

			return;
		}

		if (field instanceof PDFDropdown)
		{
			field.select(stringValue ?? '');

			return;
		}
	}
}
