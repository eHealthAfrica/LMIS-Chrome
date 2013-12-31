/* [ ---- Ebro Admin - tree plugin ---- ] */

    $(function() {
		ebro_tree_plugin.tree_a();
		ebro_tree_plugin.tree_b();
	})
	
	// tree plugin
	ebro_tree_plugin = {
		tree_a: function() {
			var setting = {
				view: {
					dblClickExpand: dblClickExpand
				},
				data: {
					simpleData: {
						enable: true
					}
				}
			};
	
			var zNodes =[
				{ id:1, pId:0, name:"Root", open:true},
				{ id:11, pId:1, name:"Parent Node 1-1", open:true},
				{ id:111, pId:11, name:"Leaf Node 1-1-1"},
				{ id:112, pId:11, name:"Leaf Node 1-1-2"},
				{ id:113, pId:11, name:"Leaf Node 1-1-3"},
				{ id:114, pId:11, name:"Leaf Node 1-1-4"},
				{ id:12, pId:1, name:"Parent Node 1-2", open:true},
				{ id:121, pId:12, name:"Leaf Node 1-2-1"},
				{ id:122, pId:12, name:"Leaf Node 1-2-2"},
				{ id:123, pId:12, name:"Leaf Node 1-2-3"},
				{ id:124, pId:12, name:"Leaf Node 1-2-4"},
				{ id:13, pId:1, name:"Parent Node 1-3", open:true},
				{ id:131, pId:13, name:"Leaf Node 1-3-1"},
				{ id:132, pId:13, name:"Leaf Node 1-3-2"},
				{ id:133, pId:13, name:"Leaf Node 1-3-3"},
				{ id:134, pId:13, name:"Leaf Node 1-3-4"}
			];
	
			function dblClickExpand(treeId, treeNode) {
				return treeNode.level > 0;
			}
			
			$.fn.zTree.init($("#tree_plugin_ex_a"), setting, zNodes);
		},
		tree_b: function() {
			var setting = {
				check: {
					enable: true
				},
				data: {
					simpleData: {
						enable: true
					}
				}
			};
	
			var zNodes =[
				{ id:1, pId:0, name:"can check 1", open:true},
				{ id:11, pId:1, name:"can check 1-1", open:true},
				{ id:111, pId:11, name:"can check 1-1-1"},
				{ id:112, pId:11, name:"can check 1-1-2"},
				{ id:12, pId:1, name:"can check 1-2", open:true},
				{ id:121, pId:12, name:"can check 1-2-1"},
				{ id:122, pId:12, name:"can check 1-2-2"},
				{ id:2, pId:0, name:"can check 2", checked:true, open:true},
				{ id:21, pId:2, name:"can check 2-1"},
				{ id:22, pId:2, name:"can check 2-2", open:true},
				{ id:221, pId:22, name:"can check 2-2-1", checked:true},
				{ id:222, pId:22, name:"can check 2-2-2"},
				{ id:23, pId:2, name:"can check 2-3"}
			];
			
			$.fn.zTree.init($("#tree_plugin_ex_b"), setting, zNodes);
		}
	}