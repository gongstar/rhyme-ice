if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.Rhyme)
    com.hm_x.ice.Rhyme = function(rhymeFn)
{
	this.doc = com.hm_x.xml.loadXML(rhymeFn);
	if(this.doc.loadError) {
		alert("载入韵书文件 " + rhymeFn + " 失败！");
	}
	this.name = this.doc.documentElement.getAttribute("名");
	this.abbr = this.doc.documentElement.getAttribute("简称");
	this.rhymeList = null;
	
	this.getDeptList = function() {
		if(!this.rhymeList)
			this._makeDeptList();
			
		return this.rhymeList;
	}
	
	this._makeDeptList = function() {
		var nodes = this.doc.selectNodes("/韵书/韵");
		var list = [];
		var Dept = this.constructor.Dept;
		nodes.each(function(it){
			// 线性表与映射表各记一份，以便检索
			dept = new Dept(it.objectN, this);
			list[dept.name] = dept;
			list.push(dept);
		}, this);
		this.rhymeList = list;
	};
	
	this.getDept = function(deptName) {
		return this.getDeptList()[deptName];
	}
	
	this.getMultiTone = function() {
		if(!this.multiTone)
			this._makeMultiTone();
		return this.multiTone;
	}

	this._makeMultiTone = function() {
		var nodeRes = this.doc.selectNodes("/韵书/多音字");
		com.hm_x.debug.assert(nodeRes.length == 1, '“多音字”部分应该只在韵书中只出现一次。');
		var node = nodeRes[0].objectN;
		this.multiTone = new com.hm_x.ice.Rhyme.MultiTone(node, this);
	}
	
	this.checkZi = function(zi) {	// 返回字的音韵信息
		var mt = this.getMultiTone();
		var res = mt.checkZi(zi);
		if(!res) {
			this.getDeptList().detect(function(dept){
				res = dept.checkZi(zi);
				return res;
			});
		}
	
		return res;
	}
}

if(!com.hm_x.ice.Rhyme.MultiTone)
	com.hm_x.ice.Rhyme.MultiTone = function(node, rhyme)
{
	this.node = node;
	this.rhyme = rhyme;
	
	this.checkZi = function (zi) {
		var xpath = "/韵书/多音字/多[@字='" + zi + "']";
		var res = this.rhyme.doc.selectNodes(xpath);
		com.hm_x.debug.assert(res.length < 2, "多音字表中，一个字最多出现一次。");
		
		if(res.length) {
			var ziNode = res[0].objectN;
			var toneList = [];
			var toneText = ziNode.textContent || ziNode.text;	// ie 不支持　w3c 标准属性　textContent
			toneText.split('，').each(function(toneDesc){
				var tonePath = toneDesc.split('－');
				toneList.push(this.getDept(tonePath[0]).getTone(tonePath[1]));
			}, this.rhyme);
			if(toneList.length)
				return toneList;
		}
		
		return null;
	}
}

if(!com.hm_x.ice.Rhyme.Dept)
	com.hm_x.ice.Rhyme.Dept = function(deptNode, rhyme)
{
	this.node = deptNode;
	this.rhyme = rhyme;
	this.toneList = null;
	this.name = this.node.getAttribute("部");
	
	this.getToneList = function() {
		if(!this.toneList)
			this._makeToneList();
		return this.toneList;
	}

	this._makeToneList = function() {
		this.toneList = [];
		for(it = this.node.firstChild; it; it = it.nextSibling) {
			if(it.tagName && it.tagName == '调') {
				var newTone = new this.constructor.Tone(it, this);
				this.toneList.push(newTone);
				this.toneList[newTone.name] = newTone;
			}
		}
	}

	this.getTone = function(toneName) {
		return this.getToneList()[toneName];
	}

	this.checkZi = function(zi) {
		var tone = this.getToneList().detect(function(tone){
			return tone.checkZi(zi);
		});
		return tone ? [tone] : null;
	}
}

if(!com.hm_x.ice.Rhyme.Dept.Tone)
	com.hm_x.ice.Rhyme.Dept.Tone = function(toneNode, dept)
{
	this.node = toneNode;
	this.dept = dept;
	this.name = this.node.getAttribute('名');
	this.desc = this.node.getAttribute('部');	// 对应原广韵韵部
	this.isRu = (this.name.indexOf('入') != -1);
	this.isPing = (this.name.indexOf('平') != -1);
	this.isStrictZhe = (this.name.indexOf('上') != -1 || this.name.indexOf('去') != -1 || this.name.indexOf('仄') != -1);
	this.isZhe = (this.isRu || this.isStrictZhe);
	
	this.checkZi = function(zi) {
		var text = this.node.text || this.node.textContent;
		return text.indexOf(zi) >= 0;
	}
}

////////////////////////////////////////////////////////////
// 新声韵
if(!com.hm_x.ice.NewRhyme)
	com.hm_x.ice.NewRhyme = function() 
{
   this.base = com.hm_x.ice.Rhyme;
   this.base("conf/xy.xml");
}

if(!com.hm_x.ice.NewRhyme.Dept)
	com.hm_x.ice.NewRhyme.Dept = function(deptNode, rhyme)
{
	this.base = com.hm_x.ice.Rhyme.Dept;
	this.base(deptNode, rhyme);
	
	this._makeToneList = function() {
		var ping = new this.constructor.Tone('平', this);
		var zhe = new this.constructor.Tone('仄', this);
		// var ru = new this.constructor.Tone('入', this);
		for(it = this.node.firstChild; it; it = it.nextSibling) {
			if(it.tagName && it.tagName == '调') {
				var toneName = it.getAttribute('名');
				if(toneName == '阴' || toneName == '阳')
					ping.add(it);
				else
					zhe.add(it);
			}
		}
		this.toneList = [ping, zhe];
		this.toneList[ping.name] = ping;
		this.toneList[zhe.name] = zhe;
	}
}

if(!com.hm_x.ice.NewRhyme.Dept.Tone)
	com.hm_x.ice.NewRhyme.Dept.Tone = function(toneName, dept)
{
	this.dept = dept;
	this.name = toneName;
	this.nodeList = [];
	this.desc = '';
	this.isRu = (this.name == '入');
	this.isPing = (this.name == '平');
	this.isStrictZhe = (this.name == '仄');
	this.isZhe = (this.isRu || this.isStrictZhe);
	
	this.add = function(node) {
		this.nodeList[this.nodeList.length] = node;
		this.desc += node.getAttribute('名');
	}
}

////////////////////////////////////////////////////////////
// 平水韵
if(!com.hm_x.ice.PsRhyme)
    com.hm_x.ice.PsRhyme = function()
{
   this.base = com.hm_x.ice.Rhyme;
   this.base("conf/ps.xml");
}
com.hm_x.ice.PsRhyme.Dept = function(deptNode, rhyme)
{
	this.base = com.hm_x.ice.Rhyme.Dept;
	this.base(deptNode, rhyme);
}
com.hm_x.ice.PsRhyme.Dept.Tone = function(toneNode, dept)
{
	this.base = com.hm_x.ice.Rhyme.Dept.Tone;
	this.base(toneNode, dept)
}


////////////////////////////////////////////////////////////
// 词林正韵
if(!com.hm_x.ice.ClRhyme)
	com.hm_x.ice.ClRhyme = function()
{
	this.base = com.hm_x.ice.Rhyme;
	this.base("conf/cl.xml");
}

if(!com.hm_x.ice.ClRhyme.Dept)
	com.hm_x.ice.ClRhyme.Dept = com.hm_x.ice.Rhyme.Dept;
