# client dependency findings

Registry audit captured 2026-09-09. Counts are affected package entries, not unique vulnerabilities or proven exploits. Includes development dependencies. Package reachability and build/runtime exposure require per-advisory review. No dependencies were changed.

| Package | Locked version(s) | Dependency scope | Severity | Direct | Fix available |
|---|---|---|---|---|---|
| @babel/core | 7.28.5 | development only | low | False | True |
| @humanfs/node | 0.16.7 | development only | moderate | False | True |
| @remix-run/router | 1.23.0 | production dependency tree | high | False | True |
| ajv | 6.12.6 | development only | moderate | False | True |
| axios | 1.13.2 | production dependency tree | high | True | True |
| brace-expansion | 1.1.12, 2.0.2 | development only | high | False | True |
| browserslist | 4.27.0 | development only | high | False | True |
| flatted | 3.3.3 | development only | high | False | True |
| follow-redirects | 1.15.11 | production dependency tree | moderate | False | True |
| form-data | 4.0.4 | production dependency tree | high | False | True |
| glob | 10.4.5 | development only | high | False | True |
| js-yaml | 4.1.0 | development only | high | False | True |
| lodash | 4.17.21 | production dependency tree | high | False | True |
| minimatch | 3.1.2, 9.0.5 | development only | high | False | True |
| nanoid | 3.3.11 | development only | high | False | True |
| picomatch | 2.3.1, 4.0.3 | development only | high | False | True |
| postcss | 8.5.6 | development only | high | True | True |
| postcss-selector-parser | 6.1.2 | development only | low | False | True |
| react-router | 6.30.1 | production dependency tree | high | False | True |
| react-router-dom | 6.30.1 | production dependency tree | high | True | True |
| rollup | 4.53.1 | development only | high | False | True |
| vite | 7.2.2 | development only | high | True | True |

## Advisory evidence

### @babel/core

- [@babel/core: Arbitrary File Read via sourceMappingURL Comment](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) — severity low, affected range: <=7.29.0.

### @humanfs/node

- [humanfs: Recursive copy follows symlinked files and copies data from outside the source tree](https://github.com/advisories/GHSA-p498-v437-472g) — severity moderate, affected range: <0.16.8.

### @remix-run/router

- [React Router vulnerable to XSS via Open Redirects](https://github.com/advisories/GHSA-2w69-qvjg-hvjx) — severity high, affected range: <=1.23.1.
- [React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation](https://github.com/advisories/GHSA-2j2x-hqr9-3h42) — severity moderate, affected range: >=1.3.0 <1.23.3.

### ajv

- [ajv has ReDoS when using `$data` option](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) — severity moderate, affected range: <6.14.0.

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

### brace-expansion

- [brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v) — severity moderate, affected range: <1.1.13.
- [brace-expansion: Zero-step sequence causes process hang and memory exhaustion](https://github.com/advisories/GHSA-f886-m6hf-6m8v) — severity moderate, affected range: >=2.0.0 <2.0.3.
- [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — severity high, affected range: >=2.0.0 <2.1.2.
- [brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — severity high, affected range: <1.1.16.
- [brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) — severity high, affected range: <1.1.17.
- [brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash](https://github.com/advisories/GHSA-mh99-v99m-4gvg) — severity high, affected range: >=2.0.0 <2.1.3.
- [brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — severity high, affected range: >=2.0.0 <2.1.4.
- [brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — severity high, affected range: <1.1.18.

### browserslist

- [Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) — severity high, affected range: <=4.28.6.
- [Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)](https://github.com/advisories/GHSA-73wf-gq98-2v4g) — severity high, affected range: <=4.28.6.

### flatted

- [flatted vulnerable to unbounded recursion DoS in parse() revive phase](https://github.com/advisories/GHSA-25h7-pfq9-p65f) — severity high, affected range: <3.4.0.
- [Prototype Pollution via parse() in NodeJS flatted](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh) — severity high, affected range: <=3.4.1.

### follow-redirects

- [follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets](https://github.com/advisories/GHSA-r4q5-vmmm-2653) — severity moderate, affected range: <=1.15.11.

### form-data

- [form-data: CRLF injection in form-data via unescaped multipart field names and filenames](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — severity high, affected range: >=4.0.0 <4.0.6.

### glob

- [glob CLI: Command injection via -c/--cmd executes matches with shell:true](https://github.com/advisories/GHSA-5j98-mcp5-4vw2) — severity high, affected range: >=10.2.0 <10.5.0.

### js-yaml

- [js-yaml has prototype pollution in merge (<<)](https://github.com/advisories/GHSA-mh29-5h37-fv8m) — severity moderate, affected range: >=4.0.0 <4.1.1.
- [JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases](https://github.com/advisories/GHSA-h67p-54hq-rp68) — severity moderate, affected range: >=4.0.0 <=4.1.1.
- [js-yaml: YAML merge-key chains can force quadratic CPU consumption](https://github.com/advisories/GHSA-52cp-r559-cp3m) — severity high, affected range: >=4.0.0 <4.3.0.
- [JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) — severity high, affected range: >=4.0.0 <4.3.1.
- [js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources](https://github.com/advisories/GHSA-2883-xcg3-v3hh) — severity high, affected range: >=4.0.0 <4.3.2.

### lodash

- [lodash vulnerable to Code Injection via `_.template` imports key names](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) — severity high, affected range: >=4.0.0 <=4.17.23.
- [lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`](https://github.com/advisories/GHSA-f23m-r3pf-42rh) — severity moderate, affected range: <=4.17.23.
- [Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) — severity moderate, affected range: >=4.0.0 <=4.17.22.

### minimatch

- [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) — severity high, affected range: <3.1.3.
- [minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern](https://github.com/advisories/GHSA-3ppc-4f35-3m26) — severity high, affected range: >=9.0.0 <9.0.6.
- [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) — severity high, affected range: <3.1.3.
- [minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments](https://github.com/advisories/GHSA-7r86-cg39-jmmj) — severity high, affected range: >=9.0.0 <9.0.7.
- [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) — severity high, affected range: <3.1.4.
- [minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions](https://github.com/advisories/GHSA-23c5-xmqv-rm74) — severity high, affected range: >=9.0.0 <9.0.7.

### nanoid

- [nanoid: non-secure generators can loop indefinitely with negative size](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) — severity high, affected range: <3.3.16.
- [nanoid: custom generators can loop indefinitely when size is zero](https://github.com/advisories/GHSA-2v37-7h3g-55p8) — severity high, affected range: <3.3.18.
- [nanoid: Integer Overflow or Wraparound](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) — severity high, affected range: <3.3.12.

### picomatch

- [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) — severity moderate, affected range: <2.3.2.
- [Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching](https://github.com/advisories/GHSA-3v7f-55p6-f55p) — severity moderate, affected range: >=4.0.0 <4.0.4.
- [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) — severity high, affected range: <2.3.2.
- [Picomatch has a ReDoS vulnerability via extglob quantifiers](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) — severity high, affected range: >=4.0.0 <4.0.4.

### postcss

- [PostCSS has XSS via Unescaped </style> in its CSS Stringify Output](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) — severity moderate, affected range: <8.5.10.
- [PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments](https://github.com/advisories/GHSA-6g55-p6wh-862q) — severity high, affected range: <=8.5.11.
- [PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) — severity moderate, affected range: <=8.5.22.
- [PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure](https://github.com/advisories/GHSA-r28c-9q8g-f849) — severity high, affected range: <=8.5.17.

### postcss-selector-parser

- [postcss-selector-parser allows denial of service through uncontrolled AST recursion](https://github.com/advisories/GHSA-w9m9-85wc-3x92) — severity low, affected range: >=6.1.0 <6.1.3.

### react-router

- Inherited through dependency: @remix-run/router
- [React Router has unexpected external redirect via untrusted paths](https://github.com/advisories/GHSA-9jcx-v3wj-wh4m) — severity moderate, affected range: >=6.0.0 <6.30.2.
- [React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass)](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) — severity moderate, affected range: >=6.0.0 <7.18.0.
- [React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg) — severity moderate, affected range: >=6.4.0 <7.18.0.
- [React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation](https://github.com/advisories/GHSA-2j2x-hqr9-3h42) — severity moderate, affected range: >=6.7.0 <6.30.4.

### react-router-dom

- Inherited through dependency: @remix-run/router
- Inherited through dependency: react-router

### rollup

- [Rollup 4 has Arbitrary File Write via Path Traversal](https://github.com/advisories/GHSA-mw96-cpmx-2vgc) — severity high, affected range: >=4.0.0 <4.59.0.

### vite

- [Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling](https://github.com/advisories/GHSA-4w7w-66w2-5vf9) — severity moderate, affected range: >=7.0.0 <=7.3.1.
- [Vite: `server.fs.deny` bypassed with queries](https://github.com/advisories/GHSA-v2wj-q39q-566r) — severity high, affected range: >=7.1.0 <=7.3.1.
- [Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket](https://github.com/advisories/GHSA-p9ff-h696-f583) — severity high, affected range: >=7.0.0 <=7.3.1.
- [launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows](https://github.com/advisories/GHSA-v6wh-96g9-6wx3) — severity moderate, affected range: >=7.0.0 <=7.3.4.
- [vite: `server.fs.deny` bypass on Windows alternate paths](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) — severity high, affected range: >=7.0.0 <=7.3.4.

