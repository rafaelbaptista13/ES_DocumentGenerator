import {urlAPI} from "../Data/data";

class TemplateService {

    async get_current_templates() {
        
        var url = urlAPI + '/templates/';
        
        try {

            var res = await fetch(url);

            return res;
        } catch (err) {
            return "Unable to reach server to get available templates ! Please try again later."
        }
    }

    async upload_template(file) {

        let formData = new FormData()
        formData.append('file', file)
        
        var url = urlAPI + '/templates/upload';

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

    async delete_template(template) {
    
        var url = urlAPI + '/templates/' + template;
        
        try {

            var res = await fetch(url, {
                method:'DELETE',
            })

            return res;
        } catch (err) {
            return "Unable to reach server to perform delete operation! Please try again later."
        }
    }
    

}

export default new TemplateService()