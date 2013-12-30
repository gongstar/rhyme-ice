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

		com.hm_x.ice.MetricsZi.SPACE = new com.hm_x.ice.MetricsZi('　');
		com.hm_x.ice.PoemZi.SPACE = new com.hm_x.ice.PoemZi('　');
	},
	
	loadCiTag : function(ciTagSrc) {
		this.currentCiTag = this.cpCatalog.createCiTag(ciTagSrc);
		this.widget.titleView.setCp(this.currentCiTag);
		this.widget.footWidget.setSource(this.currentCiTag.getSource());
		this.onChangeForm(this.widget.titleView.formSelectView.getValue());
	},
	
	onChangeForm : function(formIdx) {
		this.formIdx = formIdx;
		this.widget.metricsView.setMetrics(this.currentCiTag.getMetricsText(formIdx));

		this.widget.footWidget.setComment(this.currentCiTag.getComment(formIdx));
		this.widget.footWidget.setSummary(this.currentCiTag.getSummary(formIdx));
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
		if(!this.currentCiTag)
			return;	// todo: 将来可以考虑自动查找符合的词牌。还没想过，预计需要在词牌列表中加入大量元信息……

		var matrixText = this.widget.metricsView.metrics;
		var poemText = this.widget.editorView.getValue();
		if(!matrixText || !poemText)
			return;
		var ci = new com.hm_x.ice.Ci(poemText, matrixText);
		
		var newMetricsText = ci.getNewMetricsText();
		var newPoemText = ci.getNewPoemText();
		if(!newPoemText)
			return;	// poem　无内容，则不必进行下面的调整
		
		this.widget.metricsView.setMetrics(newMetricsText);

		// 计算原编辑位置
		var caretPos = this.widget.editorView.getCaretPos();
		var caretDelta = 0;
		var caretCount = 0;
		$A(this.widget.editorView.getValue()).detect(function(zi){
			if(caretCount >= caretPos)
				return true;
			if(zi == '　')
				++ caretDelta;
			++ caretCount;
			return false;
		});
		caretPos -= caretDelta;
		
		// 重新确定编辑位置
		caretDelta = 0;
		caretCount = 0;
		$A(newPoemText).detect(function(zi){
			if(caretCount >= caretPos)
				return true;
			if(zi == '　')
				++ caretDelta;
			else
				++ caretCount;
			return false;
		});
		caretPos += caretDelta;
		
		this.widget.editorView.setValue(newPoemText);
		this.widget.editorView.setCaretPos(caretPos);
	},
	
};
