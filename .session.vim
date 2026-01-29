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
badd +41 docs/dashboard/weeks/2026-01-26.yml
badd +11 docs/.vitepress/theme/src/dashboard.data.ts
badd +23 docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
badd +19 docs/.vitepress/theme/components/DashboardYear.vue
badd +19 docs/.vitepress/theme/components/DashboardVision.vue
badd +2 docs/.vitepress/theme/components/DashboardHint.vue
badd +12 docs/.vitepress/theme/src/hint.data.ts
badd +24 docs/dashboard/hint.yml
badd +3 docs/dashboard/intents/index.md
badd +3 docs/dashboard/index.md
badd +28 docs/.vitepress/theme/components/PageContent.vue
badd +46 docs/.vitepress/theme/components/HomeCorpusLayer.vue
badd +18 docs/corpus/index.md
badd +94 docs/.vitepress/theme/components/NavDoing.vue
badd +107 docs/.vitepress/theme/components/PageHeader.vue
badd +79 docs/.vitepress/theme/style.css
badd +17 docs/.vitepress/theme/components/HomeCorpus.vue
badd +174 docs/.vitepress/theme/components/PageContentTag.vue
badd +36 docs/.vitepress/theme/components/PostListSection.vue
badd +132 docs/.vitepress/theme/components/HomePosts.vue
badd +15 docs/tags/\[tag].paths.ts
badd +77 docs/.vitepress/theme/components/HomeDashboard.vue
argglobal
%argdel
edit docs/.vitepress/theme/components/HomeDashboard.vue
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
13
sil! normal! zo
14
sil! normal! zo
let s:l = 77 - ((21 * winheight(0) + 16) / 32)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 77
normal! 08|
wincmd w
argglobal
if bufexists(fnamemodify("docs/.vitepress/theme/components/PageContent.vue", ":p")) | buffer docs/.vitepress/theme/components/PageContent.vue | else | edit docs/.vitepress/theme/components/PageContent.vue | endif
if &buftype ==# 'terminal'
  silent file docs/.vitepress/theme/components/PageContent.vue
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
18
sil! normal! zo
let s:l = 22 - ((21 * winheight(0) + 16) / 32)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 22
normal! 04|
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
