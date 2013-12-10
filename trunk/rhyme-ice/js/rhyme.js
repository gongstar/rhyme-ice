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
			list[list.length] = new Dept(it.objectN, this);
		});
		this.rhymeList = list;
	};
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
			if(it.tagName && it.tagName == '调')
				this.toneList[this.toneList.length] = new this.constructor.Tone(it, this);
		}
	}
}

if(!com.hm_x.ice.Rhyme.Dept.Tone)
	com.hm_x.ice.Rhyme.Dept.Tone = function(toneNode, dept)
{
	this.node = toneNode;
	this.dept = dept;
	this.name = this.node.getAttribute('名');
	this.desc = this.node.getAttribute('部');	// 对应原广韵韵部
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
	}
}

if(!com.hm_x.ice.NewRhyme.Dept.Tone)
	com.hm_x.ice.NewRhyme.Dept.Tone = function(toneName, dept)
{
	this.dept = dept;
	this.name = toneName;
	this.nodeList = [];
	this.desc = '';
	
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
