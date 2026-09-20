# server dependency findings

Registry audit captured 2026-09-09. Counts are affected package entries, not unique vulnerabilities or proven exploits. Includes development dependencies. Package reachability and build/runtime exposure require per-advisory review. No dependencies were changed.

| Package | Locked version(s) | Dependency scope | Severity | Direct | Fix available |
|---|---|---|---|---|---|
| @puppeteer/browsers | 1.9.1 | production dependency tree | high | False | puppeteer 25.10.0; major=True |
| @xmldom/xmldom | 0.8.11 | production dependency tree | high | False | True |
| axios | 1.13.2 | production dependency tree | high | True | True |
| basic-ftp | 5.0.5 | production dependency tree | critical | False | True |
| body-parser | 1.20.3 | production dependency tree | moderate | False | True |
| brace-expansion | 1.1.12 | development only | high | False | True |
| express | 4.21.2 | production dependency tree | high | True | True |
| extract-zip | 2.0.1 | production dependency tree | high | False | puppeteer 25.10.0; major=True |
| follow-redirects | 1.15.11 | production dependency tree | moderate | False | True |
| form-data | 4.0.4 | production dependency tree | high | False | True |
| ip-address | 10.0.1 | production dependency tree | high | False | True |
| js-yaml | 4.1.0 | production dependency tree | high | False | True |
| jws | 3.2.2 | production dependency tree | high | False | True |
| lodash | 4.17.21 | production dependency tree | high | False | True |
| minimatch | 3.1.2 | development only | high | False | True |
| mongoose | 8.19.3 | production dependency tree | high | True | True |
| node-cron | 3.0.3 | production dependency tree | moderate | True | node-cron 4.6.0; major=True |
| path-to-regexp | 0.1.12 | production dependency tree | high | False | True |
| picomatch | 2.3.1 | development only | high | False | True |
| puppeteer | 21.11.0 | production dependency tree | high | True | puppeteer 25.10.0; major=True |
| puppeteer-core | 21.11.0 | production dependency tree | high | False | puppeteer 25.10.0; major=True |
| qs | 6.13.0 | production dependency tree | moderate | False | True |
| tar-fs | 3.0.4 | production dependency tree | high | False | puppeteer 25.10.0; major=True |
| underscore | 1.13.7 | production dependency tree | high | False | True |
| undici | 7.16.0 | production dependency tree | high | False | True |
| uuid | 8.3.2 | production dependency tree | moderate | False | node-cron 4.6.0; major=True |
| validator | 13.15.20 | production dependency tree | high | False | True |
| ws | 8.16.0, 8.18.3 | production dependency tree | high | False | puppeteer 25.10.0; major=True |

## Advisory evidence

### @puppeteer/browsers

- Inherited through dependency: extract-zip
- Inherited through dependency: tar-fs

### @xmldom/xmldom

- [xmldom: XML injection via unsafe CDATA serialization allows attacker-controlled markup insertion](https://github.com/advisories/GHSA-wh4c-j3r5-mjhp) — severity high, affected range: <0.8.12.
- [xmldom: Uncontrolled recursion in XML serialization leads to DoS](https://github.com/advisories/GHSA-2v35-w6hq-6mfw) — severity high, affected range: <0.8.13.
- [xmldom has XML injection through unvalidated DocumentType serialization](https://github.com/advisories/GHSA-f6ww-3ggp-fr8h) — severity high, affected range: <0.8.13.
- [xmldom has XML node injection through unvalidated processing instruction serialization](https://github.com/advisories/GHSA-x6wf-f3px-wcqx) — severity high, affected range: <0.8.13.
- [xmldom has XML node injection through unvalidated comment serialization](https://github.com/advisories/GHSA-j759-j44w-7fr8) — severity high, affected range: <0.8.13.
- [xmldom: XML fragment injection via invalid EntityReference.nodeName during requireWellFormed serialization](https://github.com/advisories/GHSA-6gmq-8vp8-gcm6) — severity moderate, affected range: >=0.7.0 <=0.8.14.
- [xmldom: Element name injection via createElement() bypasses requireWellFormed](https://github.com/advisories/GHSA-w2rr-34g9-rvrj) — severity high, affected range: >=0.7.0 <=0.8.13.
- [xmldom: Attribute name injection via setAttribute() bypasses requireWellFormed](https://github.com/advisories/GHSA-4w3w-2rp5-g8jm) — severity high, affected range: >=0.7.0 <=0.8.13.
- [xmldom: Processing Instruction Target Injection Bypasses requireWellFormed](https://github.com/advisories/GHSA-c7q8-3ch8-vqpv) — severity high, affected range: >=0.7.0 <=0.8.14.
- [xmldom: DocType `name` Injection Bypasses requireWellFormed](https://github.com/advisories/GHSA-27p8-2357-5qqv) — severity high, affected range: >=0.7.0 <=0.8.14.
- [xmldom: Parser silently accepts a not-well-formed end tag whose name is followed by a line break and trailing content](https://github.com/advisories/GHSA-6h8r-xr42-gp59) — severity moderate, affected range: >=0.7.0 <=0.8.14.
- [xmldom: Quadratic-time attribute deduplication](https://github.com/advisories/GHSA-8344-3jmq-59r6) — severity high, affected range: >=0.7.0 <=0.8.14.
- [xmldom: End-tag Whitespace-Trim Regex ReDoS — quadratic backtracking in the 0.8.x end-tag parser](https://github.com/advisories/GHSA-x4fp-j954-r2f4) — severity high, affected range: >=0.7.0 <=0.8.14.
- [xmldom: Quadratic-memory consumption](https://github.com/advisories/GHSA-965w-775f-mr7g) — severity high, affected range: >=0.7.0 <=0.8.14.
- [xmldom: Quadratic-time parsing via the malformed-input recovery path — `parseElementStartPart` re-scan and `normalize()` adjacent-text merge](https://github.com/advisories/GHSA-93r5-fhx6-vmg9) — severity high, affected range: >=0.7.0 <=0.8.14.

### axios

- [Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF](https://github.com/advisories/GHSA-3p68-rc4w-qgx5) — severity moderate, affected range: >=1.0.0 <1.15.0.
- [Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy](https://github.com/advisories/GHSA-w9j2-pvgh-6h63) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7) — severity high, affected range: >=1.0.0 <1.15.1.
- [Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `parseReviver`](https://github.com/advisories/GHSA-3w6x-2g7m-8v23) — severity moderate, affected range: >=1.0.0 <1.15.2.
- [Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams](https://github.com/advisories/GHSA-xhjh-pmcv-23jw) — severity low, affected range: >=1.0.0 <1.15.1.
- [Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream](https://github.com/advisories/GHSA-445q-vr5w-6q77) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios: no_proxy bypass via IP alias allows SSRF](https://github.com/advisories/GHSA-m7pr-hjqh-92cm) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios: HTTP adapter streamed responses bypass maxContentLength](https://github.com/advisories/GHSA-vf2m-468p-8v99) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking](https://github.com/advisories/GHSA-pf86-5x62-jrwf) — severity high, affected range: >=1.0.0 <1.15.1.
- [Axios: Header Injection via Prototype Pollution](https://github.com/advisories/GHSA-6chq-wfr3-2hj9) — severity high, affected range: >=1.0.0 <1.15.1.
- [Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion](https://github.com/advisories/GHSA-xx6v-rp6x-q39c) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios is Vulnerable to Denial of Service via __proto__ Key in mergeConfig](https://github.com/advisories/GHSA-43fc-jf86-j433) — severity high, affected range: >=1.0.0 <=1.13.4.
- [Axios has prototype pollution read-side gadgets in HTTP adapter that allow credential injection and request hijacking](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj) — severity high, affected range: >=1.0.0 <1.15.2.
- [Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain](https://github.com/advisories/GHSA-fvcv-3m26-pcqx) — severity moderate, affected range: >=1.0.0 <1.15.0.
- [Axios: unbounded recursion in toFormData causes DoS via deeply nested request data](https://github.com/advisories/GHSA-62hf-57xw-28j9) — severity moderate, affected range: >=1.0.0 <1.15.1.
- [Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection](https://github.com/advisories/GHSA-hfxv-24rg-xrqf) — severity high, affected range: >=1.0.0 <1.16.0.
- [Allocation of Resources Without Limits or Throttling in Axios](https://github.com/advisories/GHSA-777c-7fjr-54vf) — severity high, affected range: >=1.7.0 <1.16.0.
- [Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter](https://github.com/advisories/GHSA-p92q-9vqr-4j8v) — severity high, affected range: >=1.0.0 <1.16.0.
- [Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection](https://github.com/advisories/GHSA-j5f8-grm9-p9fc) — severity high, affected range: >=1.0.0 <1.16.0.
- [axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge](https://github.com/advisories/GHSA-3g43-6gmg-66jw) — severity high, affected range: >=1.0.0 <1.15.2.
- [axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy`](https://github.com/advisories/GHSA-35jp-ww65-95wh) — severity high, affected range: >=1.0.0 <1.16.0.
- [axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions](https://github.com/advisories/GHSA-898c-q2cr-xwhg) — severity moderate, affected range: >=1.0.0 <1.16.0.
- [Axios: Prototype pollution gadgets can alter axios request construction](https://github.com/advisories/GHSA-mmx7-hfxf-jppx) — severity moderate, affected range: >=1.0.0 <1.18.0.
- [Axios: Deep formToJSON Key Recursion Can Cause Denial of Service](https://github.com/advisories/GHSA-pmv8-rq9r-6j72) — severity moderate, affected range: >=1.0.0 <1.18.0.
- [Axios: HTTP/2 streamed uploads bypass `maxBodyLength`](https://github.com/advisories/GHSA-mwf2-3pr3-8698) — severity moderate, affected range: >=1.13.0 <1.18.0.
- [Axios: Nested axios option objects can consume polluted prototype values](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq) — severity moderate, affected range: >=1.0.0 <1.18.0.
- [Axios: Fetch adapter `ReadableStream` uploads bypass `maxBodyLength`](https://github.com/advisories/GHSA-jqh4-m9w3-8hp9) — severity moderate, affected range: >=1.7.0 <1.18.0.
- [Axios: Excessive recursion in formDataToJSON can cause denial of service](https://github.com/advisories/GHSA-42h9-826w-cgv3) — severity moderate, affected range: >=1.0.0 <1.18.0.

### basic-ftp

- [Basic FTP has Path Traversal Vulnerability in its downloadToDir() method](https://github.com/advisories/GHSA-5rq4-664w-9x2c) — severity critical, affected range: <5.2.0.
- [basic-ftp: Incomplete CRLF Injection Protection Allows Arbitrary FTP Command Execution via Credentials and MKD Commands](https://github.com/advisories/GHSA-6v7q-wjvx-w8wg) — severity high, affected range: <=5.2.1.
- [basic-ftp vulnerable to denial of service via unbounded memory consumption in Client.list()](https://github.com/advisories/GHSA-rp42-5vxx-qpwr) — severity high, affected range: <=5.2.2.
- [basic-ftp allows a malicious FTP server to cause client-side denial of service via unbounded multiline control response buffering](https://github.com/advisories/GHSA-rpmf-866q-6p89) — severity high, affected range: <=5.3.0.

### body-parser

- [body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement](https://github.com/advisories/GHSA-v422-hmwv-36x6) — severity low, affected range: <1.20.6.
- Inherited through dependency: qs

### brace-expansion

- [brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v) — severity moderate, affected range: <1.1.13.
- [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — severity high, affected range: <1.1.16.
- [brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) — severity high, affected range: <1.1.17.
- [brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — severity high, affected range: <1.1.18.

### express

- Inherited through dependency: body-parser
- Inherited through dependency: path-to-regexp
- Inherited through dependency: qs

### extract-zip

- [extract-zip unvalidated symlink path traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) — severity high, affected range: <=2.0.1.
- [extract-zip allows arbitrary file writes through symlink archive entries](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3) — severity high, affected range: <=2.0.1.

### follow-redirects

- [follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets](https://github.com/advisories/GHSA-r4q5-vmmm-2653) — severity moderate, affected range: <=1.15.11.

### form-data

- [form-data: CRLF injection in form-data via unescaped multipart field names and filenames](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — severity high, affected range: >=4.0.0 <4.0.6.

### ip-address

- [ip-address has XSS in Address6 HTML-emitting methods](https://github.com/advisories/GHSA-v2v4-37r5-5v8g) — severity moderate, affected range: <=10.1.0.
- [ip-address: Address4 decodes leading-zero octets as decimal while resolvers decode them as octal, allowing SSRF and trust-boundary bypass](https://github.com/advisories/GHSA-mwp4-54f8-5fhr) — severity high, affected range: <=10.3.0.

### js-yaml

- [js-yaml has prototype pollution in merge (<<)](https://github.com/advisories/GHSA-mh29-5h37-fv8m) — severity moderate, affected range: >=4.0.0 <4.1.1.
- [JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) — severity moderate, affected range: >=4.0.0 <=4.1.1.
- [js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) — severity high, affected range: >=4.0.0 <4.3.0.
- [JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) — severity high, affected range: >=4.0.0 <4.3.1.
- [js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) — severity high, affected range: >=4.0.0 <4.3.2.

### jws

- [auth0/node-jws Improperly Verifies HMAC Signature](https://github.com/advisories/GHSA-869p-cjfg-cm3x) — severity high, affected range: <3.2.3.

### lodash

- [lodash vulnerable to Code Injection via `_.template` imports key names](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) — severity high, affected range: >=4.0.0 <=4.17.23.
- [lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`](https://github.com/advisories/GHSA-f23m-r3pf-42rh) — severity moderate, affected range: <=4.17.23.
- [Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) — severity moderate, affected range: >=4.0.0 <=4.17.22.

### minimatch

- [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) — severity high, affected range: <3.1.3.
- [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) — severity high, affected range: <3.1.3.
- [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) — severity high, affected range: <3.1.4.

### mongoose

- [Mongoose's Improper Sanitization of $nor in sanitizeFilter May Allow NoSQL Injection](https://github.com/advisories/GHSA-wpg9-53fq-2r8h) — severity high, affected range: >=8.0.0 <=8.22.0.
- [Mongoose: Prototype pollution in mongoose update casting via __proto__-prefixed dotted path (Schema._getSchema/path getter)](https://github.com/advisories/GHSA-664h-wqgq-64gw) — severity moderate, affected range: >=8.0.0 <8.24.1.

### node-cron

- Inherited through dependency: uuid

### path-to-regexp

- [path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters](https://github.com/advisories/GHSA-37ch-88jc-xwx2) — severity high, affected range: <0.1.13.

### picomatch

- [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) — severity moderate, affected range: <2.3.2.
- [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) — severity high, affected range: <2.3.2.

### puppeteer

- Inherited through dependency: @puppeteer/browsers
- Inherited through dependency: puppeteer-core

### puppeteer-core

- Inherited through dependency: @puppeteer/browsers
- Inherited through dependency: ws

### qs

- [qs's arrayLimit bypass in comma parsing allows denial of service](https://github.com/advisories/GHSA-w7fw-mjwx-w883) — severity low, affected range: >=6.7.0 <=6.14.1.
- [qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion](https://github.com/advisories/GHSA-6rw7-vpxm-498p) — severity moderate, affected range: <6.14.1.
- [qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set](https://github.com/advisories/GHSA-q8mj-m7cp-5q26) — severity moderate, affected range: >=6.11.1 <=6.15.1.
- [qs: Denial of Service via Attacker Controlled isBuffer](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) — severity moderate, affected range: >=2.2.5 <6.16.0.

### tar-fs

- [tar-fs has a symlink validation bypass if destination directory is predictable with a specific tarball](https://github.com/advisories/GHSA-vj76-c3g6-qr5v) — severity high, affected range: >=3.0.0 <3.1.1.
- [tar-fs can extract outside the specified dir with a specific tarball](https://github.com/advisories/GHSA-8cj5-5rvv-wf4v) — severity high, affected range: >=3.0.0 <3.0.9.
- [tar-fs Vulnerable to Link Following and Path Traversal via Extracting a Crafted tar File](https://github.com/advisories/GHSA-pq67-2wwv-3xjx) — severity high, affected range: >=3.0.0 <3.0.7.

### underscore

- [Underscore has unlimited recursion in _.flatten and _.isEqual, potential for DoS attack](https://github.com/advisories/GHSA-qpx9-hpmf-5gmw) — severity high, affected range: <=1.13.7.

### undici

- [Undici has an unbounded decompression chain in HTTP responses on Node.js Fetch API via Content-Encoding leads to resource exhaustion](https://github.com/advisories/GHSA-g9mf-h72j-4rw9) — severity moderate, affected range: >=7.0.0 <7.18.2.
- [Undici: Malicious WebSocket 64-bit length overflows parser and crashes the client](https://github.com/advisories/GHSA-f269-vfmq-vjvj) — severity high, affected range: >=7.0.0 <7.24.0.
- [Undici has an HTTP Request/Response Smuggling issue](https://github.com/advisories/GHSA-2mjp-6q6p-2qxm) — severity moderate, affected range: >=7.0.0 <7.24.0.
- [Undici has Unbounded Memory Consumption in WebSocket permessage-deflate Decompression](https://github.com/advisories/GHSA-vrm6-8vpv-qv8q) — severity high, affected range: >=7.0.0 <7.24.0.
- [Undici has Unhandled Exception in WebSocket Client Due to Invalid server_max_window_bits Validation](https://github.com/advisories/GHSA-v9p9-hfj2-hcw8) — severity high, affected range: >=7.0.0 <7.24.0.
- [Undici has CRLF Injection in undici via `upgrade` option](https://github.com/advisories/GHSA-4992-7rv2-5pvq) — severity moderate, affected range: >=7.0.0 <7.24.0.
- [undici vulnerable to HTTP header injection via Set-Cookie percent-decoding](https://github.com/advisories/GHSA-p88m-4jfj-68fv) — severity moderate, affected range: >=7.0.0 <7.28.0.
- [undici WebSocket client vulnerable to denial of service via fragment count bypass](https://github.com/advisories/GHSA-vxpw-j846-p89q) — severity high, affected range: >=7.0.0 <7.28.0.
- [undici vulnerable to Set-Cookie SameSite attribute downgrade via permissive substring matching](https://github.com/advisories/GHSA-g8m3-5g58-fq7m) — severity low, affected range: >=7.0.0 <7.28.0.
- [undici vulnerable to cross-user information disclosure via shared cache whitespace bypass](https://github.com/advisories/GHSA-pr7r-676h-xcf6) — severity moderate, affected range: >=7.0.0 <7.28.0.
- [undici vulnerable to downstream response desynchronization via retry interceptor](https://github.com/advisories/GHSA-8xcm-r25x-g524) — severity moderate, affected range: >=7.0.0 <7.29.0.
- [undici vulnerable to cross-user information disclosure and parse-time crash via degenerate private cache directives](https://github.com/advisories/GHSA-4cwx-7wf7-3272) — severity high, affected range: >=7.0.0 <7.29.0.
- [undici vulnerable to CRLF Injection via blob-like body 'type' property](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) — severity moderate, affected range: >=7.0.0 <7.29.0.
- [undici vulnerable to cross-user information disclosure via whitespace around equals in Cache-Control directives](https://github.com/advisories/GHSA-jr45-8vmc-qm54) — severity moderate, affected range: >=7.0.0 <7.29.0.
- [undici vulnerable to cookie attribute injection via unsanitized domain and unparsed setCookie fields](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) — severity moderate, affected range: >=7.0.0 <7.29.0.
- [undici vulnerable to HTTP response queue poisoning via keep-alive socket reuse](https://github.com/advisories/GHSA-35p6-xmwp-9g52) — severity low, affected range: >=7.0.0 <7.28.0.

### uuid

- [uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — severity moderate, affected range: <11.1.1.

### validator

- [Validator is Vulnerable to Incomplete Filtering of One or More Instances of Special Elements](https://github.com/advisories/GHSA-vghf-hv5q-vc2g) — severity high, affected range: <13.15.22.

### ws

- [ws affected by a DoS when handling a request with many HTTP headers](https://github.com/advisories/GHSA-3h5v-q93c-6h6q) — severity high, affected range: >=8.0.0 <8.17.1.
- [ws: Uninitialized memory disclosure](https://github.com/advisories/GHSA-58qx-3vcg-4xpx) — severity moderate, affected range: >=8.0.0 <8.20.1.
- [ws: Memory exhaustion DoS from tiny fragments and data chunks](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) — severity high, affected range: >=8.0.0 <8.21.0.

