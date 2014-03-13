setlocal wildignore+=dist,coverage

" Syntastic options
let g:syntastic_html_tidy_ignore_errors = [
  \ 'trimming empty <i>'
  \ , 'trimming empty <span>'
  \ , 'trimming empty <label>'
  \ , 'trimming empty <option>'
  \ , 'trimming empty <button>'
  \ , 'unescaped & which should be written as &amp;'
  \ , ' proprietary attribute "ng-'
  \ , ' proprietary attribute "ui-'
  \ , ' proprietary attribute "tv-'
  \ , ' proprietary attribute "translate'
  \ , '<table> proprietary attribute "show-filter"'
  \ , '<td> proprietary attribute "sortable"'
  \ , '<td> proprietary attribute "filter"'
  \ , '<form> lacks "action" attribute'
  \ , '<form> proprietary attribute "novalidate"'
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
  \ , '<ng-pluralize> is not recognized!'
  \ , 'discarding unexpected <ng-pluralize>'
  \ , 'discarding unexpected </ng-pluralize>'
  \ , '<tv-breadcrumbs> is not recognized!'
  \ , 'discarding unexpected <tv-breadcrumbs>'
  \ , 'discarding unexpected </tv-breadcrumbs>'
  \ , 'missing </a> before <div>'
  \ , 'discarding unexpected </a>'
  \ , '<input> proprietary attribute "required"'
  \ , '<input> proprietary attribute "min"'
  \ , '<input> proprietary attribute "max"'
  \ , '<nvd3-'
  \ , 'discarding unexpected <nvd3-'
  \ , 'discarding unexpected </nvd3-'
  \ ]

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'angularjs,angularui'
