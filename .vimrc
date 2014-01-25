setlocal wildignore+=dist,Ebro

" Syntastic options
let g:syntastic_html_tidy_ignore_errors = [
  \ 'trimming empty '
  \ , 'unescaped & which should be written as &amp;'
  \ , ' proprietary attribute "ng-'
  \ ]

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'angularjs'
