setlocal wildignore+=dist,Ebro

" Syntastic options
let g:syntastic_html_tidy_ignore_errors = [
  \ 'trimming empty <i>'
  \ , 'trimming empty <span>'
  \ , 'unescaped & which should be written as &amp;'
  \ , ' proprietary attribute "ng-'
  \ , ' proprietary attribute "ui-'
  \ , ' proprietary attribute "tv-'
  \ , '<table> proprietary attribute "show-filter"'
  \ , '<td> proprietary attribute "sortable"'
  \ , '<td> proprietary attribute "filter"'
  \ , '<form> lacks "action" attribute'
  \ , '<alert> is not recognized!'
  \ , 'discarding unexpected <alert>'
  \ , 'discarding unexpected </alert>'
  \ , '<tabset> is not recognized!'
  \ , 'discarding unexpected <tabset>'
  \ , 'discarding unexpected </tabset>'
  \ , '<tab> is not recognized!'
  \ , 'discarding unexpected <tab>'
  \ , 'discarding unexpected </tab>'
  \ , '<accordion> is not recognized!'
  \ , 'discarding unexpected <accordion>'
  \ , 'discarding unexpected </accordion>'
  \ , '<accordion-group> is not recognized!'
  \ , 'discarding unexpected <accordion-group>'
  \ , 'discarding unexpected </accordion-group>'
  \ , '<accordion-heading> is not recognized!'
  \ , 'discarding unexpected <accordion-heading>'
  \ , 'discarding unexpected </accordion-heading>'
  \ , '<ui-view> is not recognized!'
  \ , 'discarding unexpected <ui-view>'
  \ , 'discarding unexpected </ui-view>'
  \ ]

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'angularjs'
