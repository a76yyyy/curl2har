import parse from './parse-curl';
import { successResult, errorResult, NewURL, getUrlQueryArray } from 'apipost-tools';

function buildHAR(curlObj: any) {
    var har: any = {
        "method": curlObj?.method || "GET",
        "url": curlObj?.url || "",
        "queryString": [],
        "headers": [],
        "cookies": [],
        "postData": {}
    }
    try {
        const urlObj: any = NewURL(curlObj?.url);
        const searchParams = getUrlQueryArray(decodeURIComponent(urlObj?.search || '') || '');
        searchParams.length > 0 && searchParams.forEach((item) => {
            const key = item?.key;
            const value = item?.value;
            let obj: any = {};
            har.queryString.push({
                comment: obj?.description || '', // 字段描述
                name: key?.trim(), // 参数名
                value: value?.trim(), // 参数值
            });
        });
    } catch (error) {
        console.log(error, "error");
    }


    if (curlObj.hasOwnProperty('header') && curlObj.header instanceof Object) {
        for (const key in curlObj.header) {
            key && har.headers.push({
                name: key || '',
                value: curlObj.header[key] || ''
            })
        }
    }
    if (curlObj.hasOwnProperty('body') && curlObj.body instanceof Object) {
        har.postData = {
            mimeType: curlObj.body?.mode || "application/json",
            params: [],
            text: curlObj.body?.text || "",
        }
        if (curlObj.body.hasOwnProperty('params') && curlObj.body.params instanceof Array) {
            for (const param of curlObj.body.params) {
                let postDataParam: any = {
                    name: param?.key,
                    value: param?.value
                }
                if (har.postData.mimeType == 'multipart/form-data' && param?.value && /^@/.test(param?.value)) {
                    postDataParam.fileName = param.value.substr(1);
                }
                har.postData.params.push(postDataParam)
            }
        }
    }
    return har;
}

function curlToHAR(str: string) {
    try {
        var curlObj = parse(str);
        console.log(JSON.stringify(curlObj), "curlObj");

        if (Object.prototype.toString.call(curlObj) == '[object Object]' && curlObj.hasOwnProperty('url')) {
            return successResult(buildHAR(curlObj));
        } else {
            return errorResult('无效的curl地址');
        }
    } catch (error) {
        return errorResult(String(error));
    }

}
export default curlToHAR