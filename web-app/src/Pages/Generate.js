import { React, useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap'; 

import TemplateService from '../Services/template.service';
import DocumentService from '../Services/document.service';

function Generate (){

    const [current_templates, setCurrentTemplates] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");


    function display_error_message(elementId) {
        document.getElementById(elementId).style.display = "block";
    }

    function hide_message(id) {
        var elemento = document.getElementById(id)
        if (elemento !== undefined && elemento !== null)
            elemento.style.display = "none"
    }

    async function generate_document(e) {
        e.preventDefault();
        var template_element = document.getElementById("formTemplateSelect");
        var json_element = document.getElementById("formJsonFile")
        
        var template;
        var json;
        var validRequest = true

        if (template_element.selectedIndex !== 0) {
            template = template_element.options[template_element.selectedIndex].text;
        } else {
            validRequest = false;
            display_error_message("erroInvalidTemplate")
        }

        if (json_element.value !== undefined && json_element.value !== "") {
            json = json_element.value
        } else {
            validRequest = false;
            display_error_message("erroInvalidJson")
        }

        if (validRequest) {
            var res = await DocumentService.generate_document(json, template);
            console.log(res);

            /* FALTA TRATAR DA RESPOSTA QUE VEM DO SERVIDOR */
        }
        
    }

    useEffect(() => {
            async function fetchCurrentTemplates() {

                var res = await TemplateService.get_current_templates();
                var json;

                if (res.status === undefined) {
                    setErrorMessage(res)
                    display_error_message("erroRetrieve");
                    return
                }
                else if (res.status !== 200) {
                    json = await res.json();
                    setErrorMessage(json["message"])
                    display_error_message("erroRetrieve");
                    return
                }

                json = await res.json()
                
                setCurrentTemplates(json["templates"]);
            }

            fetchCurrentTemplates()
        }, []);
    return ( 
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Document Generator</h1>
            <br/>

            <div id={"erroRetrieve"} className="alert alert-danger row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}} >
                {errorMessage}
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroRetrieve")}></img>
            </div>

            <div id={"erroInvalidJson"} className="alert alert-danger row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}} >
                You must select a valid json file.
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroInvalidJson")}></img>
            </div>


            <div id={"erroInvalidTemplate"} className="alert alert-danger row" role="alert" style={{margin:"10px auto", width: "90%", textAlign:"center", fontSize:"22px", display:"none", justifyContent: 'center'}} >
                You must select a valid template.
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroInvalidTemplate")}></img>
            </div>

            <form onSubmit={generate_document}>
                <span>Select a document template:</span>
                <Form.Select id='formTemplateSelect' aria-label="Default select example" defaultValue={'DEFAULT'}>
                    <option value="DEFAULT" disabled hidden>Choose a document template</option>
                    {
                        current_templates.map((template, key) => <option key={key} value={template}>{template}</option>)
                    }
                </Form.Select>
                <br/>
                <Form.Group controlId="formJsonFile" className="mb-3">
                    <Form.Label>Upload a JSON file</Form.Label>
                    <Form.Control type="file" />
                </Form.Group>
                <br />
                <Button as="input" type="submit" value="Generate" />
            </form>
        </div>
    )
}

export default Generate;