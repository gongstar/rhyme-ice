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
	
	this.getRhymeList = function() {
		if(!this.rhymeList) {
			nodes = this.doc.selectNodes("/韵书/韵");
			list = [];
			nodes.each(function(it){
				list[list.length] = new com.hm_x.ice.Rhyme.Dept(it.objectN, this);
			});
			this.rhymeList = list;
		}
			
		return this.rhymeList;
	}
}

// 新声韵
if(!com.hm_x.ice.NewRhyme)
	com.hm_x.ice.NewRhyme = function() 
{
    this.base = com.hm_x.ice.Rhyme;
    this.base("conf/xy.xml");
}

// 平水韵
if(!com.hm_x.ice.PsRhyme)
    com.hm_x.ice.PsRhyme = function()
{
    this.base = com.hm_x.ice.Rhyme;
    this.base("conf/ps.xml");
}

// 词林正韵
if(!com.hm_x.ice.ClRhyme)
	com.hm_x.ice.ClRhyme = function()
{
	this.base = com.hm_x.ice.Rhyme;
	this.base("conf/cl.xml");
}

if(!com.hm_x.ice.Rhyme.Dept)
	com.hm_x.ice.Rhyme.Dept = function(deptNode, rhyme)
{
	this.node = deptNode;
	this.rhyme = rhyme;
	this.toneList = null;
	this.name = this.node.getAttribute("部");
	
	this.getToneList = function() {
		if(!this.toneList) {
			this.toneList = [];
			for(it = this.node.firstChild; it; it = it.nextSibling) {
				if(it.tagName && it.tagName == '调')
					this.toneList[this.toneList.length] = new com.hm_x.ice.Rhyme.Dept.Tone(it, this);
			}
		}
		return this.toneList;
	}
}

if(!com.hm_x.ice.Rhyme.Dept.Tone)
	com.hm_x.ice.Rhyme.Dept.Tone = function(toneNode, dept)
{
	this.node = toneNode;
	this.dept = dept;
	this.name = this.node.getAttribute('名');
	this.dept = this.node.getAttribute('部');	// 对应原平水韵部
}
