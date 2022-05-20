import {urlAPI} from "../Data/data";

class TemplateService {

    async upload_template(file) {

        let formData = new FormData()
        formData.append('file', file)
        
        var url = urlAPI + 'api/templates/upload';
        await fetch(url, {
            method:'POST',
            body: formData
        });

        return;
    }

}

export default new TemplateService()