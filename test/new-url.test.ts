// NewURL.test.ts
import apipostTools from '../src/apipost-tools';

test('NewURL function with valid URL', () => {
  const result = apipostTools.NewURL('www.example.com/test');
  // console.log(result); // 打印结果
  expect(result.protocol).toBe('http:');
  expect(result.host).toBe('www.example.com');
  expect(result.pathname).toBe('/test');
});

test('NewURL function with complex URL', () => {
  const result = apipostTools.NewURL('http://user:pass@host.com:8080/p/a/t/h?query=string#hash');
  // console.log(result); // 打印结果
  // 这个 URL 应该被正确地解析
  expect(result).toEqual({
    protocol: 'http:',
    auth: 'user:pass',
    host: 'host.com:8080',
    port: '8080',
    pathname: '/p/a/t/h',
    search: '?query=string',
    query: 'query=string',
    hash: '#hash',
    source: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
    file: 'h',
    hostname: 'host.com',
    href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
    path: '/p/a/t/h?query=string',
    slashes: true,
  });
});

test('NewURL function with invalid URL', () => {
  const result = apipostTools.NewURL('invalid url');
  // console.log(result); // 打印结果
  // 无效的 URL 应该返回一个具有默认值的对象
  expect(result.protocol).toBe('http:');
  expect(result.host).toBe('www.example.com');
});

test('NewURL function with empty string', () => {
  const result = apipostTools.NewURL('');
  // console.log(result); // 打印结果
  // 空字符串应该返回一个具有默认值的对象
  expect(result.protocol).toBe('http:');
  expect(result.host).toBe('www.example.com');
});
