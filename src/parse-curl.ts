import Shellwords from 'shellwords-ts';
// TODO --data-binary
// TODO -r, --range

/**
 * Attempt to parse the given curl string.
 */

export default function(s : any) {
  if (0 != s.indexOf('curl ')) return;
  
  var args = rewrite(Shellwords.split(s))
  
  var out : any = { url : '',method: 'GET', header: {} }
  var state = ''
  
  args.forEach(function(arg : any){
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

      case arg == '-b' || arg =='--cookie':
        state = 'cookie'
        break;

      case arg == '--compressed':
        out.header['Accept-Encoding'] = out.header['Accept-Encoding'] || 'deflate, gzip'
        break;

      case !!arg:
        switch (state) {
          case 'header':
            var field = parseField(arg)
            if(Object.prototype.toString.call(field) === '[object Array]' && field.length > 0){
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
            if(!out.hasOwnProperty('body')){
              out.body={
                mode:'application/x-www-form-urlencoded',
                params:[],
                text:''
              }
            }
            arg && out.body.params.push(str2params(arg));
            state = ''
            break; 
          case 'data-F':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST';
          if(!out.hasOwnProperty('body')){
            out.body={
              mode:'multipart/form-data',
              params:[],
              text:''
            }
          }
          arg && out.body.params.push(str2params(arg));
          state = ''
          break;
          case 'data':
            if (out.method == 'GET' || out.method == 'HEAD') out.method = 'POST';
            if(!out.hasOwnProperty('body')){
              out.body={
                mode:'application/json',
                params:[],
                text:''
              }
            }
            out.body.text+=arg;
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

function str2params(str:string) {
  let arr=str.split('=');
  if(arr.length  > 0){
    return {
      key:arr[0].trim(),
      value:arr.length > 1 ? arr[1].trim() : ''
    }
  }
}
/**
 * Rewrite args for special cases such as -XPUT.
 */

function rewrite(args : any) {
  return args.reduce(function(args : any, a : any){
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

function parseField(s : any) {
  return s.split(/:(.+)/)
}

/**
 * Check if `s` looks like a url.
 */

function isURL(s : any) {
  // TODO: others at some point
  return /^https?:\/\//.test(s)
}
