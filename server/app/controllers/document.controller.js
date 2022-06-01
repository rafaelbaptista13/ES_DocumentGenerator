const Excel = require("exceljs");
const s3 = require("../config/bucketconfig");
const fs = require("fs");

// Generate a document
exports.generate = async (req, res) => {

	/* Validate request section */
	if (req.body.template_name == undefined) {
		res.status(400).send({
			message: "You must send the template file name.",
		});
		return;
	}
	if (req.files.jsonfile == undefined) {
		res.status(400).send({
			message: "You must send a JSON file in order to generate a file.",
		});
		return;
	}
	/* End validate request section */

	let jsonfile = req.files.jsonfile[0];
	let template_name = req.body.template_name;
	let template_path = "uploads/" + template_name;


	// Get template from bucket
	let params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "templates/" + req.body.template_name,
	};
	const template = await s3
		.getObject(params)
		.promise()
		.catch((err) => {
			console.error(err.message);
			return false;
		});

	// Case of bucket error
	if (template === false) {
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

	// TODO: CHECK FILE TYPE
	let extension = template_path.split(".").pop();

	let downloadURL;
	if (extension === "xlsx")
		downloadURL = await readJSON_writeExcel(
			template_name,
			template_path,
			json
		); // Open and rewrite the excel file

	// Return message
	if (downloadURL) {
		fs.unlinkSync("Excel.xlsx");
		res.status(200).send({
			message: "Document generated with sucess!",
			downloadURL: downloadURL,
		});
	} else {
		res.status(500).send({
			message: "Error Generating the Document",
		});
	}

	// Delete temporary files
	fs.unlinkSync(jsonfile.path);
	fs.unlinkSync(template_path);
	fs.unlinkSync("Excel.xlsx");

	return;
};

async function readJSON_writeExcel(template_name, template_path, json) {
	var workbook = new Excel.Workbook();

	try {
		await workbook.xlsx.readFile(template_path);
	} catch (err) {
		console.error(err.message);
		return false;
	}

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
				var col_number = col_row[0].charCodeAt() - firstLetterIdx;
				worksheet.getRow(col_row[1]).getCell(col_number).value =
					newJson[element][key];
			});
		});
	});
	await workbook.xlsx.writeFile("Excel.xlsx");

	// Store excel in s3 bucket
	const fileContent = fs.readFileSync("Excel.xlsx");

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "generated/" + template_name,
		Body: fileContent,
	};

	await s3.upload(params, (err) => {
		if (err) {
			console.log("Erro no upload: ", err);
			return false;
		}
		console.log("Sucesso no upload.");
	});

	const downloadURL = s3.getSignedUrl("getObject", {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "generated/" + template_name,
		Expires: 60 * 5,
	});

	return downloadURL;
}
