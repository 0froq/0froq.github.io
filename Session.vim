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
badd +69 docs/.vitepress/theme/components/PageHeader.vue
badd +132 docs/.vitepress/theme/components/NavLayer.vue
badd +54 uno.config.mts
badd +25 docs/.vitepress/theme/style.css
badd +27 docs/.vitepress/theme/index.ts
badd +20 docs/corpus/index.md
badd +47 docs/.vitepress/theme/components/IconApp.vue
badd +24 docs/.vitepress/theme/components/NavDoing.vue
badd +1 docs/.vitepress/theme/src/safeIcon.json
badd +18 docs/.vitepress/theme/Layout.vue
badd +2 docs/.vitepress/theme/components/IconLoading.vue
badd +1 docs/.vitepress/theme/components/LinkUnderline.vue
badd +5 package.json
badd +76 docs/600_exitus/620_roadmap/build_a_blog_site_1.md.bak
badd +18 docs/.vitepress/config.mts
badd +26 docs/600_exitus/620_roadmap/build_a_blog_site_2.md.bak
badd +21 docs/500_vigil/vig_20251011.md
badd +139 docs/600_exitus/610_log/_241023.md
badd +41 docs/600_exitus/610_log/about_the_site.md
badd +1 docs/.vitepress/markdown-it-shims.d.ts
badd +14 docs/.vitepress/theme/components/PageContent.vue
badd +29 docs/.vitepress/theme/src/posts.data.ts
argglobal
%argdel
edit package.json
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt docs/.vitepress/theme/src/posts.data.ts
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
1
sil! normal! zo
let s:l = 32 - ((31 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 32
let s:c = 45 - ((38 * winwidth(0) + 55) / 110)
if s:c > 0
  exe 'normal! ' . s:c . '|zs' . 45 . '|'
else
  normal! 045|
endif
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
