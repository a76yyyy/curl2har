
curl-to-har 是一个curl 到 har <request> 对象 的转换器, 该项目原作者为 [apipost](https://adesign.apipost.cn/) 。

# 🎉 特性

# 安装

```shell
pnpm add @a76yyyy/curl-to-har
```

# 基础使用

需引入：

```js
import curl_to_har from '@a76yyyy/curl-to-har';
const convertResult = curl_to_har(curl);
```

**检查结果:**

```js
convertResult.status === "error"
```

**对于不成功的转换。检查 `convertResult.message`**

```js
convertResult.status === "success"
```

**成功转换, harObj 结果在 `convertResult.data` 中**

# 开源协议

curl-to-har 遵循 [MIT 协议](https://github.com/a76yyyy/curltohar)。
