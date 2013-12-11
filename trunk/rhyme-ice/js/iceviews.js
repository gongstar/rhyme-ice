if(!com.hm_x.ice.View)
	alert("必须先加入 views.js 文件。");

if(!com.hm_x.ice.IceWidget)
	com.hm_x.ice.IceWidget = function(node) 
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);

	this.rhymeKindButton = this.addChild(new com.hm_x.ice.Button($("rhyme-kind"), function(evt) {
		if(this.parent.rhymeKindWidget.visible())
			this.parent.rhymeKindWidget.hide();
		else
			this.parent.rhymeKindWidget.show();
	}));
	this.rhymeKindWidget = this.addChild(new com.hm_x.ice.RhymeKindWidget($("rhyme-kind-content")));
	
	this.rhymeDeptButton = this.addChild(new com.hm_x.ice.Button($("rhyme-catalog-name"), function(evt) {
		if(this.parent.rhymeDeptWidget.visible())
			this.parent.rhymeDeptWidget.hide();
		else
			this.parent.rhymeDeptWidget.show();
	}));
	this.rhymeDeptWidget = this.addChild(new com.hm_x.ice.RhymeDeptWidget($('rhyme-catalog-content')));
	
	this.cpNameButton = this.addChild(new com.hm_x.ice.Button($('cp-name'), function(evt){
		if(this.parent.cpWidget.visible())
			this.parent.cpWidget.hide();
		else
			this.parent.cpWidget.show();
	}));
	this.cpWidget = this.addChild(new com.hm_x.ice.CpWidget($('cp-select-dialog')));
	
	this.editorView = this.addChild(new com.hm_x.ice.EditorView($('content-editor')));
	this.metricsView = this.addChild(new com.hm_x.ice.MetricsView($('format-shower')));
}

if(!com.hm_x.ice.RhymeKindWidget)
	com.hm_x.ice.RhymeKindWidget = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.setOnClick(function(evt) {
		this.hide();
		
		var kind = (evt ? evt.element() : $("ci-lin-zheng-yun"));
		if(kind.id == this.rhymeKind)
			return;
		this.rhymeKind = kind.id;
		
		this.parent.controller.onSelectRhymeKind(kind.id);
	});
}

if(!com.hm_x.ice.RhymeDeptWidget)
	com.hm_x.ice.RhymeDeptWidget = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.addDept = function(dept) {
		var title = this.addChild(new com.hm_x.ice.View({
			tag : 'p',
			innerHTML : dept.name
		}));
		title.htmlNode.addClassName("rhyme-dept-title");
			
		var toneList = dept.getToneList();
		if(toneList.length > 0) {
			var toneBlock = $(title.htmlNode.appendChild(document.createElement("div")));
			toneList.each(function(tone){
				var toneTitle = $(toneBlock.appendChild(document.createElement("div")));
				var toneName = $(toneTitle.appendChild(document.createElement("span")));
				toneName.appendChild(document.createTextNode(tone.name + '声'));
				toneName.addClassName("name");
				if(tone.dept) {
					var toneDept = $(toneTitle.appendChild(document.createElement("span")));
					toneDept.appendChild(document.createTextNode(tone.desc));
					toneDept.addClassName("descript");
				}
				toneTitle.addClassName("rhyme-tone-title");
				toneTitle.addClassName("selectable-item");
			});
		}
		else {	// 否则直接选择韵部即可，比如平水韵即为如此
			title.addClassName("selectable-item");
		}
	}
}

if(!com.hm_x.ice.CpWidget)
	com.hm_x.ice.CpWidget = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.cpKindView = this.addChild(new com.hm_x.ice.Selector($("ci-tag-kind-selector"), function(evt){
		var kind = this.htmlNode.value; 
		this.getController().onShowCpList(kind);
	}));
	this.cpListWidget = this.addChild(new com.hm_x.ice.CpListWidget($("ci-tag-list")));
}

if(!com.hm_x.ice.CpListWidget)
	com.hm_x.ice.CpListWidget = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.addCp = function(cp) {
		var cpView = this.addChild(new com.hm_x.ice.View({
			tagName		: 'span',
			attributes	: {'ice-source' : cp.getAttribute('源')},
			innerHTML	: cp.getAttribute('名')
		}));
		cpView.htmlNode.addClassName("ci-tag-name");
		cpView.htmlNode.addClassName("selectable-item");
	}

	this.setOnClick(function(evt){
		var ele = evt.element();
		var view = (ele ? ele.hmxView : null);
		if(view) {
			this.getController().loadCiTag(ele.getAttribute("ice-source"));
			this.parent.hide();
		}
	});
}

if(!com.hm_x.ice.EditorView)
	com.hm_x.ice.EditorView = function(node)
{
	this.base = com.hm_x.ice.TextArea;
	this.base(node);
	
	this.setOnChange(function() {
		this.getController().checkMetrics();
	});
}

if(!com.hm_x.ice.MetricsView)
	com.hm_x.ice.MetricsView = function(node)
{
	this.base = com.hm_x.ice.View;
	this.base(node);
}
