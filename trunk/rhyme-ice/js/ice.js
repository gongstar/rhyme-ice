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
		Event.observe("rhyme-kind", "click", this.onShowRhymeKind.bindAsEventListener(this));
		Event.observe("rhyme-kind-content", "click", this.onSelectRhymeKind.bindAsEventListener(this));
		Event.observe("rhyme-catalog-name", "click", this.onShowRhymeCatalog.bindAsEventListener(this));
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
			try {
			tagNode.setAttribute("ice-source", ciTag.getAttribute("源"));
			} catch(e) {
				alert(e);
				throw e;
			}
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
	
	onShowRhymeKind : function(evt) {
		var kindCont = $("rhyme-kind-content");
		if(kindCont.visible())
			kindCont.hide();
		else
			kindCont.show();
	},
	
	onSelectRhymeKind : function(evt) {
		$("rhyme-kind-content").hide();
		
		var kind = (evt ? evt.element() : $("ci-lin-zheng-yun"));
		if(kind.id == this.rhymeKind)
			return;
		this.rhymeKind = kind.id;
			
		var ctor = com.hm_x.ice.ClRhyme;
		if(kind.id == "ping-shui-yun")
			ctor = com.hm_x.ice.PsRhyme;
		else if(kind.id == "zhong-hua-xin-yun")
			ctor = com.hm_x.ice.NewRhyme;
		
		this.rhyme = new ctor();
		$("rhyme-kind").innerHTML = this.rhyme.abbr;
		this.updateRhymeCatalog();
	},
	
	updateRhymeCatalog : function() {
		var catCont = $("rhyme-catalog-content");
		com.hm_x.xml.clearChildren(catCont);
		
		this.rhyme.getDeptList().each(function(dept){
			var title = $(document.createElement("p"));
			title.appendChild(document.createTextNode(dept.name));
			title = $(catCont.appendChild(title));
			title.addClassName("rhyme-dept-title");
			
			var toneList = dept.getToneList();
			if(toneList.length > 0) {
				var toneBlock = $(title.appendChild(document.createElement("div")));
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
		});
	},
	
	onShowRhymeCatalog : function(evt) {
		var catCont = $("rhyme-catalog-content");
		if(catCont.visible())
			catCont.hide();
		else
			catCont.show();
	}
};
