import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

import TemplateService from "../Services/template.service";
import DocumentService from "../Services/document.service";

function Generate() {
	const [current_templates, setCurrentTemplates] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [selectedJSON, setSelectedJSON] = useState();

	const [downloadURL, setDownloadURL] = useState();

	const changeJSON = (event) => {
		setSelectedJSON(event.target.files[0]);
	};

	function display_message(elementId) {
		document.getElementById(elementId).style.display = "block";
	}

	function display_message(elementId) {
		document.getElementById(elementId).style.display = "block";
	}
	function hide_message(id) {
		var elemento = document.getElementById(id);
		if (elemento !== undefined && elemento !== null)
			elemento.style.display = "none";
	}

	function hide_everything() {
		document.getElementById("sucessoGenerate").style.display = "none";
		document.getElementById("erroRetrieve").style.display = "none";
		document.getElementById("erroInvalidTemplate").style.display = "none";
		document.getElementById("erroInvalidJson").style.display = "none";
	}

	async function generate_document(e) {
		e.preventDefault();
		hide_everything();

		var template_element = document.getElementById("formTemplateSelect");
		var template;

		if (template_element.selectedIndex !== 0) {
			template =
				template_element.options[template_element.selectedIndex].text;
		} else {
			display_message("erroInvalidTemplate");
			return;
		}

		if (selectedJSON === undefined) {
			display_message("erroInvalidJson");
			return;
		}

		var res = await DocumentService.generate_document(
			selectedJSON,
			template
		);
		var json;
		console.log(res);

		if (res.status === undefined) {
			setErrorMessage(res);
			display_message("erroRetrieve");
			return;
		} else if (res.status !== 200) {
			json = await res.json();
			setErrorMessage(json["message"]);
			display_message("erroRetrieve");
			return;
		}

		json = await res.json();
		setSuccessMessage(json["message"]);
		display_message("sucessoGenerate");
		setDownloadURL(json["downloadURL"]);
	}

	useEffect(() => {
		async function fetchCurrentTemplates() {
			var res = await TemplateService.get_current_templates();
			var json;

			if (res.status === undefined) {
				setErrorMessage(res);
				display_message("erroRetrieve");
				return;
			} else if (res.status !== 200) {
				json = await res.json();
				setErrorMessage(json["message"]);
				display_message("erroRetrieve");
				return;
			}

			json = await res.json();

			setCurrentTemplates(json["templates"]);
		}

		fetchCurrentTemplates();
	}, []);
	return (
		<div style={{ marginLeft: "10%", marginRight: "10%", marginTop: "2%" }}>
			<h1>Document Generator</h1>
			<br />

			<div
				id={"erroRetrieve"}
				className="alert alert-danger row"
				role="alert"
				style={{
					margin: "10px auto",
					width: "90%",
					textAlign: "center",
					fontSize: "22px",
					display: "none",
					justifyContent: "center",
				}}
			>
				{errorMessage}
				<img
					src={`${process.env.PUBLIC_URL}/crossicon.png`}
					style={{ width: "5%", height: "auto", marginLeft: "8px" }}
					alt={"Close Icon"}
					onClick={() => hide_message("erroRetrieve")}
				></img>
			</div>

			<div
				id={"erroInvalidJson"}
				className="alert alert-danger row"
				role="alert"
				style={{
					margin: "10px auto",
					width: "90%",
					textAlign: "center",
					fontSize: "22px",
					display: "none",
					justifyContent: "center",
				}}
			>
				You must select a valid json file.
				<img
					src={`${process.env.PUBLIC_URL}/crossicon.png`}
					style={{ width: "5%", height: "auto", marginLeft: "8px" }}
					alt={"Close Icon"}
					onClick={() => hide_message("erroInvalidJson")}
				></img>
			</div>

			<div
				id={"erroInvalidTemplate"}
				className="alert alert-danger row"
				role="alert"
				style={{
					margin: "10px auto",
					width: "90%",
					textAlign: "center",
					fontSize: "22px",
					display: "none",
					justifyContent: "center",
				}}
			>
				You must select a valid template.
				<img
					src={`${process.env.PUBLIC_URL}/crossicon.png`}
					style={{ width: "5%", height: "auto", marginLeft: "8px" }}
					alt={"Close Icon"}
					onClick={() => hide_message("erroInvalidTemplate")}
				></img>
			</div>

			<div
				id={"sucessoGenerate"}
				className="alert alert-success row"
				role="alert"
				style={{
					margin: "10px auto",
					width: "90%",
					textAlign: "center",
					fontSize: "22px",
					display: "none",
					justifyContent: "center",
				}}
			>
				{successMessage}
				<img
					src={`${process.env.PUBLIC_URL}/crossicon.png`}
					style={{ width: "5%", height: "auto", marginLeft: "8px" }}
					alt={"Close Icon"}
					onClick={() => hide_message("sucessoGenerate")}
				></img>
			</div>

			<form onSubmit={generate_document}>
				<span>Select a document template:</span>
				<Form.Select
					id="formTemplateSelect"
					aria-label="Default select example"
					defaultValue={"DEFAULT"}
				>
					<option value="DEFAULT" disabled hidden>
						Choose a document template
					</option>
					{current_templates.map((template, key) => (
						<option key={key} value={template}>
							{template}
						</option>
					))}
				</Form.Select>
				<br />
				<Form.Group controlId="formJsonFile" className="mb-3">
					<Form.Label>Upload a JSON file</Form.Label>
					<Form.Control type="file" onChange={changeJSON} />
				</Form.Group>
				<br />
				<Button as="input" type="submit" value="Generate" />
			</form>

			{downloadURL !== undefined && (
				<button type="button">
					<a href={downloadURL} download>
						Download File!
					</a>
				</button>
			)}
		</div>
	);
}

export default Generate;
