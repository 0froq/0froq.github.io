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
badd +63 docs/dashboard/weeks/2026-01-26.yml
badd +11 docs/.vitepress/theme/src/dashboard.data.ts
badd +23 docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
badd +19 docs/.vitepress/theme/components/DashboardYear.vue
badd +19 docs/.vitepress/theme/components/DashboardVision.vue
badd +2 docs/.vitepress/theme/components/DashboardHint.vue
badd +12 docs/.vitepress/theme/src/hint.data.ts
badd +24 docs/dashboard/hint.yml
badd +3 docs/dashboard/intents/index.md
badd +3 docs/dashboard/index.md
badd +22 docs/.vitepress/theme/components/PageContent.vue
badd +46 docs/.vitepress/theme/components/HomeCorpusLayer.vue
badd +10 docs/corpus/index.md
badd +94 docs/.vitepress/theme/components/NavDoing.vue
badd +107 docs/.vitepress/theme/components/PageHeader.vue
badd +79 docs/.vitepress/theme/style.css
badd +44 docs/.vitepress/theme/components/HomeCorpus.vue
badd +174 docs/.vitepress/theme/components/PageContentTag.vue
badd +36 docs/.vitepress/theme/components/PostListSection.vue
badd +132 docs/.vitepress/theme/components/HomePosts.vue
badd +15 docs/tags/\[tag].paths.ts
badd +78 docs/.vitepress/theme/components/HomeDashboard.vue
badd +2 docs/corpus/400_delirium/del_20251015.md
badd +101 docs/.vitepress/theme/components/PageContentPost.vue
badd +14 docs/dashboard/backlog/2026-02.yml
badd +12 docs/.vitepress/theme/src/backlog.data.ts
badd +18 docs/.vitepress/theme/components/DashboardBacklog.vue
badd +9 .snippets/yaml.json
argglobal
%argdel
edit docs/dashboard/backlog/2026-02.yml
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
balt .snippets/yaml.json
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 14 - ((12 * winheight(0) + 9) / 19)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 14
normal! 02|
wincmd w
argglobal
if bufexists(fnamemodify("docs/.vitepress/theme/components/PageContent.vue", ":p")) | buffer docs/.vitepress/theme/components/PageContent.vue | else | edit docs/.vitepress/theme/components/PageContent.vue | endif
if &buftype ==# 'terminal'
  silent file docs/.vitepress/theme/components/PageContent.vue
endif
balt docs/.vitepress/theme/components/HomeDashboard.vue
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
19
sil! normal! zo
let s:l = 21 - ((8 * winheight(0) + 9) / 19)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 21
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
