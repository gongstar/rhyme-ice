if(typeof(com) == "undefined" || com == null)
	com = new Object();
if(!com.hm_x)
	com.hm_x = new Object();
if(!com.hm_x.ice)
	com.hm_x.ice = new Object();
if(!com.hm_x.ice.Editor)
	com.hm_x.ice.Editor = 
{
	format : null,
	
	init : function(ciTag) {
		if(!ciTag)
			return;
		this.ciTag = ciTag;
			
		$("cp-name").innerHTML = ciTag.getName();
		$("title-editor-cp-name").innerHTML = ciTag.getName();
		$("cp-source-content").innerHTML = ciTag.getSource();

		while($("format-selector").firstChild != $("format-selector").lastChild)
			$("format-selector").removeChild($("format-selector").lastChild);
		var formatCount = ciTag.getFormatCount();
		if(formatCount > 1) {
			for(i = 0; i < formatCount; ++i) {
				var idx = i + 1;
				var opt = document.createElement("option");
				opt.setAttribute("value", "" + idx);
				opt.appendChild(document.createTextNode("格" + idx));
				$("format-selector").appendChild(opt);
			}
			$("format-selector").show();
		}
		else
			$("format-selector").hide();
		if(!this.onChangeFormat.listening) {
			Event.observe("format-selector", "change", this.onChangeFormat.bind(this, $("format-selector")));
			this.onChangeFormat.listening = true;
		}
		
		if(!this.format) {
			this.format = $("format-shower");
		}
		this.onChangeFormat($("format-selector"));
	},
	
	onChangeFormat : function(formatSelector) {
		formatIdx = parseInt(formatSelector.value, 10);
		
		$("cp-comment-content").innerHTML = this.ciTag.getComment(formatIdx);
		$("cp-summary-content").innerHTML = this.ciTag.getSummary(formatIdx);
		
		var parser = new com.hm_x.ice.Parser(this.ciTag.getMetricsText(formatIdx));
		com.hm_x.xml.clearChildren(this.format);
		var para = this.format.appendChild(document.createElement("p"));
		for(var grid = parser.nextGrid(); grid != null; grid = parser.nextGrid()) {
			if(grid.metricsToken == '\n')
				para = this.format.appendChild(document.createElement("p"));
			para.appendChild(grid.getElement());
			if(grid.constructor == com.hm_x.ice.RhymeGrid)
				para.appendChild(new com.hm_x.ice.LiteralGrid("。").getElement());
		}
	}
};

if(!com.hm_x.ice.Parser)
	com.hm_x.ice.Parser = function(metricsText, doc)
{
	this.metricsText = metricsText;
	this.metricsPointer = 0;
	this.prevChar = null;
	
	// 返回 null 表示无下一个格子
	this.nextGrid = function() {
		var curChar = this._nextChar();
		if(!curChar)
			return null;

		switch(curChar) {
		case "（":
			if(this.prevChar) {
				curChar = this._nextChar();
				com.hm_x.debug.assert("韵叠叶换".indexOf(curChar) != -1, "当前格律描述字应为\"韵叠叶换\"四字之一，实际却是\"" + curChar + "\"。");
				if(curChar != "韵")	// “叶韵”、“叠韵”和“换韵”总是两个字，要跳过去一个
					com.hm_x.debug.assert(this._nextChar() == "韵");
				var endChar = this._nextChar();
				com.hm_x.debug.assert(endChar == "）", "当前格律描述字应为\"）\"，实际却是\"" + endChar + "\"。");
				if(curChar != "韵")	// 对于 叠、叶、换 必须要标出来，要不然不好判定
					this.prevChar += curChar;
				return new com.hm_x.ice.RhymeGrid(this.prevChar, doc);
			}
			else
				return new com.hm_x.ice.LiteralGrid(curChar, doc);
		
		case "平":
		case "仄":
		case "中":
		default :
			if(this._peerNextChar() == "（") {
				this.prevChar = curChar;
				return this.nextGrid();
			}
			else {
				this.prevChar = null;
				return makeNormalGrid(curChar, doc);
			}
		}
	};
	
	this._nextChar = function() {
		if(this.metricsPointer >= this.metricsText.length)
			return null;
		return this.metricsText.charAt(this.metricsPointer++);
	}
	
	this._peerNextChar = function() {
		return this.metricsText.charAt(this.metricsPointer);
	}
	
	this._peerPrevChar = function() {
		if(this.metricsPointer < 2)
			return null;
		else
			return this.metricsText.charAt(this.metricsPointer - 2);
	}
}

if(!com.hm_x.ice.Grid)
	com.hm_x.ice.Grid = function (metricsToken, doc)
{
	this.metricsToken = metricsToken;
	if(!doc)
		doc = document;
	
	var spanText = doc.createTextNode(this.metricsToken);
	this.ele = $(doc.createElement("span"));
	this.ele.appendChild(spanText);
	this.ele.addClassName("grid");
	
	this.getElement = function() {
		return this.ele;
	}
}

if(!com.hm_x.ice.RhymeGrid)
	com.hm_x.ice.RhymeGrid = function (metricsToken, doc) 
{
	this.superClass = selectNormalGrid(metricsToken.charAt(0));
	this.superClass(metricsToken.charAt(0), doc);
	this.ele.addClassName("rhyme-grid");
	if(metricsToken.length > 1)
		this.ele.firstChild.nodeValue = metricsToken.charAt(1);
}

if(!com.hm_x.ice.LiteralGrid)
	com.hm_x.ice.LiteralGrid = function (metricsToken, doc)
{
	this.superClass = com.hm_x.ice.Grid;
	this.superClass(metricsToken, doc);
	this.ele.addClassName("literal-grid");
}

if(!com.hm_x.ice.PingGrid)
	com.hm_x.ice.PingGrid = function (metricsToken, doc)
{
	this.superClass = com.hm_x.ice.Grid;
	this.superClass(metricsToken, doc);
	this.ele.addClassName("ping-sheng-grid");
}

if(!com.hm_x.ice.ZheGrid)
	com.hm_x.ice.ZheGrid = function (metricsToken, doc)
{
	this.superClass = com.hm_x.ice.Grid;
	this.superClass(metricsToken, doc);
	this.ele.addClassName("zhe-sheng-grid");
}

if(!com.hm_x.ice.ZhongGrid)
	com.hm_x.ice.ZhongGrid = function (metricsToken, doc)
{
	this.superClass = com.hm_x.ice.Grid;
	this.superClass(metricsToken, doc);
	this.ele.addClassName("zhong-sheng-grid");
}

function selectNormalGrid(metricsToken) {	// 除了带韵之外的格子
	switch(metricsToken) {
	case "平":
		return com.hm_x.ice.PingGrid;
	case "仄":
		return com.hm_x.ice.ZheGrid;
	case "中":
		return com.hm_x.ice.ZhongGrid;
	default :
		return com.hm_x.ice.LiteralGrid;
	}
}

function makeNormalGrid(metricsToken, doc) {
	var gridClass = selectNormalGrid(metricsToken);
	return new gridClass(metricsToken, doc);
}
