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
	async fillForm<TypeCustomFieldValues extends TypePdfFormFieldValues = TypePdfFormFieldValues>(input: Uint8Array, data: TypeCustomFieldValues): Promise<Uint8Array>
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
	private getValueForField<TypeCustomFieldValues extends TypePdfFormFieldValues>(name: string, data: TypeCustomFieldValues): TypePdfFormFieldValue
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
			this.setCheckBoxValue(field, value);
			return;
		}

		if (field instanceof PDFRadioGroup || field instanceof PDFDropdown)
		{
			this.setRadioGroupOrDropdownValue(field, value);
			return;
		}
	}

	/**
	 * Sets the value of a checkbox field based on its type.
	 *
	 * @param {PDFCheckBox} field
	 * @param {TypePdfFormFieldValue} value
	 * @returns {void}
	 */
	private setCheckBoxValue(field: PDFCheckBox, value: TypePdfFormFieldValue): void
	{
		const lowerCasedStringValue = value?.toString().toLowerCase();

		if (lowerCasedStringValue === 'yes' || lowerCasedStringValue === 'true' || lowerCasedStringValue === '1')
		{
			field.check();
		}
		else
		{
			field.uncheck();
		}
	}

	/**
	 * Sets the value of a radio group or dropdown field based on its type.
	 *
	 * @param {PDFRadioGroup | PDFDropdown} field
	 * @param {TypePdfFormFieldValue} value
	 * @returns {void}
	 */
	private setRadioGroupOrDropdownValue(field: PDFRadioGroup | PDFDropdown, value: TypePdfFormFieldValue): void
	{
		const stringValue = value?.toString();
		const options = field.getOptions();
		const matchingOption = options.find(option => option === stringValue);

		if (matchingOption)
		{
			field.select(matchingOption);
		}
		else if (options.length > 0)
		{
			// Handle the case when the provided value doesn't match any option
			// You can throw an error, log a warning, or handle it in any other way
			// For example, you can select the first option as a fallback:
			field.select(options[0]);
		}
		else
		{
			// Handle the case when there are no options available
			// You can throw an error, log a warning, or handle it in any other way
			// For example, you can leave the field unselected:
			field.select('');
		}
	}
}
