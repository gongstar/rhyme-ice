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
		var title = new com.hm_x.ice.View();
		title.create({
			tag : 'p',
			innerHTML : dept.name
		});

		this.addChild(title);
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
