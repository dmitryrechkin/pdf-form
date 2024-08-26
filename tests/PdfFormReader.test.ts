import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { PdfFormReader } from '../src/PdfFormReader';
import { PdfFormFiller } from '../src/PdfFormFiller';

describe('PdfFormReader', () =>
{
	const pdfFormFiller = new PdfFormFiller();
	const pdfFormReader = new PdfFormReader();

	it('should correctly read text fields from a filled PDF form', async () =>
	{
		// Create a simple PDF form with text fields
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([600, 400]);

		const form = pdfDoc.getForm();
		const nameField = form.createTextField('name');
		nameField.addToPage(page, { x: 50, y: 300 });

		const emailField = form.createTextField('email');
		emailField.addToPage(page, { x: 50, y: 250 });

		// Save the PDF as a Uint8Array
		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// Data to fill the form
		const data = { name: 'Name', email: 'name@gmail.com' };

		// Fill the form
		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		// Read the filled form
		const formData = await pdfFormReader.readForm(filledPdfBuffer);

		// Verify the form data
		expect(formData.name).toBe('Name');
		expect(formData.email).toBe('name@gmail.com');
	});

	it('should correctly read checkbox fields from a filled PDF form', async () =>
	{
		// Create a simple PDF form with checkboxes
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([600, 400]);

		const form = pdfDoc.getForm();
		const checkboxField = form.createCheckBox('subscribe');
		checkboxField.addToPage(page, { x: 50, y: 300 });

		// Save the PDF as a Uint8Array
		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// Data to fill the form
		const data = { subscribe: 'true' };

		// Fill the form
		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		// Read the filled form
		const formData = await pdfFormReader.readForm(filledPdfBuffer);

		// Verify the form data
		expect(formData.subscribe).toBe('true');
	});

	it('should correctly read radio group fields from a filled PDF form', async () =>
	{
		// Create a simple PDF form with radio group
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([600, 400]);

		const form = pdfDoc.getForm();
		const radioGroup = form.createRadioGroup('gender');
		radioGroup.addOptionToPage('Male', page, { x: 50, y: 300 });
		radioGroup.addOptionToPage('Female', page, { x: 50, y: 250 });

		// Save the PDF as a Uint8Array
		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// Data to fill the form
		const data = { gender: 'Female' };

		// Fill the form
		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		// Read the filled form
		const formData = await pdfFormReader.readForm(filledPdfBuffer);

		// Verify the form data
		expect(formData.gender).toBe('Female');
	});

	it('should correctly read dropdown fields from a filled PDF form into a custom type', async () =>
	{
		// Create a simple PDF form with a dropdown
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([600, 400]);

		const form = pdfDoc.getForm();
		const dropdownField = form.createDropdown('country');
		dropdownField.addOptions(['USA', 'Canada', 'UK']);
		dropdownField.addToPage(page, { x: 50, y: 300 });

		// Save the PDF as a Uint8Array
		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// Data to fill the form
		const data = { country: 'Canada' };

		// Fill the form
		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		type CustomFieldValues = { country: string };

		// Read the filled form
		const formData: CustomFieldValues = await pdfFormReader.readForm<CustomFieldValues>(filledPdfBuffer);

		// Verify the form data
		expect(formData.country).toBe('Canada');
	});

	it('should fill Test.pdf template and read back as Output.pdf for manual review', async () =>
	{
		// Load Test.pdf from the file system
		const testPdfPath = path.resolve(__dirname, './Test.pdf');
		const testPdfBuffer = fs.readFileSync(testPdfPath);

		await PDFDocument.load(testPdfBuffer);//works

		// Data to fill the template
		const data = { name: 'Name', email: 'name@gmail.com', phone: '+1234567890', date: '2022-01-01', signature: 'Signature' };

		// Fill the template
		const filledPdfBuffer = await pdfFormFiller.fillForm(new Uint8Array(testPdfBuffer), data);

		// Read the filled form
		const formData = await pdfFormReader.readForm(filledPdfBuffer);

		// Save the result as Output.pdf for manual review
		const outputPdfPath = path.resolve(__dirname, './Output.pdf');
		fs.writeFileSync(outputPdfPath, Buffer.from(filledPdfBuffer));

		// Verify the form data
		expect(formData.name).toBe('Name');
		expect(formData.email).toBe('name@gmail.com');
		expect(formData.phone).toBe('+1234567890');
		expect(formData.date).toBe('2022-01-01');
		expect(formData.signature).toBe('Signature');

		// Optionally, you can verify the content here, but the goal is manual review
		expect(fs.existsSync(outputPdfPath)).toBe(true);
	});
});
