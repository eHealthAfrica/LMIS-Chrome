setlocal wildignore+=dist,Ebro

" Syntastic options
let g:syntastic_html_tidy_ignore_errors = [
  \ 'trimming empty <i>'
  \ , 'trimming empty <span>'
  \ , 'unescaped & which should be written as &amp;'
  \ , ' proprietary attribute "ng-'
  \ , '<table> proprietary attribute "show-filter"'
  \ , '<td> proprietary attribute "sortable"'
  \ , '<td> proprietary attribute "filter"'
  \ , '<form> lacks "action" attribute'
  \ , '<alert> is not recognized!'
  \ , 'discarding unexpected <alert>'
  \ , 'discarding unexpected </alert>'
  \ ]

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'angularjs'
