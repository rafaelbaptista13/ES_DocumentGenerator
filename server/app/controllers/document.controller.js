const Excel = require("exceljs");
const s3 = require("../config/bucketconfig");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const path = require("path");

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

	var fileformat = filename.split('.').pop()

	switch(fileformat){
		case 'xlsx':
			success = await readJSON_writeExcel(template_path, json);	// Open and rewrite the excel file
			break;

		case 'docx':
			success = await generateWord(template_path, json);			// populate word document
			break;
	}

	// TODO: CHECK FILE TYPE;

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

/**
 * Populate a word document with a given json data.
 * 
 * @param {*} template_path path to word template
 * @param {*} json data to put in the template
 */
function generateWord(template_path, json){

	console.log(json);

	// load docx file as binary content
	
	const content = fs.readFileSync(template_path, "binary");

	const zip  = new PizZip(content);

	// define delimiters
	const doc = new Docxtemplater(zip, {
		delimiters: { start: "${", end: "}" },
	})

	doc.modules.forEach(function (module) {
		if (module.name === "LoopModule") {
			module.prefix.start = "#";
			module.prefix.end = "#";
		}
	});

	// populate document

	try {
		doc.render()
	} catch (error) {
		console.log(error.message);
		return false;
	}
	

	// store result in s3

	let params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "templates/"+filename,
        Body: fileContent
    }


	s3.upload(params, (err, data) => {
	if (err) {
		res.status(500).send({
			message: "An error occurred while uploading the template! Please try again."
		});
	}
	})

	console.log(data.Location);		// URL of the uploaded object

	return true;
}

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
