const Excel = require("exceljs");

// Generate a document
exports.generate = (req, res) => {
	let template = req.files.template[0];
	let jsonfile = req.files.jsonfile[0];

	/* Validate request section */
	if (template == undefined) {
		res.status(400).send({
			message:
				"You must send a 'xlsx', 'pptx' or 'docx' file in order to generate a file.",
		});
		return;
	}

	if (jsonfile == undefined) {
		res.status(400).send({
			message: "You must send a JSON file in order to generate a file.",
		});
		return;
	}
	/* End validate request section */

	const fs = require("fs");
	let rawdata = fs.readFileSync(jsonfile.path, "utf-8");
	let json = JSON.parse(rawdata);

	let success = false;
	if (
		template.mimetype ===
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	)
		success = readJSON_writeExcel(template, json);

	// Return message
	if (success) {
		res.status(200).send({
			message: "Document generated with sucess!",
		});
	} else {
		res.status(500).send({
			message: "Error Generating the Document",
		});
	}

	// Delete temporary files
	fs.unlinkSync(jsonfile.path);
	fs.unlinkSync(template.path);

	return;
};

function readJSON_writeExcel(template, json) {
	var workbook = new Excel.Workbook();

	workbook.xlsx
		.readFile(template.path)
		.then(function () {
			let pages = Object.keys(json);
			var firstLetterIdx = "A".charCodeAt() - 1;

			pages.forEach((element) => {
				const pageJson = json[element];
				const pagename = Object.keys(pageJson);
				var worksheet = workbook.getWorksheet(String(pagename));

				pagename.forEach((element) => {
					const newJson = pageJson[element];

					const fields = Object.keys(newJson);
					fields.forEach((element) => {
						var key = Object.keys(newJson[element]);
						var col_row = String(key).match(/[a-zA-Z]+|[0-9]+/g);
						var col_number =
							col_row[0].charCodeAt() - firstLetterIdx;
						worksheet.getRow(col_row[1]).getCell(col_number).value =
							newJson[element][key];
					});
				});
			});

			workbook.xlsx.writeFile("Excel.xlsx");
		})
		.catch((err) => {
			console.error(err.message);
			return false;
		});

	return true;
}
