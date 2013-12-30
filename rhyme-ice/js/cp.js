if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.Cp)
	com.hm_x.ice.Cp =
{
}

if(!com.hm_x.ice.CpCatalog)
	com.hm_x.ice.CpCatalog =
{
	dom : null,
	
	init : function(catalogXmlFile) {
		this.dom = com.hm_x.xml.loadXML(catalogXmlFile);
		if(this.dom.loadError) {
			alert("载入词谱失败！");
			return false;
		}

		return true;
	},

	getTaxonomy : function() {
		var taxonomyPath = "/词谱/目录/分类法/@名";

		var taxonomyRes = this.dom.selectNodes(taxonomyPath);
		var taxonomy = [];
		taxonomyRes.each(function(item) { taxonomy[taxonomy.length] = item.innerText; });
		return taxonomy;
	},

	getKindList : function(taxonomy) {
		var kindPath = "/词谱/目录/分类法[@名='" + taxonomy + "']/类/@名";

		var selected = this.dom.selectNodes(kindPath);
		var kindList = [];
		selected.each(function(item) {
			kindList[kindList.length] = item.innerText;
		});
		return kindList;
	},
	
	getCiTagList : function(kind) {
		var ciTagPath = "/词谱/词牌集/词牌";
		var kindPattern = "(,|\\s|^)" + kind + "(,|\\s|$)";
		
		var selected = this.dom.selectNodes(ciTagPath);
		var ciTagList = [];

		selected.each(function(item){ 
			var ciTag = item.objectN;
			var ciTagKinds = ciTag.getAttribute("类");
			if(ciTagKinds.search(kindPattern) != -1) {
				ciTagList[ciTagList.length] = ciTag;
			}
		});
		return ciTagList;
	},

	getCiTagNodes : function(tagName) {
		var ciTagPath = "/词谱/词牌集/词牌[@名='" + tagName + "']";
		var resBuf = this.dom.selectNodes(ciTagPath);
		var res = new Array();
		resBuf.each(function(item){
			res[res.length] = item.objectN;
		});
	},
	
	createCiTag : function(ciTagSrc) {
		return new com.hm_x.ice.CiTag(ciTagSrc);
	}
};

if(!com.hm_x.ice.CiTag)
	com.hm_x.ice.CiTag = function(xfn)
{
	this.dom = null;
	
	this._getTextByPath = function(path) {
		var res = this.dom.selectNodes(path);
		if(res.length) {
			return res[0].innerText;
		}
		else
			return null;
	};
	
	this.getName = function() {
		return this._getTextByPath("/词牌/词牌名");
	};
	
	this.getSource = function() {
		return this._getTextByPath("/词牌/来源");
	};
	
	this.getSummary = function(idx) {
		if(com.hm_x.common.isIE && com.hm_x.common.ieVer < 10)
			--idx;	// IE 10 以下版本与标准不符，从0开始计数
		return this._getTextByPath("/词牌/格律[" + idx + "]/格");
	};
	
	this.getFormName = function(idx) {
		if(com.hm_x.common.isIE && com.hm_x.common.ieVer < 10)
			--idx;	// IE 10 以下版本与标准不符，从0开始计数
			
		var name = this._getTextByPath("/词牌/格律[" + idx + "]/@名");
		if(name)
			return name;
		
		if(!com.hm_x.common.isIE || com.hm_x.common.ieVer >= 10)
			--idx;	// IE 10 以上版本与标准相符，从１开始计数
		return '格' + '一二三四五六七八九十'[idx];
	};
	
	this.getComment = function(idx) {
		if(com.hm_x.common.isIE && com.hm_x.common.ieVer < 10)
			--idx;	// IE 10 以下版本与标准不符，从0开始计数
		return this._getTextByPath("/词牌/格律[" + idx + "]/注");
	}
	
	this.getMetricsText = function(idx) {
		if(com.hm_x.common.isIE && com.hm_x.common.ieVer < 10)
			--idx;	// IE 10 以下版本与标准不符，从0开始计数
		return this._getTextByPath("/词牌/格律[" + idx + "]/律")
			.replace(/　| /g, '')										// 全、半角空格都去除
			.replace(/平（韵）/g, '晕。').replace(/仄（韵）/g, '韵。')
			.replace(/平（叶.?）/g, '耶。').replace(/仄（叶.?）/g, '叶。')
			.replace(/平（叠.?）/g, '叠。').replace(/仄（叠.?）/g, '铁。')
			.replace(/平（换.?）/g, '欢。').replace(/平（换.?）/g, '换。')
		;
	};
	
	this.getFormCount = function() {
		var res = this.dom.selectNodes("/词牌/格律");
		return res.length;
	};
	
	// 初始化块
	this.dom = com.hm_x.xml.loadXML(xfn);
	if(this.dom.loadError) {
		var errMsg = "载入词牌文件“" + xfn + "”失败！"
		alert(errMsg);
	}
}
