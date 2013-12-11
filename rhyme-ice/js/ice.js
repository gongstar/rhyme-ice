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
		var kindSelector = this.widget.cpWidget.cpKindView;

		taxonomy.each(function(tax){
			kindSelector.addGroup(tax);
			var kindList = cpCatalog.getKindList(tax);
			kindList.each(function(kind) {
				kindSelector.addOption(kind);
			});
		});

		com.hm_x.ice.Editor.init();
	},
	
	loadCiTag : function(ciTagSrc) {
		this.currentCiTag = this.cpCatalog.createCiTag(ciTagSrc);
		com.hm_x.ice.Editor.init(this.currentCiTag);
	},
	
	onShowCpList : function(kind) {
		var ciTagList = this.cpCatalog.getCiTagList(kind);
		var widget = this.widget.cpWidget.cpListWidget;
		widget.clear();
		ciTagList.each(function(ciTag){
			widget.addCp(ciTag);
		});
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
	
	checkMetrics : function() {
		var peom = this.widget.editorView.htmlNode.value;
		if(peom) {
			var ri = this.rhyme.checkZi(peom[0]);
		}
	},
};
