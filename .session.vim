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
badd +177 docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
badd +29 docs/.vitepress/theme/components/DashboardBacklog.vue
badd +18 docs/.vitepress/theme/src/backlog.data.ts
badd +6 docs/dashboard/backlog/2026-02.yml
badd +36 docs/.vitepress/theme/components/QSeperator.vue
badd +11 docs/.vitepress/utils/renderMdInline.ts
badd +4 docs/dashboard/years/2026.yml
badd +15 docs/index.md
badd +49 docs/.vitepress/theme/components/PageContent.vue
badd +55 docs/.vitepress/theme/components/ContentNav.vue
badd +9 docs/.vitepress/theme/components/ContentHome.vue
badd +15 docs/.vitepress/theme/components/ContentCorpusLayer.vue
badd +1 docs/.vitepress/theme/components/ContentArticle.vue
badd +84 docs/.vitepress/theme/components/ProgressBarHeader.vue
badd +2 docs/.vitepress/theme/components/ContentDashboardGuidance.vue
badd +8 docs/.vitepress/theme/components/DashboardGuidance.vue
badd +16 docs/.vitepress/theme/components/ContentDashboardIntents.vue
badd +4 docs/.vitepress/theme/components/DashboardVision.vue
badd +4 docs/.vitepress/theme/components/DashboardYear.vue
badd +74 docs/.vitepress/theme/components/ContentNotFound.vue
badd +14 docs/.vitepress/theme/components/ContentTags.vue
badd +2 docs/.vitepress/theme/components/HomeCorpus.vue
badd +2 docs/.vitepress/theme/components/HomeDashboard.vue
badd +33 docs/.vitepress/theme/components/HomeGlobal.vue
badd +106 docs/.vitepress/theme/components/HomePosts.vue
badd +190 docs/.vitepress/theme/components/PostListSection.vue
badd +123 docs/.vitepress/theme/components/LinkUnderline.vue
badd +46 docs/.vitepress/theme/components/NavDoing.vue
badd +124 docs/.vitepress/theme/components/NavLayer.vue
badd +16 docs/.vitepress/theme/components/ContentContact.vue
badd +57 docs/.vitepress/theme/components/HomeTags.vue
argglobal
%argdel
edit docs/.vitepress/theme/components/HomeTags.vue
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
balt docs/.vitepress/theme/components/ContentTags.vue
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
15
sil! normal! zo
17
sil! normal! zo
24
sil! normal! zo
34
sil! normal! zo
47
sil! normal! zo
53
sil! normal! zo
57
sil! normal! zo
let s:l = 61 - ((16 * winheight(0) + 14) / 28)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 61
normal! 05|
wincmd w
argglobal
if bufexists(fnamemodify("docs/.vitepress/theme/components/DashboardBacklog.vue", ":p")) | buffer docs/.vitepress/theme/components/DashboardBacklog.vue | else | edit docs/.vitepress/theme/components/DashboardBacklog.vue | endif
if &buftype ==# 'terminal'
  silent file docs/.vitepress/theme/components/DashboardBacklog.vue
endif
balt docs/.vitepress/theme/components/DashboardWeekQuadrant.vue
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
28
sil! normal! zo
29
sil! normal! zo
30
sil! normal! zo
34
sil! normal! zo
35
sil! normal! zo
40
sil! normal! zo
61
sil! normal! zo
83
sil! normal! zo
89
sil! normal! zo
let s:l = 57 - ((10 * winheight(0) + 14) / 28)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 57
normal! 029|
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
