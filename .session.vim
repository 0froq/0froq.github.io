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
badd +2 docs/corpus/100_ingesta/ing_l\'etranger.md
badd +17 docs/corpus/200_neoplasma/neo_l\'etranger_202602121432.md
badd +2 docs/corpus/100_ingesta/ing_le_mythe_de_sisyphe.md
badd +91 docs/.vitepress/theme/components/ContentArticle.vue
badd +17 docs/corpus/100_ingesta/ing_hove.md
badd +12 docs/corpus/100_ingesta/ing_@pi2022.md
badd +12 docs/corpus/100_ingesta/ing_@yang2025.md
badd +17 docs/corpus/100_ingesta/ing_a_room_of_one\'s_own.md
badd +22 docs/corpus/100_ingesta/ing_bkxisvbi.md
argglobal
%argdel
edit docs/corpus/100_ingesta/ing_bkxisvbi.md
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt docs/corpus/100_ingesta/ing_a_room_of_one\'s_own.md
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
15
sil! normal! zo
let s:l = 22 - ((21 * winheight(0) + 16) / 33)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 22
normal! 080|
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
