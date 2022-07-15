curl2har 是一个curl 到 har <request> 对象 的转换器。

# 🎉 特性

# 安装

```shell
npm i curl2har
```

# 基础使用
需引入：

```js
import curl2har from 'curl2har';
const convertResult = curl2har(curl);

```
**检查结果:**

```js
convertResult.status === "error"
```
**对于不成功的转换。检查 convertResult.message**

```js
convertResult.status === "success"
```
**成功转换,harObj结果在convertResult.data中**

# 开源协议

curl2har 遵循 [MIT 协议](https://github.com/Apipost-Team/curl2har)。
