---
title: 'MathJax 中希腊字母的 `\var-` 变体'
category: 共讀
series: mathjax_symbol
head:
  - - meta
    - name: description
      content: 关于 MathJax 中希腊字母的 `\var-` 变体。
  - - meta
    - name: keywords
      content: mathjax latex epsilon varepsilon theta vartheta rho varrho phi varphi latex_symbol latex符号
created: 2024-09-25 14:33
last_modified: 2025-01-01 21:47
---

关于 MathJax 中希腊字母的 `\var-` 变体。

---

[[toc]]

#explore/mathjax #symbol/greek

## 小写希腊字母的 `\var-` 变体

部分小写希腊字母具有 `\var-` 变体，如：

| 渲染                      | 输入                      |
| ------------------------- | ------------------------- |
| $\epsilon$, $\varepsilon$ | `\epsilon`, `\varepsilon` |
| $\theta$, $\vartheta$     | `\theta`, `\vartheta`     |
| $\pi$, $\varpi$           | `\pi`, `\varpi`           |
| $\rho$, $\varrho$         | `\rho`, `\varrho`         |
| $\sigma$, $\varsigma$     | `\sigma`, `\varsigma`     |
| $\phi$, $\varphi$         | `\phi`, `\varphi`         |
| $\kappa$, $\varkappa$     | `\kappa`, `\varkappa`     |

其中 `\varkappa` 在 $\LaTeX$ 中由 [AMS-LaTeX](https://www.ams.org/arc/resources/amslatex-about.html) 包提供。

### 总观：Letter 或 Symbol

[_Unicode Standard, Version 16.0_](https://www.unicode.org/standard/standard.html) [Character Code Charts](https://www.unicode.org/charts/)（下简称 _Code Charts_）中的 [Greek](https://www.unicode.org/charts/PDF/U0370.pdf) 部分提及了部分字母与其变体。$\varepsilon$ (`\varepsilon`)、$\theta$ (`\theta`)、$\kappa$ (`\kappa`)、$\pi$ (`\pi`)、$\rho$ (`\rho`)、$\sigma$ (`\sigma`) 和 $\varsigma$ (`\varsigma`) 在「Letter」中被形容为 Greek small letter；而 $\vartheta$ (`\vartheta`) 、$\phi$ (`\phi`) 、$\varpi$ (`\varpi`) 、$\varkappa$ (`\varkappa`)、$\varrho$ (`\varrho`)、$\epsilon$ (`\epsilon`) 在「Variant letterforms (and symbols)」部分中被称为 Greek symbol。

[_Unicode Standard, Version 16.0_](https://www.unicode.org/standard/standard.html) [Core Spec](https://www.unicode.org/versions/Unicode16.0.0/core-spec/) （下简称 _Core Spec_）的 [Chapter 7 | Greek](https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-7/#G10832) 中明确提到，$\vartheta$、$\phi$、$\varkappa$、$\varrho$、$\epsilon$ 不可用于希腊文本中，仅能用于数学或技术用途。

### `\epsilon` 与 `\varepsilon`

形似翻转阿拉伯数字 3 的 $\varepsilon$ 被称为 Greek small letter epsilon，是于希腊文本中被使用的形式；而 $\epsilon$ 称为 Greek lunate epsilon symbol，即月形 epsilon，继承自早期的安色尔体 [^1]，被认为是「直立的 epsilon」，且如 _Core Spec_ 中所言，仅能用于数学或技术用途。

### `\theta` 与 `\vartheta`

与上一组相反，$\theta$ 被认为是 Greek small letter theta，可用于希腊文本；而 $\vartheta$ 被认为是 Greek theta symbol，也称 <u>script</u> theta，仅能用于数学或技术用途。

:::tip
_Core Spec_ 的 [Chapter 22 | Letterlike Symbols](https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-22/#G12468) 中提到，script style，即（数学）手稿风格或书法风格，有 chancery 和 roundhand 两种特定变体风格。
:::

### `\pi` 与 `\varpi`

类似地，$\pi$ 被认为是 Greek small letter pi，可用于希腊文本，在数学中用来代表圆周率常数；$\varpi$ 被认为是 Greek pi symbol，也称 omega pi，即形如 omega 的 pi，仅能用于数学或技术用途。

### `\rho` 与 `\varrho`

类似地，$\rho$ 被认为是 Greek small letter rho，可用于希腊文本；$\varrho$ 被认为是 Greek rho symbol，也称 tailed rho，即带尾的 pi，仅能用于数学或技术用途。

### `\sigma` 与 `\varsigma`

此组是最不同的一组。二者都可被用于希腊文本。不同之处在于 $\varsigma$ 为 Greek small letter final sigma，即位于词尾的 sigma 字型；$\sigma$ 则是中规中矩的 Greek small letter sigma，即 sigma 的普通字型，也可用作表示数字 200。

:::warning
注意，不要把 $\varsigma$ 和 $ϛ$[^2] (stigma) 混淆。后者是 $\sigma\tau$ (sigma-tau) 连字，也可用作表示数字 6。

从形式上区分二者可能有些困难，stigma 的圈会比 final sigma 更大，且向右延伸更远。然而由于 sigma-tau 连字不会出现在词尾，而 final sigma 也不会出现在词内部，且不会用作表示数字，故二者通常可以通过上下文较为轻易地区分开。[^3]
:::

### `\phi` 与 `\varphi`

"loopy" 型的 $\varphi$ 被认为是 Greek small letter phi，可用于希腊文本；"straight" 型的 $\phi$ 则作为 Greek phi symbol，仅能用于数学或技术用途。

### `\kappa` 与 `\varkappa`

与 $\theta$ / $\vartheta$ 相似，$\kappa$ 被认为是 Greek small letter kappa，可用于希腊文本；而 $\varkappa$ 被认为是 Greek kappa symbol，也称 script kappa，仅能用于数学或技术用途。

## 大写希腊字母的 `\var-` 变体

大部分大写希腊字母直接由相应的拉丁字母表示，如 alpha、beta、epsilon、zeta、eta、iota、kappa、mu、nu、omicron、rho、tau 和 chi。对于剩余的字母，直接输入首字母大写的字符名将渲染出直体样式，而其 `\var-` 变体则会渲染出斜体样式，如表所示：

| 渲染                      | 输入                      |
| ------------------------- | ------------------------- |
| $\Gamma$, $\varGamma$     | `\Gamma`, `\varGamma`     |
| $\Delta$, $\varDelta$     | `\Delta`, `\varDelta`     |
| $\Theta$, $\varTheta$     | `\Theta`, `\varTheta`     |
| $\Lambda$, $\varLambda$   | `\Lambda`, `\varLambda`   |
| $\Xi$, $\varXi$           | `\Xi`, `\varXi`           |
| $\Pi$, $\varPi$           | `\Pi`, `\varPi`           |
| $\Sigma$, $\varSigma$     | `\Sigma`, `\varSigma`     |
| $\Upsilon$, $\varUpsilon$ | `\Upsilon`, `\varUpsilon` |
| $\Phi$, $\varPhi$         | `\Phi`, `\varPhi`         |
| $\Psi$, $\varPsi$         | `\Psi`, `\varPsi`         |
| $\Omega$, $\varOmega$     | `\Omega`, `\varOmega`     |

[^1]: [Wikipedia, Epsilon](https://en.wikipedia.org/wiki/Epsilon)

[^2]: 由于 `\stigma` 无法通过 Markdown 中的 MathJax 输入，这里直接使用了 Unicode 字符。

[^3]: [Wikipedia, Stigma (ligature)](<https://en.wikipedia.org/wiki/Stigma_(ligature)>)
