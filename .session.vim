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
badd +55 docs/corpus/100_ingesta/ing_l\'etranger.md
badd +15 docs/corpus/200_neoplasma/neo_l\'etranger_202204061432.md
badd +39 docs/corpus/100_ingesta/ing_le_mythe_de_sisyphe.md
badd +81 docs/.vitepress/theme/components/ContentArticle.vue
badd +59 docs/corpus/100_ingesta/ing_hove.md
badd +6 docs/corpus/100_ingesta/ing_@pi2022.md
badd +14 docs/corpus/100_ingesta/ing_@yang2025.md
badd +106 docs/corpus/100_ingesta/ing_a_room_of_one\'s_own.md
badd +4 docs/corpus/100_ingesta/ing_bkxisvbi.md
badd +34 docs/corpus/100_ingesta/ing_gryuvjmuuidebcgcwfxt.md
badd +522 docs/.vitepress/theme/style.css
badd +3 docs/corpus/200_neoplasma/neo_l\'etranger_202204132214.md
badd +51 docs/.vitepress/theme/components/TooltipPostInfo.vue
badd +78 docs/.vitepress/theme/components/TagTreeNode.vue
badd +27 docs/corpus/100_ingesta/ing_iadvdeguui.md
badd +12 docs/corpus/200_neoplasma/neo_iadvdeguui_nothing_you_can_do_about_it.md
badd +20 docs/corpus/100_ingesta/ing_la_peste.md
badd +3 docs/corpus/200_neoplasma/neo_la_peste_202203291612.md
badd +34 docs/corpus/100_ingesta/ing_libdri.md
badd +3 docs/corpus/200_neoplasma/neo_libdri_202203121912.md
badd +29 docs/corpus/100_ingesta/ing_the_moon_and_sixpence.md
badd +3 docs/corpus/200_neoplasma/neo_the_moon_and_sixpence_202203231937.md
badd +3 docs/corpus/200_neoplasma/neo_the_moon_and_sixpence_202310300302.md
badd +3 docs/corpus/200_neoplasma/neo_libdri_202203122235.md
badd +13 docs/corpus/500_vigil/vig_20211009.md
badd +18 docs/corpus/corpus.zsh
badd +9 docs/corpus/_config/corpus.conf
badd +193 docs/corpus/_lib/corpus_core.zsh
badd +23 docs/corpus/_lib/corpus_layers.zsh
badd +341 health://
badd +5 docs/corpus/_template/tp_paper.md
badd +10 docs/corpus/_template/tp_aut.md
badd +8 docs/corpus/_template/tp_del.md
badd +10 docs/corpus/_template/tp_ing.md
badd +5 docs/corpus/_template/tp_neo.md
badd +5 docs/corpus/_template/tp_put.md
badd +14 docs/corpus/100_ingesta/ing_rfugdaanviuu.md
badd +57 docs/corpus/100_ingesta/ing_syllogismes_de_l\'amertume.md
badd +14 docs/corpus/100_ingesta/ing_vorlesungen_zur_einführung_in_die_psychoanalyse.md
badd +14 docs/corpus/100_ingesta/ing_wodeycyrdeqkpkwj.md
badd +13 docs/corpus/100_ingesta/ing_yak_shaving.md
badd +19 docs/corpus/200_neoplasma/neo_the_moon_and_sixpence_too_lazy_to.md
badd +13 docs/corpus/200_neoplasma/neo_the_moon_and_sixpence_artists.md
badd +17 docs/corpus/200_neoplasma/neo_l\'etranger_in_the_trunk.md
badd +13 docs/corpus/200_neoplasma/neo_l\'etranger_time_to_eat.md
badd +17 docs/corpus/200_neoplasma/neo_la_peste_disaster.md
badd +14 docs/corpus/200_neoplasma/neo_libdri_dream.md
badd +14 docs/corpus/200_neoplasma/neo_libdri_their_own_way.md
badd +30 docs/corpus/200_neoplasma/neo_gryuvjmuuidebcgcwfxt_intents.md
badd +31 docs/posts/610_log/about_the_site.md
badd +14 docs/posts/610_log/an_obsidian_theme.md
badd +5 docs/posts/610_log/build_a_blog_site_flag.md
badd +4 docs/posts/610_log/long_time_no_see.md
badd +15 docs/posts/610_log/mathjax_greek_var.md
badd +15 docs/posts/610_log/mathjax_sup_sub_position.md
badd +14 docs/posts/610_log/nagging.md
badd +4 docs/posts/610_log/need_time.md
badd +4 docs/posts/610_log/not_really_back.md
badd +1 docs/posts/610_log/stage.md
badd +4 docs/posts/610_log/what_am_i_up_to.md
badd +4 docs/posts/610_log/why_i_pause.md
badd +24 docs/posts/620_roadmap/build_a_blog_site_1.md
argglobal
%argdel
edit docs/posts/620_roadmap/build_a_blog_site_1.md
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt docs/posts/610_log/why_i_pause.md
setlocal foldmethod=expr
setlocal foldexpr=v:lua.vim.treesitter.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 24 - ((19 * winheight(0) + 16) / 33)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 24
normal! 0
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
