import url from 'url'; // 引入 node-url 库

import completionHttpProtocol from './completionHttpProtocol';

export interface CustomURL extends url.Url {
  source: string;
  file: string;
}

// 提取为常量
const DEFAULT_URL = 'http://www.example.com';

/**
 * 创建 CustomURL 对象
 */
const createCustomURL = (_url: string, source: string): CustomURL => {
  const parsedUrl = url.parse(_url);
  const pathname = parsedUrl.pathname || '';
  return {
    ...parsedUrl,
    source: source,
    file: (pathname.match(/\/([^\/?#]+)$/i) || ['', ''])[1],
  } as CustomURL;
};

/**
 * 根据url生成URL 对象
 */
const newURL = (_url: string): CustomURL => {
  if (Object.prototype.toString.call(_url) !== '[object String]') {
    _url = '';
  }

  // 检查 _url 是否包含协议和主机
  const urlReg = /^(?:\w+:)?\/\/(\S+)$/;
  const isValidUrl = urlReg.test(_url);

  let urls: CustomURL;
  if (isValidUrl) {
    //补全http协议前缀
    _url = completionHttpProtocol(_url);
    try {
      const parsedUrl = url.parse(_url) as CustomURL;
      urls = createCustomURL(parsedUrl.href || '', _url);
    } catch {
      urls = createCustomURL(DEFAULT_URL + _url, _url);
    }
  } else {
    const pathAndQuery = _url.split('/')[1];
    urls = createCustomURL(DEFAULT_URL + '/' + pathAndQuery, _url);
  }
  return urls;
};

export default newURL;
