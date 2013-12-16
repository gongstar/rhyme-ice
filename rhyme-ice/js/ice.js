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

		//com.hm_x.ice.Editor.init();
	},
	
	loadCiTag : function(ciTagSrc) {
		this.currentCiTag = this.cpCatalog.createCiTag(ciTagSrc);
		this.widget.titleView.setCp(this.currentCiTag);
		this.onChangeForm(this.widget.titleView.formSelectView.getValue());
	},
	
	onChangeForm : function(formIdx) {
		this.formIdx = formIdx;
		this.widget.metricsView.setMetrics(this.currentCiTag.getMetricsText(formIdx));

		$("cp-comment-content").innerHTML = this.currentCiTag.getComment(formIdx);
		$("cp-summary-content").innerHTML = this.currentCiTag.getSummary(formIdx);
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
			
		var ck = this._makeCheckStruct();

		// 以下按句为单位，可以采用文本比较算法？初步考虑ＬＤ算法……
		ck.each(function(para){
			para.each(function(sent){
				var sentRes = com.hm_x.ice.MC.editWithLD(sent.m, sent.pr);
				if(sentRes) {
					sent.m = sentRes.m;
					sent.pr = sentRes.pr;
				}
			});
		});
	},

	_makeCheckStruct : function() {
		// 把格律文本按段、句分开，形成三维数组
		var metrics = [];
		this.currentCiTag.getMetricsText(this.formIdx).split('\n').each(function(paraText){
			var idx = 0;
			metrics.push($A(paraText).groupBy(function(zi){
				return com.hm_x.ice.MC.isPunct(zi) ? idx++ : idx;
			}));
		});
		
		// 同样，把词分开，形成三维数组，其中段落按格律文本区分——这样要先去除原有的换行与空格
		// 第一步先分成句（二维数组）
		var idx = 0;
		var peomSentences = $A(this.widget.editorView.getValue().replace(/\n|　/g, '')).groupBy(function(zi){
			return com.hm_x.ice.MC.isPunct(zi) ? idx++ : idx;
		});
		// 第二步按格律的句数分段
		var peom = [];
		metrics.each(function(metricsPara){
			peom.push(peomSentences.splice(0, metricsPara.length));
		});

		// 同结构生成　rhymeInfo
		var rhymeInfo = peom.map(function(peomPara){
			return peomPara.map(function(sentence){
				return sentence.map(function(zi){
					return this.rhyme.checkZi(zi);
				}, this);
			}, this);
		}, this);
		
		// 组合成特定结构，其中格律与字按句分开
		return metrics.zip(peom, rhymeInfo, function(paraTuple){
			return paraTuple[0].zip(paraTuple[1], paraTuple[2], function(sentTuple){
				return {
					m : sentTuple[0],	// metrics
					pr : (sentTuple[1] ? sentTuple[1].zip(sentTuple[2], function(ziTuple) {	// peom and rhyme
						return {
							p : ziTuple[0],	// peom
							r : ziTuple[1]		// rhyme
						};
					}) : [])
				};
			});
		})
	},
	
};

if(!com.hm_x.ice.MC)	// metrics checker，作为各个辅助函数的存放处吧
	com.hm_x.ice.MC = 
{
	isPunct : function(zi) {
		return '。，！？；'.indexOf(zi) >= 0;
	},
	
	// 用　ＬＤ　算法比较并编辑
	editWithLD : function(m, pr) {
		if(!pr.length)
			return null;
		
		// 生成编辑距离矩阵
		var mat = new Array(m.length);
		// 利用　-1 下标的回环特性，为首行提供“上一行”
		mat[-1] = $A($R(1, pr.length + 1));
		mat[-1][-1] = 0;
		
		for(var i = 0; i < m.length; ++i) {
			// 利用　-1 下标的回环特性，为首列提供“上一列”
			mat[i] = [];
			mat[i][-1] = i + 1;
			
			for(var j = 0; j < pr.length; ++j) {
				var ziRes = this.ziTest(m[i], pr[j]);
				if(ziRes)	// 匹配则填左上角值
					mat[i][j] = mat[i - 1][j - 1];
				else			// 不匹配，则用上、左、角中最小值 + 1
				{
					var temp = mat[i - 1];
					mat[i][j] = Math.min(Math.min(mat[i - 1][j], mat[i][j - 1]), mat[i - 1][j - 1]) + 1;
				}
			}
		}
	
		// 回溯编辑路径
		i = m.length - 1;
		j = pr.length - 1;
		var mRes = [];
		var prRes = [];
		var dirU = function(){	// 向上回溯
			mRes.unshift('　');
			prRes.unshift(pr[j--]);
		};
		var dirC = function(){		// 向角（左上）回溯
			mRes.unshift(m[i]);
			prRes.unshift(pr[j]);
			--i;
			--j;
		};
		var dirL = function() {	// 向左回溯
			mRes.unshift(m[i--]);
			prRes.unshift({ p : '　', r : null});
		};
		while(i >= 0 || j >= 0) {
			var dir = dirC;	// 相等向角
			if(i == -1)			// 无法向左
				dir = dirU;
			else if(j == -1)	// 无法向上　——　注意 i 和　j 不可能同时为　-1
				dir = dirL;
			else if(!this.ziTest(m[i], pr[j])) {	// 不等：向最小值回溯，优先级：角 > 左 > 上
				var c = mat[i-1][j-1];	// 角
				var l = mat[i-1][j];		// 左
				var u = mat[i][j-1];		// 上
				if(u < l && u < c)
					dir = dirU;
				else if(l < c)
					dir = dirL;
			}
			dir();
		}
	
		return { m: mRes, pr: prRes};
	},
	
	ziTest : function(mZi, prZi) {
		var isPunctZi = this.isPunct(prZi.p);
		if(this.isPunct(mZi))			// 标点只能与标点匹配
			return isPunctZi;
		if(isPunctZi)
			return false;	// 其它任何格律字都不能与标点匹配
		if(!prZi.r || !prZi.r.length)	// 不认识的字都算通过测试，惹不起啊
			return true;
		
		// 第一步先只做平仄测试
		if(mZi == '中')
			return true;
		return prZi.r.detect(function(tone){
			var pz = ('平晕耶叠欢'.indexOf(mZi) >= 0);	// true means 平
			return (tone.name.search(pz ? /平/ : /仄|入/) > -1);
		});
	}

}
