import parse from './parse-curl';

function buildHAR(curlObj: any) {
    var har: any = {
        "method": curlObj?.method || "GET",
        "url":curlObj?.url || "",
        "queryString": [],
        "headers": [],
        "cookies": [],
        "postData": {}
    }
    if(curlObj.hasOwnProperty('header') && curlObj.header instanceof Object){
        for (const key in curlObj.header) {
            key && har.headers.push({
                name:key || '',
                value:curlObj.header[key] || ''
            })
        }
    }
    if(curlObj.hasOwnProperty('body') && curlObj.body instanceof Object){
        har.postData={
            mimeType: curlObj.body?.mode || "application/json",
            params: [],
            text : curlObj.body?.text || "",
        }
        if(curlObj.body.hasOwnProperty('params') && curlObj.body.params instanceof Array){
            for (const param of curlObj.body.params) {
                let postDataParam : any={
                    name:param?.key,
                    value:param?.value
                }
                if(har.postData.mimeType == 'multipart/form-data' && param?.value && /^@/.test(param?.value)){
                    postDataParam.fileName=param.value.substr(1);
                }
                har.postData.params.push(postDataParam)
            }
        }
    }
    return har;
}

function curlToHAR(str: string) {
    var curlObj = parse(str);
    
    if (!curlObj.hasOwnProperty('url')) {
        console.log("Invalid curl command");
        return;
    }
    
    return buildHAR(curlObj);
}
export default curlToHAR