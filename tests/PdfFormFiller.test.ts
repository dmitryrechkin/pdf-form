import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { PdfFormFiller } from '../src/PdfFormFiller';

describe('PdfFormFiller', () =>
{
	const pdfFormFiller = new PdfFormFiller();

	it('should fill a text field in the PDF form', async () =>
	{
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([550, 750]);
		const form = pdfDoc.getForm();

		page.drawText('Enter your favorite superhero:', { x: 50, y: 700, size: 20 });

		const superheroField = form.createTextField('favorite.superhero');
		superheroField.setText('One Punch Man');
		superheroField.addToPage(page, { x: 55, y: 640 });

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const data = { 'favorite.superhero': 'Spider-Man' };

		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		const filledPdfDoc = await PDFDocument.load(filledPdfBuffer);
		const filledForm = filledPdfDoc.getForm();

		const filledSuperhero = filledForm.getTextField('favorite.superhero').getText();

		expect(filledSuperhero).toBe('Spider-Man');
	});

	it('should fill a radio button in the PDF form', async () =>
	{
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([550, 750]);
		const form = pdfDoc.getForm();

		page.drawText('Select your favorite rocket:', { x: 50, y: 600, size: 20 });
		page.drawText('Falcon Heavy', { x: 120, y: 560, size: 18 });
		page.drawText('Saturn IV', { x: 120, y: 500, size: 18 });

		const rocketField = form.createRadioGroup('favorite.rocket');
		rocketField.addOptionToPage('Falcon Heavy', page, { x: 55, y: 540 });
		rocketField.addOptionToPage('Saturn IV', page, { x: 55, y: 480 });
		rocketField.select('Saturn IV');

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const data = { 'favorite.rocket': 'Falcon Heavy' };

		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		const filledPdfDoc = await PDFDocument.load(filledPdfBuffer);
		const filledForm = filledPdfDoc.getForm();

		const filledRocket = filledForm.getRadioGroup('favorite.rocket').getSelected();

		expect(filledRocket).toBe('Falcon Heavy');
	});

	it('should fill a checkbox in the PDF form', async () =>
	{
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([550, 750]);
		const form = pdfDoc.getForm();

		page.drawText('Select your favorite gundams:', { x: 50, y: 440, size: 20 });
		page.drawText('Exia', { x: 120, y: 400, size: 18 });
		page.drawText('Kyrios', { x: 120, y: 340, size: 18 });

		const exiaField = form.createCheckBox('gundam.exia');
		const kyriosField = form.createCheckBox('gundam.kyrios');

		exiaField.addToPage(page, { x: 55, y: 380 });
		kyriosField.addToPage(page, { x: 55, y: 320 });

		exiaField.check();

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const data = { 'gundam.exia': 'true', 'gundam.kyrios': 'true' };

		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		const filledPdfDoc = await PDFDocument.load(filledPdfBuffer);
		const filledForm = filledPdfDoc.getForm();

		const filledExia = filledForm.getCheckBox('gundam.exia').isChecked();
		const filledKyrios = filledForm.getCheckBox('gundam.kyrios').isChecked();

		expect(filledExia).toBe(true);
		expect(filledKyrios).toBe(true);
	});

	it('should fill a dropdown in the PDF form', async () =>
	{
		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([550, 750]);
		const form = pdfDoc.getForm();

		page.drawText('Select your favorite planet:', { x: 50, y: 280, size: 20 });

		const planetsField = form.createDropdown('favorite.planet');
		planetsField.addOptions(['Venus', 'Earth', 'Mars', 'Pluto']);
		planetsField.select('Pluto');
		planetsField.addToPage(page, { x: 55, y: 220 });

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = new Uint8Array(pdfBytes);

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const data = { 'favorite.planet': 'Mars' };

		const filledPdfBuffer = await pdfFormFiller.fillForm(pdfBuffer, data);

		const filledPdfDoc = await PDFDocument.load(filledPdfBuffer);
		const filledForm = filledPdfDoc.getForm();

		const filledPlanet = filledForm.getDropdown('favorite.planet').getSelected();

		expect(filledPlanet).toEqual(['Mars']);
	});

	it('should fill Test2.pdf template and save as Output.pdf for manual review', async () =>
	{
		const testPdfPath = path.resolve(__dirname, './Test.pdf');
		const testPdfBuffer = fs.readFileSync(testPdfPath);

		const data = { name: 'Name', email: 'name@gmail.com', phone: '+1234567890', date: '2022-01-01', signature: 'Signature' };

		const filledPdfBuffer = await pdfFormFiller.fillForm(new Uint8Array(testPdfBuffer), data);

		const outputPdfPath = path.resolve(__dirname, './Output.pdf');
		fs.writeFileSync(outputPdfPath, Buffer.from(filledPdfBuffer));

		expect(fs.existsSync(outputPdfPath)).toBe(true);
	});
});
