import { React, useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap'; 

import TemplateService from '../Services/template.service';

function Generate (){

    const [current_templates, setCurrentTemplates] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");


    function display_error_message() {
        document.getElementById("erroRetrieve").style.display = "block";
    }

    function hide_message(id) {
        var elemento = document.getElementById(id)
        if (elemento !== undefined && elemento !== null)
            elemento.style.display = "none"
    }

    useEffect(() => {
            async function fetchCurrentTemplates() {

                var res = await TemplateService.get_current_templates();

                if (res.status == undefined) {
                    setErrorMessage(res)
                    display_error_message();
                    return
                }
                else if (res.status != 200) {
                    var json = await res.json();
                    setErrorMessage(json["message"])
                    display_error_message();
                    return
                }

                var json = await res.json()
                
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
                <img src={`${process.env.PUBLIC_URL}/crossicon.png`}   style={{width: "5%", height: "auto", marginLeft:"8px"}} alt={"Close Icon"} onClick={() => hide_message("erroUpload")}></img>
            </div>

            
            <span>Select a document template:</span>
            <Form.Select id='document_template_form' aria-label="Default select example" defaultValue={'DEFAULT'}>
                <option value="DEFAULT" disabled hidden>Choose a document template</option>
                {
                    current_templates.map((template, key) => <option key={key} value={template}>{template}</option>)
                }
            </Form.Select>
            <br/>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Upload a JSON file</Form.Label>
                <Form.Control type="file" />
            </Form.Group>
            <br />
            <Button as="input" type="submit" value="Generate" />{' '}
        </div>
    )
}

export default Generate;