/* [ ---- Ebro Admin - drag&drop dashboard ---- ] */

    $(function() {
		// drag&drop widgets
		ebro_portlets.init();
		//* todo list
		ebro_todo.init();
	})

	// drag&drop widgets
	ebro_portlets = {
		init: function() {
			
			var sortOrderCookie = $.cookie('ebro_widgets_sortOrder');
            if(sortOrderCookie != null) {
                $.each(sortOrderCookie.split(';'),function(i,id) {
                    thisSortable = $('.dd_column').get(i);
                    if(id != 'null'){
                        $.each(id.split(','),function(i,id) {
                            $("#"+id).appendTo(thisSortable);
                        });
                    }
                })
            }
			
			var dd_widgets = $( ".dd_column" ).sortable({
				connectWith: ".dd_column",
				handle: '.panel-heading',
				scroll: false,
				cancel: ".dd_actions",
				cursor: "move",
				delay: 150,
				opacity: 0.7,
				update:function(e,ui) {
					var elem = [];
                    $('.dd_column').each(function(){
                        elem.push($(this).sortable("toArray"));
                    });
                    var str = '';
                    var m_len = elem.length;
                    jQuery.each(elem, function(index,value) {
                        var s_len = value.length;
                        if(value == '') {
                            str += 'null';
                        } else {
                            jQuery.each(value, function(index,value) {
                                str += value;
                                if (index != s_len - 1) {
                                    str += ","
                                }
                            });
                        }
                        if (index != m_len - 1) {
                            str += ";"
                        }
                    });
                    $.cookie('ebro_widgets_sortOrder', str, { expires: 7});
				}
			});
	
			$('.dd_widget').each(function() {
				$(this).find('.panel-heading').append('<div class="dd_actions"><span class="icon-sort dd_toggle"></span> <span class="icon-remove dd_remove"></span></div>');
			});
			
			$('.dd_widget').on('click','.dd_toggle',function() {
				$(this).closest('.dd_widget').find('.dd_content').slideToggle('250');
			})
	
			$('.dd_remove').on('click',function() {
				$(this).closest('.dd_widget').fadeOut('250');
			})
			
			$('.reset_layout').click(function(){
				$.removeCookie('ebro_widgets_sortOrder');
				location.reload();
			});
			
		}
	}
	
	//* todo list
	ebro_todo = {
		init: function() {
			$('.todo-list li').each(function() {
				if($(this).hasClass('completed')) {
					$(this).find('.todo-check').attr('checked',true);
				}
			});
			$('.todo-list').on('click','input.todo-check',function(e){
				if( $(this).is(':checked') ) {
					$(this).closest('li').addClass('completed');
				} else {
					$(this).closest('li').removeClass('completed');
				}
			});
		}
	}