if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.Ci)
	com.hm_x.ice.Ci = function(poemText, metricsText)
{
	this.init = function (poemText, metricsText) {
		var metrics = [];
		// 把格律文本按段、句分开，形成三维数组
		metricsText.replace(/　/g, '').split('\n').each(function(paraText){
			var idx = 0;
			metrics.push(
				$A(paraText).map(function(zi){
					return new com.hm_x.ice.MetricsZi(zi);
				}).groupBy(function(zi){
					return zi.isPunct ? idx++ : idx;
				})
			);
		});
		
		// 同样，把词分开，形成三维数组，其中段落按格律文本区分——这样要先去除原有的换行与空格
		// 第一步先分成句（二维数组）
		var idx = 0;
		var poemSentences = $A(poemText.replace(/\n|　/g, '')).map(function(zi){
			return new com.hm_x.ice.PoemZi(zi);
		}).groupBy(function(zi){
			return zi.isPunct ? idx++ : idx;
		});
		// 第二步按格律的句数分段
		metrics.each(function(metricsPara){
			var poemPara = poemSentences.splice(0, metricsPara.length);
			this.push(metricsPara.zip(poemPara, function(tup){
				var mTup = tup[0], pTup = tup[1];
				if(pTup && pTup.length) {
					mTup.reverse();
					pTup.reverse();
					if(pTup[0].isPunct)	// 标点与　poem 保持一致
						mTup[0] = pTup[0];
				}
				return { m : mTup, p : pTup };
			}));
		}, this);
	};

	this.getNewMetricsText = function() {
		if(!this.newMetricsText)
			this._makeResult();
		return this.newMetricsText;
	}

	this.getNewPoemText = function() {
		if(!this.newPoemText)
			this._makeResult();
		return this.newPoemText;
	}

	this._makeResult = function() {
		this.newMetricsText = "";
		this.newPoemText = "";
		
		this.each(function(para){
			if(this.newMetricsText) {	// 分阙
				this.newMetricsText += '\n';
				this.newPoemText += '\n';
			}
		
			para.each(function(sent){
				this._editWithLDAlgo(sent);
				
				this.newMetricsText += sent.m.join('');
				if(sent.p && sent.p.length)
					this.newPoemText += sent.p.join('');
			}, this)
		}, this);
	}

	this._editWithLDAlgo = function(sent) {
		if(!sent.p || !sent.p.length)
			return;

		// 以下构造编辑矩阵		
		var mtx = [];	// LD 编辑矩阵
		mtx[-1] = $A($R(1, sent.p.length)).map(function(it){ return { value : it }; });	// 利用回环特性
		mtx[-1][-1] = { value : 0 };	// 起算点
		sent.m.each(function(mZi, i){
			mtx[i] = [];
			mtx[i][-1] = { value : i + 1 };
			
			sent.p.each(function(pZi, j){
				var res = new com.hm_x.ice.Ci.CheckResult(mZi, pZi);
				if(res.isMatch)
					res.value = mtx[i - 1][j - 1].value;
				else
					res.value = com.hm_x.common.min(mtx[i - 1][j].value, mtx[i][j - 1].value, mtx[i - 1][j - 1].value) + 1;
				mtx[i][j] = res;
			}, this);
		}, this);
		
		// 以下回溯编辑结果
		var lenDelta = sent.m.length - sent.p.length;
		var nm = [], np = [];
		var i = sent.m.length - 1, j = sent.p.length - 1;
		while(i > -1 || j > -1) {
			var it = mtx[i][j];

			if(i > -1 && j > -1 && (
				it.isMatch
				|| lenDelta == 0 
				|| (lenDelta > 0 && mtx[i - 1][j - 1].value <= mtx[i - 1][j].value)
				|| (lenDelta < 0 && mtx[i - 1][j - 1].value <= mtx[i][j - 1].value)
			)) {
				sent.m[i].checkResult = it;
				nm.push(sent.m[i--]);
				np.push(sent.p[j--]);
			}
			else if((i > -1 && lenDelta > 0) || j == -1) {	// implicitly, mtx[i - 1][j - 1].value > mtx[i - 1][j].value
				sent.m[i].checkResult = new com.hm_x.ice.Ci.CheckResult(sent.m[i], com.hm_x.ice.PoemZi.SPACE);
				nm.push(sent.m[i--]);
				np.push(com.hm_x.ice.PoemZi.SPACE);
				--lenDelta;
			}
			else {	// lenDelta < 0 && mtx[i - 1][j - 1].value > mtx[i][j - 1].value
				var mSpace = new com.hm_x.ice.MetricsZi('　');
				mSpace.checkResult = new com.hm_x.ice.Ci.CheckResult(mSpace, sent.p[j]);
				nm.push(mSpace);
				np.push(sent.p[j--]);
				++lenDelta;
			}
		}
	
		// 保留编辑结果
		sent.m = nm;
		sent.p = np;
	}

	this.init(poemText, metricsText);
}
com.hm_x.ice.Ci.prototype = new Array();

if(!com.hm_x.ice.Ci.CheckResult)
	com.hm_x.ice.Ci.CheckResult = function(mZi, pZi) 
{
	if(!(this.redundantUnmatch = (mZi.zi == '　'))) {	// 与多出来的字匹配
		if(!(this.spaceUnmatch = (pZi.zi == '　'))) {		// 空格不与任何格律匹配
			if(!(this.punctMatch = (mZi.isPunct && pZi.isPunct))) {	// 标点与标点一律匹配
				if(!(this.punctUnmatch = (pZi.isPunct || mZi.isPunct))) {	// 非标点与标点一律不匹配
					if(!(this.unknownMatch = (!pZi.tones || !pZi.tones.length))) {	// 不认识的字都算通过测试，惹不起啊
						// 目前先只做平仄测试
						if(!(this.zhongMatch = mZi.isZhong)) {
							this.matchTone = pZi.tones.detect(function(tone){
								return (mZi.isPing && tone.isPing) || (mZi.isZhe && tone.isZhe);
							});
							if(this.matchTone) {
								this.zheMatch = mZi.isZhe;
								this.pingMatch = mZi.isPing;
							}
							else {
								this.zheUnmatch = mZi.isZhe;
								this.pingUnmatch = mZi.isPing;
							}
						}
					}
				}
			}
		}
	}

	this.matchCause = com.hm_x.ice.Ci.CheckResult.MATCH_CAUSE.detect(function(cause){
		return this[cause];
	}, this);
	this.unmatchCause = com.hm_x.ice.Ci.CheckResult.UNMATCH_CAUSE.detect(function(cause){
		return this[cause];
	}, this);
	this.isMatch = !this.unmatchCause;
}
com.hm_x.ice.Ci.CheckResult.MATCH_CAUSE = ['punctMatch', 'unkownMatch', 'zhongMatch', 'zheMatch', 'pingMatch'];
com.hm_x.ice.Ci.CheckResult.UNMATCH_CAUSE = ['redundantUnmatch', 'spaceUnmatch', 'punctUnmatch', 'zheUnmatch', 'pingUnmatch'];
com.hm_x.ice.Ci.isPunct = function(zi) {
	return ('，。；！？、'.indexOf(zi.zi ? zi.zi : zi) > -1);
}

if(!com.hm_x.ice.MetricsZi)
	com.hm_x.ice.MetricsZi = function(zi)
{
	this.zi = zi;
	this.isPunct = com.hm_x.ice.Ci.isPunct(zi);
	this.isPing = ('平晕耶叠欢'.indexOf(this.zi) >= 0);
	this.isZhe = ('仄韵叶铁换'.indexOf(this.zi) >= 0);
	this.isZhong = (this.zi == '中');
	this.asPing = (this.isPing || this.isZhong);
	this.asZhe = (this.isZhe || this.isZhong);
	
	this.toString = function() {
		return this.zi;
	}
}
// com.hm_x.ice.MetricsZi.SPACE = new com.hm_x.ice.MetricsZi('　');	// 在　controller 中初始化

if(!com.hm_x.ice.PoemZi)
	com.hm_x.ice.PoemZi = function(zi)
{
	this.toString = function() {
		return this.zi;
	}

	this.zi = zi;
	this.isPunct = com.hm_x.ice.Ci.isPunct(zi);
	this.tones = com.hm_x.ice.Controller.rhyme.checkZi(this.zi);
	if(!this.tones)
		return;
		
	this.isPing = Boolean(this.tones.detect(function(tone){
		return tone.isPing;
	}));
	this.isZhe = Boolean(this.tones.detect(function(tone){
		return tone.isZhe;
	}));
	this.isRu = Boolean(this.tones.detect(function(tone){
		return tone.isRu;
	}));
}
// com.hm_x.ice.PoemZi.SPACE = new com.hm_x.ice.PoemZi('　');	// 在　controller 中初始化
