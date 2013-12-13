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
}

if(!com.hm_x.ice.MetricsParaWidget)
	com.hm_x.ice.MetricsParaWidget = function(metricsPara)
{
	this.base = com.hm_x.ice.Widget;
	this.base({	tagName	: 'p'	});
	
	$A(metricsPara).each(function(zi){
		this.addChild(new com.hm_x.ice.MetricsGridView(zi));
	}, this);
}

if(!com.hm_x.ice.MetricsGridView)
	com.hm_x.ice.MetricsGridView = function(metricsZi)
{
	var metricsIdx = '平晕耶叠欢仄韵叶铁换'.indexOf(metricsZi);
	
	this.base = com.hm_x.ice.View;
	this.base({
		tagName		: 'span',
		innerHTML	: (metricsIdx < 0 ? metricsZi : '平韵叶叠换仄韵叶叠换'[metricsIdx]),
		classNames	: ((function(){
			var names = ['grid'];
			if (metricsIdx < 0) {
				if(metricsZi == '中')
					names.push('zhong-sheng-grid');
				else
					names.push('literal-grid');
			}
			else if(metricsIdx < 5)
				names.push('ping-sheng-grid');
			else
				names.push('zhe-sheng-grid');
			
			if(metricsIdx > -1 && metricsIdx != 0 && metricsIdx != 5)	// 韵字
				names.push('rhyme-grid');
			return names;
		}))()
	});
	
	this.metricsZi = metricsZi;
}
