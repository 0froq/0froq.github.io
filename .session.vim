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
badd +248 docs/.vitepress/theme/components/DashboardView.vue
badd +43 docs/dashboard/weeks/2026-01-26.yml
badd +14 docs/.vitepress/theme/src/dashboard.data.ts
argglobal
%argdel
edit docs/.vitepress/theme/components/DashboardView.vue
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt docs/.vitepress/theme/src/dashboard.data.ts
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
20
sil! normal! zo
21
sil! normal! zo
22
sil! normal! zo
46
sil! normal! zo
55
sil! normal! zo
64
sil! normal! zo
89
sil! normal! zo
97
sil! normal! zo
101
sil! normal! zo
145
sil! normal! zo
208
sil! normal! zo
213
sil! normal! zo
235
sil! normal! zo
236
sil! normal! zo
239
sil! normal! zo
239
sil! normal! zo
240
sil! normal! zo
316
sil! normal! zo
316
sil! normal! zo
325
sil! normal! zo
368
sil! normal! zo
368
sil! normal! zo
368
sil! normal! zo
368
sil! normal! zo
368
sil! normal! zo
368
sil! normal! zo
let s:l = 249 - ((31 * winheight(0) + 21) / 42)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 249
normal! 032|
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
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
