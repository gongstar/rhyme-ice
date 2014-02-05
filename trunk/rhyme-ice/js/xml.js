if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.xml)
	com.hm_x.xml = 
{

ELEMENT_NODE				: 1,
ATTRIBUTE_NODE				: 2,
TEXT_NODE					: 3,
CDATA_SECTION_NODE			: 4,
ENTITY_REFERENCE_NODE		: 5,
ENTITY_NODE					: 6,
PROCESSING_INSTRUCTION_NODE	: 7,
COMMENT_NODE				: 8,
DOCUMENT_NODE				: 9,
DOCUMENT_TYPE_NODE			: 10,
DOCUMENT_FRAGMENT_NODE		: 11,
NOTATION_NODE				: 12,

loadXML : function(xmlFile)
{
	var xmlDoc;
	if(SoftXMLLib) 	// 如果有 SoftXMLLib 库，那就用它
		xmlDoc = new SoftXMLLib();
	else if(window.ActiveXObject)
		xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
	else if (document.implementation && document.implementation.createDocument)
		xmlDoc = document.implementation.createDocument('', '', null);
	else
		return null;

	xmlDoc.async = false;
	if(xmlDoc.load)
		xmlDoc.load(xmlFile);
	else {	// chrome
		xmlDoc = null;
		if(window.XMLHttpRequest) {	// chrome 似乎只能用这种方法
			var xhttp = new XMLHttpRequest();
			if(xhttp && xhttp.open) {
				xhttp.open("GET", xmlFile, false);
				xhttp.send(null);
				
				xmlDoc = xhttp.responseXML;
			}
		}
	}
	return xmlDoc;
},

// 以下 API 模仿 prototype 的 Enumrable 接口
each : function(domNode, act, context){
	if(!domNode)
		return false;
	if(domNode.documentElement)
		domNode = domNode.documentElement;
		
	var curNode = domNode;
	do {
		act.call(context, curNode);
		curNode = this._getNextNode(curNode, domNode);
	} while(curNode);
},

detect : function(domNode, act, context) {
	if(!domNode)
		return false;
	if(domNode.documentElement)
		domNode = domNode.documentElement;
		
	var curNode = domNode;
	do {
		if(act.call(context, curNode))
			break;
		else
			curNode = this._getNextNode(curNode, domNode);
	} while(curNode);
	
	return curNode;
},

filter : function(domNode, act, context) {
	var res = [];
	this.each(domNode, function(node){
		if(act.call(this, node))
			res.push(node);
	}, context);
	return res;
},

// 对 domNode 及其后代节点进行遍历，对每个节点应用 act 动作，并每次将 param 参数传递给 act
// act 有两个参数： 第一个是节点的引用，第二个是 param
// 如果 act 返回 true ，遍历继续进行，否则遍历中止
depthIterate : function(domNode, act, param) {
	if(!domNode)
		return false;
	if(domNode.documentElement)	// 让这个函数对于 dom document 也可以用
		domNode = domNode.documentElement;

	var curNode = domNode;
	do {
		if(!act(curNode, param))
			return false;
		curNode = this._getNextNode(curNode, domNode);
	} while(curNode);

	return true;
},

// 基本与 depthIterate 一样，但是每个节点 act 会被调用两次，一次是开始标记，一次是结束标记
// act 多了最后一个参数： true 表示开始标记, false 表示结束标记
depthIterateWithClose : function(domNode, act, param) {
	if(!domNode)
		return false;
	if(domNode.documentElement)
		domNode = domNode.documentElement;
	
	var curNode = domNode;
	do {
		if(!act(curNode, param, true))
			return false;
		var nc = this._getNextNodeWithClose(curNode, domNode);
		curNode = nc.n;
		var closeList = nc.c;
		for(var i in closeList) {
			if(!act(closeList[i], param, false))
				return false;
		}
	} while(curNode);
	
	return true;
},

clearChildren : function(node){
	for(var i = node.lastChild; i; i = node.lastChild)
		node.removeChild(i);
},

///////////////////////////////////////////////////
// 以下是辅助方法
_getNextNode : function(node, endNode) {
	if(node.hasChildNodes())
		return node.firstChild;
	else {
		var traceNode = node;
		while(traceNode != endNode) {
			if(traceNode.nextSibling)
				return traceNode.nextSibling;
			else
				traceNode = traceNode.parentNode;
		}
	}
	
	return null;
},

_getNextNodeWithClose : function(node, endNode) {
	var nodeStack = [];
	if(node.hasChildNodes())
		return {n : node.firstChild, c : nodeStack};
	else {
		var traceNode = node;
		while(traceNode != endNode) {
			nodeStack.push(traceNode);
			if(traceNode.nextSibling)
				return {n : traceNode.nextSibling, c : nodeStack};
			else
				traceNode = traceNode.parentNode;
		}
	}
	
	return {n : null, c : nodeStack};
}

}	// end of com.hm_x.xml
