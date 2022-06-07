const s3 = require("../config/bucketconfig");
const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const htmlDocx = require("html-docx-js");
const process = require('process');

const path = require("path");
const uuid = require("uuid");
const XlsxPopulate = require("xlsx-populate");

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
		return res.status(500).send({
			message: "Template was not found.",
		});
	}

	// Temporary store the file
	fs.writeFileSync(template_path, template.Body);

	// Read json file and parse it
	let rawdata = fs.readFileSync(jsonfile.path, "utf-8");

	let json;
	try {
		json = JSON.parse(rawdata);
	} catch (err) {
		res.status(400).send({
			message: "JSON is not correctly formated",
		});
		fs.unlinkSync(jsonfile.path);
		fs.unlinkSync(template_path);
		return;
	}


	process.on('uncaughtException', (error) => {
		console.log("Uncaught Exception: " + error.message )
		res.status(500).send({
			message: "Error Generating the Document",
		});
		return;
	 });


	let extension = template_path.split(".").pop();

	let file_uid;

	console.log('extension:'+ extension );

	switch(extension){
		case 'xlsx':

		file_uid = uuid.v1() + ".xlsx";

		downloadURL = await readJSON_writeExcel(
				file_uid,
				template_path,
				json
			); // Open and rewrite the excel file
			break;

		case 'docx':

			file_uid = uuid.v1() + ".docx";
			try{
				downloadURL =  await populateDocx( file_uid, template_path, json); // populate word document
			}catch(err){
				res.status(406).send({
					message: ` ${err.properties.errors[0]} . `
				});
				return;
			}
			

			break;
		
		case 'pptx':

			file_uid = uuid.v1() + ".pptx";

			downloadURL = await populatePptx( file_uid, template_path, json);			// populate powerpoint document
			break;

		default:
			console.log("aki");
			res.status(500).send({
				message: `Invalid document format ${extension}`,
			});
			return;

	}

	// Return message
	if (downloadURL) {
		console.log("aki");
		res.status(200).send({
			message: "Document generated with sucess!",
			downloadURL: downloadURL,
		});
	} else {
		console.log("aki");
		res.status(500).send({
			message: "Error Generating the Document",
		});
	}

	// Delete temporary files
	fs.unlinkSync(jsonfile.path);
	fs.unlinkSync(template_path);
	fs.unlinkSync(file_uid);

	return;
};


/**
 * Populate a power point document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to powerpoint template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 * 
 */
async function populatePptx(file_uid, template_path, json){

		// load docx file as binary content
	
		const content = fs.readFileSync(template_path, "binary");

		const zip  = new PizZip(content);
	
		// define delimiters


		const doc = new Docxtemplater(zip, {
			delimiters: { start: "{", end: "}" },
			
		})


	
		doc.modules.forEach(function (module) {
			if (module.name === "LoopModule") {
				module.prefix.start = "#";
				module.prefix.start = "/";
			}
		});
		
		// populate document
	
		doc.render(json[0])

	
		const htmlContent = "<h2><span style='color: #99ccff;'>Use O2M as M2M relationship for Edit UI Action</span></h2> <p><br /></p> <p>For the following scenario:</p> <ul style='list-style-position: inside;'><li>Table A</li><li>Table B</li><li>Table C</li></ul> <p>Table B has a reference to Table A and to Table C. Table B is a related list on the Table A form.<br /></p> <p><br /></p> <p>If you want to relate records from Table C to Table A, making Table B behave like a M2M (when using the &#34;Edit&#34; button on the related list), the OOTB &#34;Edit...&#34; (action name &#34;sysverb_edit_om2&#34;) UI Action needs to be overridden.</p> <p><br /></p> <p>The condition of the new UI Action should be:</p> <pre class='language-javascript'><code>(new GlideRecord(current.getTableName())).canWrite() &amp;&amp; RP.isRelatedList() &amp;&amp; !RP.getListControl().isOmitEditButton()</code></pre> <p><br /></p> <p>The script should contain the following:</p> <pre class='language-javascript'><code>var uri &#61; action.getGlideURI(); var path &#61; uri.getFileFromPath(); uri.set(&#39;sysparm_m2m_ref&#39;, current.getTableName()); uri.set(&#39;sysparm_stack&#39;, &#39;no&#39;); uri.set(&#39;sysparm_query&#39;, &#39;&#39;); uri.set(&#39;sysparm_collection_related_field&#39;, &#39;&lt;field on table B that references table C&gt;&#39;); uri.set(&#39;sysparm_collection_related_file&#39;, &#39;&lt;table C name&gt;&#39;); action.setRedirectURL(uri.toString(&#39;sys_m2m_template.do&#39;));</code></pre>";
	
	
		const buf = doc.getZip().generate({
			type: "nodebuffer",
		});
	
		fs.writeFileSync((file_uid), buf);
	
	
		const fileContent = fs.readFileSync(file_uid);
		
	
		// store result in s3
	
		let params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: "documents/"+file_uid,
			Body: fileContent
		}
	
		s3.upload(params, (err) => {
		if (err) {
			res.status(500).send({
				message: "An error occurred while uploading the template! Please try again."
			});
		}	
			console.log("Upload file with success .");
		})
	

		// get document url
	
		const downloadURL = s3.getSignedUrl("getObject", {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: "documents/" + file_uid,
			Expires: 60 * 5,
		});
	
	
		return downloadURL;

}

/**
 * Populate a word document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to word template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 * 
 */
async function  populateDocx(file_uid, template_path, json){

	// load docx file as binary content
	
	const content = fs.readFileSync(template_path, "binary");

	const zip  = new PizZip(content);

	// define delimiters



	const doc = new Docxtemplater(zip, {
			delimiters: { start: "{", end: "}" },
			nullGetter: nullGetter,
		
			
		})


	doc.modules.forEach(function (module) {
		if (module.name === "LoopModule") {
			module.prefix.start = "#";
			module.prefix.start = "/";
		}
	});

	
	// populate document

	doc.render(json);



	const buf = doc.getZip().generate({
		type: "nodebuffer",
	});

	fs.writeFileSync((file_uid), buf);


	const fileContent = fs.readFileSync(file_uid);
	

	// // store result in s3

	let params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "documents/"+file_uid,
        Body: fileContent
    }

	s3.upload(params, (err) => {
	if (err) {
		res.status(500).send({
			message: "An error occurred while uploading the template! Please try again."
		});
	}	
		console.log("Upload file with success .");
	})

	// get document url

	const downloadURL = s3.getSignedUrl("getObject", {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "documents/" + file_uid,
		Expires: 60 * 5,
	});

	

	return downloadURL;
}

function nullGetter(part, scopeManager) {
    /*
        If the template is {#users}{name}{/} and a value is undefined on the
        name property:

        - part.value will be the string "name"
        - scopeManager.scopePath will be ["users"] (for nested loops, you would have multiple values in this array, for example one could have ["companies", "users"])
        - scopeManager.scopePathItem will be equal to the array [2] if
          this happens for the third user in the array.
        - part.module would be empty in this case, but it could be "loop",
          "rawxml", or or any other module name that you use.
    */

    if (!part.module) {
        // part.value contains the content of the tag, eg "name" in our example
        // By returning '{' and part.value and '}', it will actually do no replacement in reality. You could also return the empty string if you prefered.
        return "{" + part.value + "}";
    }
    if (part.module === "rawxml") {
        return "";
    }
    return "";
}

/**
 * Populate a excel document with a given json data.
 * 
 * @param {*} file_uid file identifier
 * @param {*} template_path path to excel template
 * @param {*} json data to put in the template
 * @returns temporary url to access the generated document
 */
async function readJSON_writeExcel(file_uid, template_path, json) {
	try {
		const workbook = await XlsxPopulate.fromFileAsync(template_path);

		let pages = Object.keys(json);
		pages.forEach((element) => {
			const pageJson = json[element];
			const pagenames = Object.keys(pageJson);

			pagenames.forEach((pagename) => {
				const newJson = pageJson[pagename];

				newJson.forEach((element) => {
					var key = String(Object.keys(element));
					var value = element[key];

					// Create sheet if doesnt exist
					if (workbook.sheet(pagename) === undefined) {
						workbook.addSheet(pagename);
					}
					workbook.sheet(pagename).cell(key).value(value);
				});
			});
		});

		await workbook.toFileAsync(file_uid);
	} catch (err) {
		console.error(err.message);
		return false;
	}

	// Store excel in s3 bucket
	const fileContent = fs.readFileSync(file_uid);

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: "documents/" + file_uid,
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
		Key: "documents/" + file_uid,
		Expires: 60 * 5,
	});

	return downloadURL;
};

				
