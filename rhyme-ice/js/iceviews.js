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
	this.titleView = this.addChild(new com.hm_x.ice.TitleView($("title-editor")));
	this.footWidget = this.addChild(new com.hm_x.ice.FootWidget($("cp-info-banners")));
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
		var title = this.addChild(new com.hm_x.ice.Widget({
			tag : 'p',
			innerHTML : dept.name,
			classNames : ["rhyme-dept-title", "selectable-item"]
		}));	// 没错，任何时候都只需要选择韵部。因为平仄是由词谱定的，与韵部选择无关。
		title.dept = dept;
			
		var toneList = dept.getToneList();
		if(toneList.length > 0) {
			var toneBlock = title.addChild(new com.hm_x.ice.Widget(document.createElement("div")));
			toneList.each(function(tone){
				var toneTitle = toneBlock.addChild(new com.hm_x.ice.Widget({
					tagName : "div",
					classNames : ["rhyme-tone-title"]
				}));
				var toneName = toneTitle.addChild(new com.hm_x.ice.View({
					tagName : "span",
					innerHTML : tone.name + '声',
					classNames : ["name"]
				}));
				if(tone.dept) {
					var toneDept = toneTitle.addChild(new com.hm_x.ice.View({
						tagName : "span",
						innerHTML : tone.desc,
						classNames : ["descript"]
					}));
				}
			}, this);
		}
	}

	this.setOnClick(function(evt){
		var ele = evt.element();
		var view = (ele ? ele.hmxView : null);
		while(view && !view.htmlNode.hasClassName("rhyme-dept-title")) // 只对韵部有响应
			view = view.parent;
		if(view)
			this.getController().setCurrentRhymeDept(view.dept);
	});
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

if(!com.hm_x.ice.TitleView)
	com.hm_x.ice.TitleView = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.setCp = function(cp) {
		this.cpNameView.setCaption(cp.getName());
		this.cpNameEditorView.setCaption(cp.getName());
		
		this.formSelectView.clear();
		var formCount = cp.getFormCount();
		for(var i = 1; i <= formCount; ++i)	// 词格的计数从　１　开始
			this.formSelectView.addOption(cp.getFormName(i), i);
		this.formSelectView.setValue(1);
		this.formSelectView.show();

		if(formCount == 1)
			this.formSelectView.hide();
	} 
	
	// 标题总共有两处
	this.cpNameView = this.addChild(new com.hm_x.ice.View($('cp-name')));
	this.cpNameEditorView = this.addChild(new com.hm_x.ice.View($('title-editor-cp-name')));
	// 这里应该是一个点击后变为　input editor 的编辑控件，todo...
	this.ciTitleView = this.addChild(new com.hm_x.ice.Clickable($('title-editor-title')));
	this.formSelectView = this.addChild(new com.hm_x.ice.MetricsFormSelector($("format-selector")));
}

if(!com.hm_x.ice.MetricsFormSelector)
	com.hm_x.ice.MetricsFormSelector = function(node)
{
	this.base = com.hm_x.ice.Selector;
	this.base(node);

	this.setOnChange(function(evt){
		var formIdx = parseInt(this.getValue(), 10);
		if(formIdx == 0)
			formIdx = 1;
		this.getController().onChangeForm(formIdx);
	});
}

if(!com.hm_x.ice.EditorView)
	com.hm_x.ice.EditorView = function(node)
{
	this.base = com.hm_x.ice.TextArea;
	this.base(node);

	this.setOnChange(function() {
		// 标点及各种符号只保留逗句分叹问顿，且转为全角标点。空格、数字转为中文。
		var peom = $A(this.getValue()).map(function(zi){
			var puncIdx = ' 0123456789,.;!?，。；！？、\'‘`｀"“”:：~!@#$%^&*()-_+=＠＃￥％…＆＊（）—＋－＝\\|｜[]{}「」『』<>《》/／'.indexOf(zi);
			var puncMap = '　零一二三四五六七八九，。；！？，。；！？、';
			if(puncIdx >= puncMap.length)
				return '';
			if(puncIdx >= 0)
				return puncMap[puncIdx];
			return zi;
		});
		
		var pos = this.getCaretPos();
		for(var i = 0; i < pos; ++i)
			pos -= (peom[i] ? 0 : 1);
		peom = peom.filter(Boolean);	// 去除不要的字符（已经转为空串）
		this.setValue(peom.join(''));
		this.setCaretPos(pos);

		this.getController().checkMetrics();
	});
}

if(!com.hm_x.ice.MetricsView)
	com.hm_x.ice.MetricsView = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.setMetrics = function(metrics) {
		if(this.metrics)
			this.clear();
		this.metrics = metrics;
		metrics.split('\n').each(function(mPara){
			this.addChild(new com.hm_x.ice.MetricsParaWidget(mPara));
		}, this);
	}

	this.updateMetrics = function(ci) {
		this.children.each(function(para, idx){
			para.updateMetrics(ci[idx]);
		});
	}
}

if(!com.hm_x.ice.MetricsParaWidget)
	com.hm_x.ice.MetricsParaWidget = function(metricsPara)
{
	this.base = com.hm_x.ice.Widget;
	this.base({	tagName	: 'p'	});
	
	this.updateMetrics = function(ciPara) {
		var idx = 0;
		ciPara.each(function(sent){ sent.m.each(function(zi){
			var grid;
			if(idx >= this.children.length)
				grid = this.addChild(new com.hm_x.ice.MetricsGridView(zi.zi));
			else {
				grid = this.children[idx];
				while(grid.metricsZi != zi.zi && grid.metricsZi == '　') {
					this.removeChild(grid);
					grid = this.children[idx];
				}
				if(grid.metricsZi != zi.zi) {
					if(zi.isPunct)
						grid.setCaption(zi.zi);
					else {
						com.hm_x.debug.assert(zi.zi == '　', '多出来的格律字只能是空格！');
						grid = this.addChild(new com.hm_x.ice.MetricsGridView(zi.zi), grid);
					}
				}
			}
			
			grid.updateMetrics(zi);
			++ idx;
		}, this)}, this);
	}
	
	// init
	$A(metricsPara).each(function(zi){
		this.addChild(new com.hm_x.ice.MetricsGridView(zi));
	}, this);
}

if(!com.hm_x.ice.MetricsGridView)
	com.hm_x.ice.MetricsGridView = function(metricsZi)
{
	/* 格律字表（相当于拿汉字当几千阶的编码器来用，哇哈哈哈）：
		平曰平			平韵曰晕		平叶曰耶		平叠曰叠		平换曰欢
		仄曰仄			仄韵曰韵		仄叶曰叶		仄叠曰铁		仄换曰换
	*/
	var metricsTab = '平晕耶叠欢仄韵叶铁换';	// 格律记录表
	var showTab = '平韵叶叠换仄韵叶叠换';		// 格律显示表，与记录表相对应
	var metricsIdx = metricsTab.indexOf(metricsZi);
	var metricsSep = metricsTab.indexOf('仄');		// 用作平仄的分水岭
	
	this.base = com.hm_x.ice.View;
	this.base({
		tagName		: 'span',
		innerHTML	: (metricsIdx < 0 ? metricsZi : showTab[metricsIdx]),
		classNames	: ((function(){
			var names = ['grid'];
			if (metricsIdx < 0) {
				if(metricsZi == '中')
					names.push('zhong-sheng-grid');
				else
					names.push('literal-grid');
			}
			else if(metricsIdx < metricsSep)
				names.push('ping-sheng-grid');
			else
				names.push('zhe-sheng-grid');
			
			if(metricsIdx > -1 && metricsIdx != 0 && metricsIdx != metricsSep)	// 韵字
				names.push('rhyme-grid');
			return names;
		}))()
	});
	
	this.metricsZi = metricsZi;
	
	this.updateMetrics = function(zi) {
		com.hm_x.ice.Ci.CheckResult.MATCH_CAUSE.each(function(cause){
			this.htmlNode.removeClassName(cause);
		}, this);
		com.hm_x.ice.Ci.CheckResult.UNMATCH_CAUSE.each(function(cause){
			this.htmlNode.removeClassName(cause);
		}, this);
		
		if(zi.isRhyme) {
			com.hm_x.ice.Ci.CheckResult.RHYME_MATCH_CAUSE.each(function(cause){
				this.htmlNode.removeClassName(cause);
			}, this);
			com.hm_x.ice.Ci.CheckResult.RHYME_UNMATCH_CAUSE.each(function(cause){
				this.htmlNode.removeClassName(cause);
			}, this);
		}
		
		if(zi.checkResult) {
			if(zi.checkResult.isMatch) {
				this.htmlNode.addClassName(zi.checkResult.matchCause);
				if(zi.isRhyme && zi.checkResult.isRhymeMatch)
					this.htmlNode.addClassName(zi.checkResult.rhymeMatchCause);
				else if(zi.isRhyme && zi.checkResult.rhymeUnmatchCause)	// 当未写标点时，程序不会检查韵脚
					this.htmlNode.addClassName(zi.checkResult.rhymeUnmatchCause);
			}
			else
				this.htmlNode.addClassName(zi.checkResult.unmatchCause);
		}
	}
}

if(!com.hm_x.ice.FootWidget)
	com.hm_x.ice.FootWidget = function(node)
{
	this.base = com.hm_x.ice.Widget;
	this.base(node);
	
	this.sourceView = this.addChild(new com.hm_x.ice.View($("cp-source-content")));
	this.commentView = this.addChild(new com.hm_x.ice.View($("cp-comment-content")));
	this.summaryView = this.addChild(new com.hm_x.ice.View($("cp-summary-content")));
	
	this.setSource = function(source) {
		this.sourceView.setCaption(source);
	}

	this.setComment = function(comment) {
		this.commentView.setCaption(comment);
	}

	this.setSummary = function(summary) {
		this.summaryView.setCaption(summary);
	}
}
