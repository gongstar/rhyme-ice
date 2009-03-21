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
	},
	
	loadCiTag : function(ciTagSrc) {
		this.currentCiTag = this.cpCatalog.createCiTag(ciTagSrc);
		com.hm_x.ice.Editor.init(this.currentCiTag);
	},
	
	onShowCiTagList : function(evt, kindSelector) {
		var kind = kindSelector.value;
		var ciTagList = this.cpCatalog.getCiTagList(kind);
		var tagSelector = $("ci-tag-list");
		com.hm_x.xml.clearChildren(tagSelector);
		ciTagList.each(function(ciTag, i){
			var ciTagName = ciTag.getAttribute("名");
			var tagNode = document.createElement("span");
			tagNode.setAttribute("源", ciTag.getAttribute("源"));
			tagNode.appendChild(document.createTextNode(ciTagName));
			$(tagSelector.appendChild(tagNode)).addClassName("ci-tag-name");
		});

		Event.observe(tagSelector, "click", this.onClickCiTagDialog.bindAsEventListener(this));
	},
	
	onClickCiTagDialog : function(evt) {
		var ele = evt.element();
		this.loadCiTag(ele.getAttribute("源"));
	}
};
