import {urlAPI} from "../Data/data";

class DocumentService {

    async generate_document(json, template) {

        let formData = new FormData()
        formData.append('json', json)
        formData.append('template', template)
        
        var url = urlAPI + 'api/documents/';

        try {
            var res = await fetch(url, {
                method:'POST',
                body: formData
            })

            return res;
        } catch (err) {
            return "Unable to reach server to perform upload operation! Please try again later."
        }     
    }

}

export default new DocumentService()