function Cp_T(xmlDoc) {
	// ���ǰ������
	if(typeof(hm) == "undefined" || typeof(hm.dom) == "undefined")
		alert("error: δ���� hm.dom ��");

	this.i_name = null;
	this.i_source = null;
	this.i_abbr = null;
	this.i_rule = null;
	this.i_comment = null;
	
	hm.dom.depthIterateNode(
		xmlDoc.documentElement,
		function(item, cp) {
			if(item.firstChild) {	// ���û���ݣ���û��һ����
				switch(item.tagName) {
				case "������":
					cp.i_name = item.firstChild.nodeValue;
					break;
				case "��Դ":
					cp.i_source = item.firstChild.nodeValue;
					break;
				case "Ҫ��":
					cp.i_abbr = item.firstChild.nodeValue;
					break;
				case "����":
					cp.i_rule = item.firstChild.nodeValue;
					break;
				case "ע��":
					cp.i_comment = item.firstChild.nodeValue;
					break;
				}
			}
			return false;
		},
		this
	);
}
