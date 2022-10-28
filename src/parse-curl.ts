import Shellwords from 'shellwords-ts';
// TODO --data-binary
// TODO -r, --range

/**
 * Attempt to parse the given curl string.
 */

export default function (s: any) {
  if (0 != s.indexOf('curl ')) return;

  var args = rewrite(Shellwords.split(s))

  var out: any = { url: '', method: 'GET', header: {} }
  var state = ''

  args.forEach(function (arg: any) {
    switch (true) {
      case isURL(arg):
        out.url = arg
        break;

      case arg == '-A' || arg == '--user-agent':
        state = 'user-agent'
        break;

      case arg == '-H' || arg == '--header':
        state = 'header'
        break;

      case arg == '-d' || arg == '--data' || arg == '--data-ascii' || arg == '--data-raw' || arg == '--data-binary':
        state = 'data'
        break;

      case arg == '--form' || arg == '-F':
        state = 'data-F'
        break;

      case arg == '--data-urlencode':
        state = 'data-urlencode'
        break;

      case arg == '-u' || arg == '--user':
        state = 'user'
        break;

      case arg == '-I' || arg == '--head':
        out.method = 'HEAD'
        break;

      case arg == '-X' || arg == '--request':
        state = 'method'
        break;

      case arg == '-b' || arg == '--cookie':
        state = 'cookie'
        break;

      case arg == '--compressed':
        out.header['Accept-Encoding'] = out.header['Accept-Encoding'] || 'deflate, gzip'
        break;

      case !!arg:
        switch (state) {
          case 'header':
            var field = parseField(arg)
            if (Object.prototype.toString.call(field) === '[object Array]' && field.length > 0) {
              out.header[field[0]] = field.length > 1 ? field[1].trim() : '';
            }
            state = ''
            break;
          case 'user-agent':
            out.header['User-Agent'] = arg
            state = ''
            break;
          case 'data-urlencode':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST';
            if (!out.hasOwnProperty('body')) {
              out.body = {
                mode: 'application/x-www-form-urlencoded',
                params: [],
                text: ''
              }
            }
            arg && out.body.params.push(str2params(arg));
            state = ''
            break;
          case 'data-F':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST';
            if (!out.hasOwnProperty('body')) {
              out.body = {
                mode: 'multipart/form-data',
                params: [],
                text: ''
              }
            }
            arg && out.body.params.push(str2params(arg));
            state = ''
            break;
          case 'data':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST';
            if (!out.hasOwnProperty('body')) {
              out.body = {
                mode: 'application/json',
                params: [],
                text: ''
              }
            }
            try {
              let webKits = s.match(/------WebKitFormBoundary/g);
              let urlencodeds = s.match(/\&/g);
              let equals = s.match(/\=/g);
              // 参数是form-data格式参数
              if (Array.isArray(webKits) && webKits.length > 1) {
                out.body.mode = "multipart/form-data";
                out.body.params = parseField1(arg, 'form-data');
              } else if (Array.isArray(urlencodeds) && Array.isArray(equals) && urlencodeds.length > 0 && equals.length > urlencodeds.length + 1) {
                out.body.mode = "application/x-www-form-urlencoded";
                out.body.params = parseField1(arg, 'urlencoded');
              } else {
                out.body.text += arg;
              }
            } catch (error) { }
            // out.header['Content-Type'] = out.header['Content-Type'] ||  out.header['content-type'] || 'application/x-www-form-urlencoded'
            // out.body = out.body
            //   ? out.body + '&' + arg
            //   : arg
            state = ''
            break;
          case 'user':
            out.header['Authorization'] = 'Basic ' + btoa(arg)
            state = ''
            break;
          case 'method':
            out.method = arg
            state = ''
            break;
          case 'cookie':
            out.header['Set-Cookie'] = arg
            state = ''
            break;
        }
        break;
    }
  })
  return out
}

function str2params(str: string) {
  let arr = str.split('=');
  if (arr.length > 0) {
    return {
      key: arr[0].trim().replace(/\"/g, ''),
      value: arr.length > 1 ? arr[1].trim().replace(/\"/g, '') : ''
    }
  }
}

function getstr2paramsvalue(str: string) {
  let arr = str.split('=');
  if (arr.length > 0) {
    return arr.length > 1 ? arr[1].trim().replace(/\"/g, '') : '';
  }
}

/**
 * Rewrite args for special cases such as -XPUT.
 */

function rewrite(args: any) {
  return args.reduce(function (args: any, a: any) {
    if (0 == a.indexOf('-X')) {
      args.push('-X')
      args.push(a.slice(2))
    } else {
      args.push(a)
    }

    return args
  }, [])
}

/**
 * Parse header field.
 */

function parseField(s: any) {
  return s.split(/:(.+)/)
}

/**
 * Parse header field.
 */

function parseField1(s: any, mode: string) {
  try {
    let result: any = []; // 返回的参数集合
    // 参数是form-data格式参数
    if (mode === 'form-data') {
      let webKits = s.match(/------WebKitFormBoundary/g);
      if (Array.isArray(webKits) && webKits.length > 1) {
        let arr = s.split(/\\r\\n/).length > 1 ? s.split(/\\r\\n/) : s.split(/\r\n/);
        let status = 'end'; // 当前查找的状态 key(找名称)/value(查找value)/end(结束查找)
        let itemObj: any = {
          key: '',
          value: '',
          type: 'Text',
        }
        if (Array.isArray(arr) && arr.length > 0) {
          arr.forEach(item => {
            // 寻找开始或者结尾分隔符
            if (item.indexOf('------WebKitFormBoundary') > -1) {
              // 结尾符 添加对象到结果
              if (status === 'key' || status === 'value') {
                if (itemObj.key.trim().length > 0) {
                  result.push(itemObj);
                }
                status = 'key'; // 结束查找
                itemObj = {
                  key: '',
                  value: '',
                  type: 'Text',
                }
              } else {
                status = 'key'; //开始查找key 
              }
              // 寻找发送数据必填项
            } else if (status === 'key' && item.indexOf('Content-Disposition') > -1) {
              if (item.indexOf('filename=') > -1) {
                item.split('; ').forEach((i: any) => {
                  // 文件
                  if (i.indexOf('name=') > -1) {
                    itemObj.key = getstr2paramsvalue(i);
                  }
                  if (i.indexOf('filename=') > -1) {
                    itemObj.fileName = getstr2paramsvalue(i);
                    itemObj.type = 'File';
                    if (itemObj.key.trim().length <= 0) {
                      itemObj.key = itemObj.fileName;
                    }
                    if (itemObj.key.trim().length > 0) {
                      result.push(itemObj);
                    }
                    status = 'key'
                    itemObj = {
                      key: '',
                      value: '',
                      type: 'Text',
                    }
                  }
                });
              } else if (item.indexOf('name=') > -1) {
                item.split('; ').forEach((i: any) => {
                  // 正常参数
                  if (i.indexOf('name=') > -1) {
                    itemObj.key = getstr2paramsvalue(i);
                    itemObj.type = 'Text';
                    status = 'value'
                  }
                });
              }
              // 寻找发送数据value
            } else if (status === 'value') {
              if (item.trim().length > 0) {
                itemObj.value = item.trim();
              }
            }
          });
        }
      }
    } else if (mode = 'urlencoded') {
      let arr = s.split('&');
      if (arr.length > 0) {
        arr.forEach((it: any) => {
          let earr = it.split('=');
          if (earr.length > 0) {
            result.push({
              key: earr[0].trim().replace(/\"/g, ''),
              value: earr.length > 1 ? earr[1].trim().replace(/\"/g, '') : ''
            })
          }
        });
      }
    }

    return result;
  } catch (error) {
    return false;
  }
}

/**
 * Check if `s` looks like a url.
 */

function isURL(s: any) {
  // TODO: others at some point
  return /^https?:\/\//.test(s)
}
