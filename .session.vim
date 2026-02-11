let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/2_areas/knowledge_management/blog
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +72 docs/.vitepress/theme/components/HomeTags.vue
badd +12 docs/.vitepress/theme/components/TagTreeNode.vue
badd +30 docs/.vitepress/theme/components/TagDisplay.vue
badd +2 docs/.vitepress/generated/tags.json
badd +8 docs/tags/index.md
badd +6 docs/index.md
badd +13 docs/corpus/500_vigil/vig_211009.md
badd +13 docs/corpus/500_vigil/vig_220513.md
badd +13 docs/corpus/500_vigil/vig_220606.md
badd +15 docs/corpus/500_vigil/vig_241023.md
badd +13 docs/corpus/500_vigil/vig_220622.md
badd +13 docs/corpus/500_vigil/vig_220713.md
badd +13 docs/corpus/500_vigil/vig_220719.md
badd +13 docs/corpus/500_vigil/vig_220729.md
badd +13 docs/corpus/500_vigil/vig_220809.md
badd +13 docs/corpus/500_vigil/vig_220813.md
badd +13 docs/corpus/500_vigil/vig_220817.md
badd +13 docs/corpus/500_vigil/vig_220828.md
badd +13 docs/corpus/500_vigil/vig_240328.md
badd +13 docs/corpus/500_vigil/vig_240426.md
badd +13 docs/corpus/500_vigil/vig_241018.md
badd +14 docs/corpus/500_vigil/vig_20251105.md
badd +14 docs/corpus/500_vigil/vig_20251013.md
badd +14 docs/corpus/500_vigil/vig_20251011.md
badd +13 docs/posts/610_log/about_the_site.md
badd +128 docs/posts/610_log/an_obsidian_theme.md
badd +20 docs/posts/610_log/build_a_blog_site_flag.md
badd +36 docs/posts/610_log/long_time_no_see.md
badd +14 docs/posts/610_log/mathjax_greek_var.md
badd +13 docs/posts/610_log/mathjax_sup_sub_position.md
badd +35 docs/posts/610_log/nagging.md
argglobal
%argdel
edit docs/posts/610_log/nagging.md
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt docs/posts/610_log/mathjax_sup_sub_position.md
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 35 - ((16 * winheight(0) + 16) / 33)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 35
normal! 09|
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
