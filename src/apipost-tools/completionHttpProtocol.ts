// 提取为常量
const HTTP = 'http://';
const HTTPS = 'https://';

/**
 * 检查一个字符串是否以 http:// 或 https:// 开头
 */
const startsWithHttpOrHttps = (str: string) => {
  const lowerStr = str.toLowerCase();
  return lowerStr.startsWith(HTTP) || lowerStr.startsWith(HTTPS);
};

/**
 * 补全 http 协议前缀
 */
const completionHttpProtocol = (data: any) => {
  if (Object.prototype.toString.call(data) === '[object String]') {
    if (!startsWithHttpOrHttps(data)) {
      data = `${HTTP}${data}`;
    }
  } else if (
    Object.prototype.toString.call(data) === '[object Object]' &&
    data.hasOwnProperty('url')
  ) {
    if (Object.prototype.toString.call(data?.url) === '[object String]') {
      if (!startsWithHttpOrHttps(data.url)) {
        data.url = `${HTTP}${data.url}`;
      }
    }
  }
  return data;
};

export default completionHttpProtocol;
