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
		if(res.length)
			return res[0].innerText;
		else
			return null;
	};
	
	this.getName = function() {
		return this._getTextByPath("/词牌/词牌名/text()");
	};
	
	this.getSource = function() {
		return this._getTextByPath("/词牌/来源");
	};
	
	this.getSummary = function() {
		return this._getTextByPath("/词牌/要点");
	};
	
	this.getComment = function() {
		return this._getTextByPath("/词牌/注解");
	};
	
	this.getMetricsText = function() {
		return this._getTextByPath("/词牌/格律");
	};
	
	// 初始化块
	this.dom = com.hm_x.xml.loadXML(xfn);
	if(this.dom.loadError) {
		var errMsg = "载入词牌“" + tagNode.getAttribute("名") + "”失败！"
		alert(errMsg);
	}
}
