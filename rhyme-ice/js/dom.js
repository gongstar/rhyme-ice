
if(typeof(hm) == "undefined")
    hm = new Object;

if(typeof(hm.dom) == "undefined") {
    hm.dom = new Object;

if(!hm.dom.nodeType) {
	hm.dom.nodeType = new Object;
	hm.dom.nodeType.ELEMENT_NODE				= 1 ;
	hm.dom.nodeType.ATTRIBUTE_NODE				= 2 ;
	hm.dom.nodeType.TEXT_NODE 					= 3 ;
	hm.dom.nodeType.CDATA_SECTION_NODE			= 4 ;
	hm.dom.nodeType.ENTITY_REFERENCE_NODE		= 5 ;
	hm.dom.nodeType.ENTITY_NODE					= 6 ;
	hm.dom.nodeType.PROCESSING_INSTRUCTION_NODE = 7 ;
	hm.dom.nodeType.COMMENT_NODE				= 8 ;
	hm.dom.nodeType.DOCUMENT_NODE				= 9 ;
	hm.dom.nodeType.DOCUMENT_TYPE_NODE			= 10;
	hm.dom.nodeType.DOCUMENT_FRAGMENT_NODE		= 11;
	hm.dom.nodeType.NOTATION_NODE				= 12;
}

var isIE = navigator.appName == "Microsoft Internet Explorer";
var isMF = navigator.appName == "Netscape";
var isW3C = !isIE;

///////////////////////////////////////////////////////////////////////
// 对给定的 html 节点作深度优先遍历。
// 对遍历到的每个节点调用 visitMethod，
//   会将节点作为第一个参数传递给 visitMethod
//   自定义的 methodArg 作为第二个参数传给 visitMethod
//   将访问栈作为第三个参数传给 visitMethod
//   如果不需要的话，后两个参数可以安全的忽略
// 如果 visitMethod 返回 true，则遍历结束，返回当前节点
// 如果 visitMethod 一直返回 false，则最终遍历完毕后返回 null
hm.dom.depthIterateNode = function(node, visitMethod, methodArg) {
    if(!node)
        return null;
    var itStack = new Array;
    if(visitMethod(node, methodArg, itStack))
        return node;
    itStack.push(node);

    var curNode = node.firstChild;
    while(itStack.length > 0){
        if(!curNode)
            curNode = itStack.pop().nextSibling;
        else if(visitMethod(curNode, methodArg, itStack))
            return curNode;
        else {
            itStack.push(curNode);
            curNode = curNode.firstChild;
        }
    }

    return null;
}

//////////////////////////////////////////////////////////////////////////////
// 功能与 depthIterateNode 相同, 只是 visitMethod 第三个参数, 指明是在push前
// 调用还是pop前调用, true 为 push 前, false 为 pop 前. 每个节点会调用两次
hm.dom.depthIterateNode2 = function(node, visitMethod, methodArg) {
    if(!node)
        return null;
    var itStack = new Array;
    if(visitMethod(node, methodArg, true, itStack))
        return node;
    itStack.push(node);

    var curNode = node.firstChild;
    while(itStack.length > 0){
        if(!curNode) {
        	if(visitMethod(itStack[itStack.length - 1], methodArg, false, itStack))
        		return itStack.pop();
        	else
            	curNode = itStack.pop().nextSibling;
        }
        else if(visitMethod(curNode, methodArg, true, itStack))
            return curNode;
        else {
            itStack.push(curNode);
            curNode = curNode.firstChild;
        }
    }

    return null;
}

//////////////////////////////////////////////////////////////////////
//  以下是应用 depthIterateNode 的几个常用操作

// 查找第一个指定 tagname 的 node
//     大部分情况下，建议使用内置函数 getElementsByTagName，但该函数的语义
// 与此函数不同。
//     此函数只返回单一值；且如当前根节点符合条件亦会返回之
hm.dom.getFirstNodeWithTagName = function(node, tagName) {
	function isTagName(node, tagName) {
		if(!node.tagName) {
			if(!tagName)
				return true;
			else
				return false;
		}
		return node.tagName.toLowerCase() == tagName.toLowerCase();
	}
	return hm.dom.depthIterateNode(node, isTagName, tagName);
}

hm.dom.getFirstNodeWithAttributeValue = function(node, attrName, attrValue) {
	function checkAttr(node, attrArray) {
		return (node.nodeType && node.nodeType == hm.dom.nodeType.ELEMENT_NODE) && (node.getAttribute(attrArray[0]) == attrArray[1]);
	}

	var attrArr = new Array;
	attrArr[0] = attrName;
	attrArr[1] = attrValue;
	return hm.dom.depthIterateNode(node, checkAttr, attrArr);
}

hm.dom.getNodesWithAttributeValue = function(node, attrName, attrValue) {
	function addNode(node, attrArray) {
		if(		(node.nodeType && node.nodeType == hm.dom.nodeType.ELEMENT_NODE)
			&&	node.getAttribute(attrArray[0]) == attrArray[1]
		)
			attrArray[2].push(node);
		return false;
	}

	var attrArr = new Array;
	attrArr[0] = attrName;
	attrArr[1] = attrValue;
	attrArr[2] = new Array;
	hm.dom.depthIterateNode(node, addNode, attrArr);
	return attrArr[2];
}

hm.dom.deepCopyNode = function(node) {
	if(isW3C)
		return node.cloneNode(true);

	// 有时 cloneNode(true) 在 IE 下不行。所以用这个顶着先
	// 可能的原因是：含有 script 节点时 clone 失败
	function copyNode(node, parentNodePtr, stack) {
		if(node.tagName && node.tagName.toLowerCase() == "script")
			return false;	// 暂时不复制 script
		var newNode = node.cloneNode(false);
		if(stack.length)
			newNode = parentNodePtr[stack.length - 1].appendChild(newNode);
		parentNodePtr[stack.length] = newNode;
		return false;
	}
	
	var parentNodePtr = new Array;
	hm.dom.depthIterateNode(node, copyNode, parentNodePtr);
	if(parentNodePtr.length)
		return parentNodePtr[0];
	else
		return null;
}

hm.dom.getAttributeFromAncestor = function(node, attr) {
	var attrValue = null;
	while(node && !(attrValue = node.getAttribute(attr)))
		node = node.parentNode;
	return attrValue;
}

hm.dom.removeAllChildren = function hm_dom_remove_All_Children(node) {
	while(node.firstChild)
		node.removeChild(node.firstChild);
}

// this function need global.js
hm.dom.getAbsolutePosition = function (node) {
	if(!node)
		return {x:0, y:0};
	var absX = node.offsetLeft;
	var absY = node.offsetTop;

	for(var it = node.offsetParent; it; it = it.offsetParent) {
		absX += it.offsetLeft;
		absY += it.offsetTop;
	}
	
	if(isMF) { // modified for Firefox
		for(var it = node.parentNode; it; it = it.parentNode) {
			if(it.tagName && it.tagName.toLowerCase() == "div") {
				absX -= it.scrollLeft;
				absY -= it.scrollTop;
			}
		}
	}
	return {x:absX, y:absY};
}

hm.dom.getOffsetParent = function js_dom_getOffsetParent(node) {
	if(isMF) {	// a bug of firefox
		var op = node.offsetParent;
		for(var it=node.parentNode; it!=op; it=it.parentNode) {
			if(it.tagName && it.tagName.toLowerCase() == "div")
				return it;
		}
		return op;
	}
	else
		return node.offsetParent;
}

hm.dom.setAbsolutePosition = function (node, x, y) {
	if(node == document.body)
		return;
	var offset = hm.dom.getAbsolutePosition(node.offsetParent);
	node.style.top = "" + (y - offset.y) + "px";
	node.style.left = "" + (x - offset.x) + "px";
}

hm.dom._toStr = function js_dom__toStr(node, str, isPush) {
	if(isPush) {
    	switch(node.nodeType) {
        case hm.dom.nodeType.ELEMENT_NODE:
        	str[0] += "<" + node.nodeName;
        	for(var i=0; i<node.attributes.length; ++i)
        		if(node.attributes[i].specified)
        			str[0] += " " + node.attributes[i].nodeName + "=\"" + hm.xml.encode(node.attributes[i].nodeValue) + "\"";
        	if(str[1] || node.hasChildNodes())
        		str[0] += ">";
        	break;
        case hm.dom.nodeType.TEXT_NODE:
        	str[0] += hm.xml.encode(node.nodeValue);
        	break;
        case hm.dom.nodeType.ATTRIBUTE_NODE:
        case hm.dom.nodeType.CDATA_SECTION_NODE:
        case hm.dom.nodeType.ENTITY_REFERENCE_NODE:
        case hm.dom.nodeType.ENTITY_NODE:
        case hm.dom.nodeType.PROCESSING_INSTRUCTION_NODE:
        case hm.dom.nodeType.COMMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_TYPE_NODE:
        case hm.dom.nodeType.DOCUMENT_FRAGMENT_NODE:
        case hm.dom.nodeType.NOTATION_NODE:
        default:
        	break;
		}
	}
	else {
    	switch(node.nodeType) {
        case hm.dom.nodeType.ELEMENT_NODE:
        	if(str[1] || node.hasChildNodes())
        		str[0] += "</" + node.nodeName + ">";
        	else
        		str[0] += "/>";
        	break;
        case hm.dom.nodeType.ATTRIBUTE_NODE:
        case hm.dom.nodeType.TEXT_NODE:
        case hm.dom.nodeType.CDATA_SECTION_NODE:
        case hm.dom.nodeType.ENTITY_REFERENCE_NODE:
        case hm.dom.nodeType.ENTITY_NODE:
        case hm.dom.nodeType.PROCESSING_INSTRUCTION_NODE:
        case hm.dom.nodeType.COMMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_NODE:
        case hm.dom.nodeType.DOCUMENT_TYPE_NODE:
        case hm.dom.nodeType.DOCUMENT_FRAGMENT_NODE:
        case hm.dom.nodeType.NOTATION_NODE:
        default:
        	break;
		}
	}
	
	return false;
}

hm.dom.toStr = function js_dom_toStr(node, noAbbreviate) {
	var strs = new Array;
	strs[0] = "";
	strs[1] = noAbbreviate;
	hm.dom.depthIterateNode2(node, hm.dom._toStr, strs);
	return strs[0];
}
/*
function _dom_get_elm(elmId){
    if(typeof(elmId) == 'string')
        return document.getElementById(elmId);
    return elmId;
}

hm.dom.isAncestorOf = function(ancestorNode, descendantNode) {
    var testNode = descendantNode;
    while (testNode !== null) {
        if (testNode == ancestorNode) {
            return true;
        }
        testNode = testNode.parentNode;
    }
    return false;
}

hm.dom.importNode = function(targetDocument, sourceNode, importChildren) {
    //if (targetDocument.importNode) {
        // DOM Level 2 Browsers     but Firefox does not show imported nodes ??
        //alert(sourceNode);alert(importChildren);
    //    return targetDocument.importNode(sourceNode, importChildren);
    //} else {
        // Internet Explorer Browsers
        return hm.dom.importNodeImpl(targetDocument, sourceNode, importChildren);
    //}
};

hm.dom.serialize = function(doc){
    if(!doc)
        return "";
    if(window.XMLSerializer){
        return (new XMLSerializer()).serializeToString(doc);
    }else{
        return doc.xml;
    }
}

hm.dom.getText = function(sourceNode){
    var ret = "";
    switch (sourceNode.nodeType) {
    case 3:
        return sourceNode.nodeValue;
    case 4:
        return sourceNode.nodeValue;
    }
    
    if (sourceNode.hasChildNodes()) {
        for (var sourceChildNode = sourceNode.firstChild; sourceChildNode; sourceChildNode = sourceChildNode.nextSibling) {
            ret += hm.dom.getText(sourceChildNode);
        }
    }
    return ret;

}

var DOM_JS_CACHE;
if(!DOM_JS_CACHE)
    DOM_JS_CACHE =  new Object();

hm.dom.loadJs = function(jsUrl, useCache){
    if(useCache){
        var status = DOM_JS_CACHE[jsUrl];
        if(status){
            alert("use js cache");
            return;
        }
    }

    //alert('in');
    var handler = function(xmlHttp){
        try{
            //alert(jsUrl+' response:'+xmlHttp.status+xmlHttp.responseText);
            if(xmlHttp.responseText)
                eval(xmlHttp.responseText);
            DOM_JS_CACHE[jsUrl] = true;
        }catch(e){
        }
    };
    hm.xml.asyncCall(jsUrl,null,handler,"GET");
}

//BUGBUG. EchoDomUtil.importNodeImpl() needs to be updated with a translation table between XHTML attribute
// names and properties.
*/
/**
 * Manual implementation of DOMImplementation.importNode() for clients that do
 * not provide their own (i.e., Internet Explorer 6).
 */
/*
hm.dom.importNodeImpl = function(targetDocument, sourceNode, importChildren) {
    var targetNode, i;
    if(sourceNode.nodeName.toLowerCase() == "script"){
        var src = sourceNode.getAttribute("src");
        if(src){
            var useCache =  false;
            // defaultly xmlhttprequest use UTF-8 encoding
            src = "/hm.jsp?js="+src;
            hm.dom.loadJs(src,useCache);
            return null;
        }

        var s = hm.dom.getText(sourceNode);
        if(s){
            //alert(s);
            try{
                eval(s);
            }catch(e){
                alert("eval script error:"+e.message);
            }
        }
        return null;
    }

    switch (sourceNode.nodeType) {
    case 1:
        targetNode = targetDocument.createElement(sourceNode.nodeName);
        for (i = 0; i < sourceNode.attributes.length; ++i) {
            var attribute = sourceNode.attributes[i];
            if(attribute.name.indexOf("on") == 0){
                if(targetNode.attachEvent){
                    // IE event must be attached, but now it does not recognize 'this' 
                    //if(attribute.name == "onclick"){
                    //    targetNode.onclick = new Function(attribute.value);
                    //}else{
                    //    targetNode.attachEvent(attribute.name,new Function(attribute.value));
                    //}
                    var s = "targetNode."+attribute.name +"=new Function(attribute.value);";
                    eval(s);
                }else{
                    targetNode.setAttribute(attribute.name,attribute.value);
                }
            }else if ("style" == attribute.name) {
                targetNode.style.cssText = attribute.value;
            } else if ("tabindex" == attribute.name) {
                targetNode.tabIndex = attribute.value;
            } else if ("colspan" == attribute.name) {
                targetNode.colSpan = attribute.value;
            } else if ("rowspan" == attribute.name) {
                targetNode.rowSpan = attribute.value;
            } else {
                //targetNode[attribute.name] = attribute.value;
                targetNode.setAttribute(attribute.name,attribute.value);
            }
        }
        break;
    case 3:
        targetNode = targetDocument.createTextNode(sourceNode.nodeValue);
        break;
    }
    
    if (importChildren && sourceNode.hasChildNodes()) {
        for (var sourceChildNode = sourceNode.firstChild; sourceChildNode; sourceChildNode = sourceChildNode.nextSibling) {
            var targetChildNode = hm.dom.importNodeImpl(targetDocument, sourceChildNode, true);
            if(targetChildNode)
                targetNode.appendChild(targetChildNode);
        }
    }
    return targetNode;
};


hm.dom.clearChildren = function(elmId){
    var elm = _dom_get_elm(elmId);
    if(!elm){
        alert('unknown_node::'+elmId);
        return;
    }
    
    while(true){
        var cld = elm.firstChild;
        if(!cld)
            break;
        elm.removeChild(cld);
    }
}

hm.dom.appendChildren = function(elmId, domNode){
    var elm = _dom_get_elm(elmId);
    if(!elm){
        alert('unknown_node::'+elmId);
        return;
    }
    
    var children = domNode.childNodes;
    var i,n=children.length;
    for(i=0;i<n;i++){
        var node = hm.dom.importNode(document,children[i],true);
        if(node)
            elm.appendChild(node);
    }
}

hm.dom.replaceChildren = function(elmId, domNode){
    hm.dom.clearChildren(elmId);
    hm.dom.appendChildren(elmId,domNode);
}

hm.dom.appendChild = function(elmId, domNode){
    var elm = _dom_get_elm(elmId);
    if(!elm){
        alert('unknown_node::'+elmId);
        return;
    }
    var node = hm.dom.importNode(domNode,true);
    if(node)
        elm.appendChild(node);
}

hm.dom.replaceBody = function(elmId, domNode){
   hm.dom.clearChildren(elmId);
   hm.dom.appendChildren(elmId,domNode);
}

hm.dom.replaceInnerHtml = function(elmId, htmlText){
    var elm = _dom_get_elm(elmId);
    if(!elm){
        alert('unknown_node::'+elmId);
        return;
    }
    //alert(elm.innerHTML);
    elm.innerHTML = htmlText;
}
*/
}	// end of if(typeof(hm.dom) == "undefined")

