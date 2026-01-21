---
title: 'MathJax 中的上下标位置'
category: 共讀
series: mathjax_symbol
head:
  - - meta
    - name: description
      content: 关于 MathJax 中的上下标位置。
  - - meta
    - name: keywords
      content: mathjax latex latex_symbol latex符号 subscript superscript sub sup 下标 上标 上下标 displaystyle textstyle limits
created: 2025-01-01 21:42
last_modified: 2025-01-01 21:42
---

关于 MathJax 中的上下标位置。

---

[[toc]]

#explore/mathjax #language/mathjax

## style 影响 MathJax 中的上下标

在 MathJax 中输入极限上下标时，通常会出现两种状态：极限上下标显示在符号的上方和下方，如 $\displaystyle \sum_{i=1}^{\infty} A_i$；以及，显示在符号右侧，如 $\sum_{i=1}^{\infty} A_i$。

导致这种差异的原因是：在 $\LaTeX$ 中，嵌入于文本中的公式默认以 text style 显示，将占用更小的空间从而减少对行距的影响；而以独立段落渲染的公式则应用 display style，以实现对公式本身尽可能大的可读性。故在 MathJax 中，被 `$ $` 包裹的行内公式将默认应用更紧凑的 text style，被 `$$ $$` 包裹的公式段落（多行公式）则将默认应用更宽松、可读性更高的 display style。对于可变尺寸的符号，这将影响符号的相对大小，如 $\sum A_i$ 和 $\displaystyle \sum A_i$；对于与极限有关的运算符，这将影响上下标的位置，如 $\sum_{i=1}^{\infty} A_i$ 和 $\displaystyle \sum_{i=1}^{\infty} A_i$。

注意到，在上面的段落中，两种风格的公式都在行内实现。这是因为在公式中显式指定了 `\displaystyle`。即 $\displaystyle \sum_{i=1}^{\infty} A_i$ 由 `\displaystyle \sum_{i=1}^{\infty} A_i` 渲染而来，从而覆盖了行内公式默认的 text style。

同理，如果想要在多行公式中应用 text style，需要显式指定。

例如：

- `\textstyle \sum_{i=1}^{\infty} A_i` 或仅 `\sum_{i=1}^{\infty} A_i`：$\textstyle \sum_{i=1}^{\infty} A_i$
- `\displaystyle \sum_{i=1}^{\infty} A_i`：$\displaystyle \sum_{i=1}^{\infty} A_i$
- `$$\textstyle \sum_{i=1}^{\infty} A_i$$`：
  $$\textstyle \sum_{i=1}^{\infty} A_i$$
- `$$\displaystyle \sum_{i=1}^{\infty} A_i$$` 或仅 `$$\sum_{i=1}^{\infty} A_i$$`：
  $$\sum_{i=1}^{\infty} A_i$$

## 使用 `\limits` 强制在上方和下方显示

由上文可知，text style 和 display style 不仅影响上下标位置，而且影响可变尺寸符号的相对大小。在上面的例子中，求和符号在 text style 下几乎与 $A_i$ 具有相同的高度，而在 display style 下则显然大于 $A_i$ 的高度。若要在保持可变尺寸符号较小高度的同时，在上方和下方显示极限，可以使用 `\limits`。如 $\sum \limits_{i=1}^{\infty} A_i$ (`\sum \limits_{i=1}^{\infty} A_i`)，与 $\sum_{i=1}^{\infty} A_i$ (`\sum_{i=1}^{\infty} A_i`) 具有相同的运算符高度，和 $\displaystyle \sum_{i=1}^{\infty} A_i$ (`\displaystyle \sum_{i=1}^{\infty} A_i`) j，
