function Cp_T(xmlDoc) {
	// 检查前置条件
	if(typeof(hm) == "undefined" || typeof(hm.dom) == "undefined")
		alert("error: 未载入 hm.dom 库");

	this.i_name = null;
	this.i_source = null;
	this.i_abbr = null;
	this.i_rule = null;
	this.i_comment = null;
	
	hm.dom.depthIterateNode(
		xmlDoc.documentElement,
		function(item, cp) {
			if(item.firstChild) {	// 如果没内容，和没有一样啊
				switch(item.tagName) {
				case "词牌名":
					cp.i_name = item.firstChild.nodeValue;
					break;
				case "来源":
					cp.i_source = item.firstChild.nodeValue;
					break;
				case "要点":
					cp.i_abbr = item.firstChild.nodeValue;
					break;
				case "格律":
					cp.i_rule = item.firstChild.nodeValue;
					break;
				case "注解":
					cp.i_comment = item.firstChild.nodeValue;
					break;
				}
			}
			return false;
		},
		this
	);
}
