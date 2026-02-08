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
badd +146 docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
argglobal
%argdel
edit docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
wincmd =
argglobal
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
22
sil! normal! zo
35
sil! normal! zo
36
sil! normal! zo
42
sil! normal! zo
51
sil! normal! zo
62
sil! normal! zo
79
sil! normal! zo
80
sil! normal! zo
85
sil! normal! zo
93
sil! normal! zo
98
sil! normal! zo
104
sil! normal! zo
106
sil! normal! zo
114
sil! normal! zo
119
sil! normal! zo
104
sil! normal! zo
107
sil! normal! zo
112
sil! normal! zo
120
sil! normal! zo
125
sil! normal! zo
let s:l = 146 - ((13 * winheight(0) + 14) / 28)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 146
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("docs/.vitepress/theme/components/DashboardWeekQuadrant.vue", ":p")) | buffer docs/.vitepress/theme/components/DashboardWeekQuadrant.vue | else | edit docs/.vitepress/theme/components/DashboardWeekQuadrant.vue | endif
if &buftype ==# 'terminal'
  silent file docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
endif
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
22
sil! normal! zo
35
sil! normal! zo
36
sil! normal! zo
42
sil! normal! zo
51
sil! normal! zo
62
sil! normal! zo
79
sil! normal! zo
80
sil! normal! zo
85
sil! normal! zo
93
sil! normal! zo
98
sil! normal! zo
104
sil! normal! zo
106
sil! normal! zo
114
sil! normal! zo
119
sil! normal! zo
104
sil! normal! zo
107
sil! normal! zo
112
sil! normal! zo
120
sil! normal! zo
125
sil! normal! zo
let s:l = 146 - ((13 * winheight(0) + 14) / 28)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 146
normal! 0
wincmd w
wincmd =
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
