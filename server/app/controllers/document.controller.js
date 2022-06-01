const Excel = require("exceljs");
const s3 = require("../config/bucketconfig");
const fs = require("fs");

// Generate a document
exports.generate = async (req, res) => {
	let jsonfile = req.files.jsonfile[0];
	let template_name = req.body.template_name;
	let template_path = "uploads/"+template_name;

	/* Validate request section */
	if (template_name == undefined) {
		res.status(400).send({
			message:
				"You must send the template file name.",
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

	// Get template from bucket
	let params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "templates/" + req.body.template_name,
	};
	const template = await s3.getObject(params).promise().catch((err) => {
		console.error(err.message);
		return false;
	});

	// Case of bucket error
	if(template === false) {
		res.status(500).send({
			message: "Template was not found.",
		});
		return;
	}

	// Temporary store the file
	fs.writeFileSync(template_path, template.Body);

	// Read json file and parse it
	let rawdata = fs.readFileSync(jsonfile.path, "utf-8");
	let json = JSON.parse(rawdata);

	let success = false;

	// TODO: CHECK FILE TYPE;
	success = await readJSON_writeExcel(template_path, json);	// Open and rewrite the excel file

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
	fs.unlinkSync(template_path);

	return;
};

function readJSON_writeExcel(template_path, json) {
	var workbook = new Excel.Workbook();

	let success = workbook.xlsx
		.readFile(template_path)
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

			// TODO: Store excel in s3 bucket

			return true;
		})
		.catch((err) => {
			console.error(err.message);
			return false;
		});

	return success;
}
