import { React, useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap'; 

import TemplateService from '../Services/template.service';

function Generate (){

    const [current_templates, setCurrentTemplates] = useState([]);

    useEffect(() => {
            async function fetchCurrentTemplates() {
                var res = await TemplateService.get_current_templates();
                setCurrentTemplates(res["templates"]);
            }

            fetchCurrentTemplates()
        }, []);
    return ( 
        <div style={{marginLeft: '10%', marginRight: '10%', marginTop: '2%'}}>
            <h1>Document Generator</h1>
            <br/>
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