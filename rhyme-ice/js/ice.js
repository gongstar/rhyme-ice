if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(typeof(com.hm_x.ice.Controller) == "undefined" || !com.hm_x.ice.Controller)
	com.hm_x.ice.Controller =
{
	currentCiTag : null,

	cpCatalog : com.hm_x.ice.CpCatalog,

	init : function() {
		this.widget = new com.hm_x.ice.IceWidget(document.body);
		this.widget.controller = this;
		this.onSelectRhymeKind();
		
		var cpCatalog = this.cpCatalog;
		cpCatalog.init("conf/cp.xml");

		var taxonomy = cpCatalog.getTaxonomy();
		var kindSelector = $("ci-tag-kind-selector");

		taxonomy.each(function(tax){
			var optGrp = document.createElement("optgroup");
			optGrp.setAttribute("label", tax);
			kindSelector.appendChild(optGrp);
			
			var kindList = cpCatalog.getKindList(tax);
			kindList.each(function(kind) {
				var kindOpt = document.createElement("option");
				kindOpt.setAttribute("value", kind);
				kindOpt.appendChild(document.createTextNode(kind));
				kindSelector.appendChild(kindOpt);
			});
		});

		Event.observe("ci-tag-kind-selector", "change", this.onShowCiTagList.bindAsEventListener(this, kindSelector));
		Event.observe("cp-name", "click", this.onSelectCiTag.bindAsEventListener(this));
		$("cp-select-dialog").hide();
		
		com.hm_x.ice.Editor.init();
	},
	
	loadCiTag : function(ciTagSrc) {
		this.currentCiTag = this.cpCatalog.createCiTag(ciTagSrc);
		com.hm_x.ice.Editor.init(this.currentCiTag);
	},
	
	onSelectCiTag : function(evt) {
		if($("cp-select-dialog").visible())
			$("cp-select-dialog").hide();
		else
			$("cp-select-dialog").show();
	},
	
	onShowCiTagList : function(evt, kindSelector) {
		var kind = kindSelector.value;
		var ciTagList = this.cpCatalog.getCiTagList(kind);
		var tagSelector = $("ci-tag-list");
		com.hm_x.xml.clearChildren(tagSelector);
		ciTagList.each(function(ciTag, i){
			var ciTagName = ciTag.getAttribute("名");
			var tagNode = document.createElement("span");
			tagNode.setAttribute("ice-source", ciTag.getAttribute("源"));
			tagNode.appendChild(document.createTextNode(ciTagName));
			tagNode = $(tagSelector.appendChild(tagNode));
			tagNode.addClassName("ci-tag-name");
			tagNode.addClassName("selectable-item");
		});

		Event.observe(tagSelector, "click", this.onClickCiTagDialog.bindAsEventListener(this));
	},
	
	onClickCiTagDialog : function(evt) {
		var ele = evt.element();
		this.loadCiTag(ele.getAttribute("ice-source"));
		$("cp-select-dialog").hide();
	},
	
	onSelectRhymeKind : function(kindId) {
		var ctor = com.hm_x.ice.ClRhyme;
		if(kindId == "ping-shui-yun")
			ctor = com.hm_x.ice.PsRhyme;
		else if(kindId == "zhong-hua-xin-yun")
			ctor = com.hm_x.ice.NewRhyme;
		
		this.rhyme = new ctor();
		this.widget.rhymeKindButton.setCaption(this.rhyme.abbr);
		this.updateRhymeDept();
	},
	
	updateRhymeDept : function() {
		var deptWidget = this.widget.rhymeDeptWidget;
		deptWidget.clear();
		
		this.rhyme.getDeptList().each(function(dept){
			deptWidget.addDept(dept);
		});
	},
};
