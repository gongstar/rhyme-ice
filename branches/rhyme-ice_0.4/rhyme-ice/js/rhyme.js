function Rhyme_T(rhs) {
	this.i_rhyme = (rhs ? rhs.i_rhyme : null);
	this.i_tone = (rhs ? rhs.i_tone : null);
	this.i_isRu = (rhs ? rhs.i_isRu : null);
	
	this.isNullTone = function() {
		return "阴阳".include(this.i_tone);
	}
	this.isSharpTone = function() {
		return "上去".include(this.i_tone);
	}
	this.isRuTone = function() {
		return (this.i_isRu ? this.i_isRu : false);
	}
	this.isRhyming = function(rhyme) {
		return this.i_rhyme == rhyme;
	}
}

function RhymeWord_T(word, rhyme) {
	this.i_word = word;
	this.i_rhymeList = new Array;
	if(rhyme)
		this.i_rhymeList.push(rhyme);
	
	this.appendRhyme = function rhyme_word_append_rhyme(rhyme) {
		this.i_rhymeList.push(rhyme);
	}
	this.isNullTone = function() {
		for(var i=0; i<this.i_rhymeList.length; ++i) {
			if(this.i_rhymeList[i].isNullTone())
				return true;
		}
		return false;
	}
	this.isSharpTone = function() {
		for(var i=0; i<this.i_rhymeList.length; ++i) {
			if(this.i_rhymeList[i].isSharpTone())
				return true;
		}
		return false;
	}
	this.isRuTone = function() {
		for(var i=0; i<this.i_rhymeList.length; ++i) {
			if(this.i_rhymeList[i].isRuTone())
				return true;
		}
		return false;
	}
	this.isRhyming = function(rhyme) {
		for(var i=0; i<this.i_rhymeList.length; ++i) {
			if(this.i_rhymeList[i].isRhyming())
				return true;
		}
		return false;
	}
}

function RhymeTable_T(xmlFileName) {
	var xml = hm.xml.loadXML(xmlFileName);
	if(!xml) {
		alert("无法载入韵书！");
		return;
	}
	
	this.i_words = new Array;
	this.i_rhymeDepartList = new Array;
	this.i_rhymeMatrix = new Array;

	var curRhyme = new Rhyme_T;
	var curIsWord = false;
	function rhymeGetter(node, theTable) {
		if(node && node.nodeType == hm.dom.nodeType.ELEMENT_NODE) {
			if(node.tagName == "韵") {
				curRhyme.i_rhyme = node.getAttribute("部");
				curRhyme.i_tone = null;
				curRhyme.i_isRu = null;
				curIsWord = false;
				theTable.i_rhymeDepartList.push(curRhyme.i_rhyme);
				theTable.i_rhymeMatrix[curRhyme.i_rhyme] = new Array;
			}
			else if(node.tagName == "调") {
				curRhyme.i_tone = node.getAttribute("名");
				curRhyme.i_isRu = null;
				curIsWord = false;
				theTable.i_rhymeMatrix[curRhyme.i_rhyme][curRhyme.i_tone] = new Array;
			}
			else if(node.tagName == "字") {
				var isRu = node.getAttribute("入声");
				if(isRu) {	// 除此之外，状态不变
					if(isRu == "是")
						curRhyme.i_isRu = true;
					else
						curRhyme.i_isRu = false;
				}
				curIsWord = true;
			}

			return false;
		}
		
		if(!curIsWord)
			return false;
		if(node && node.nodeType == hm.dom.nodeType.TEXT_NODE) {
			var str = node.nodeValue;
			for(var i=0; i<str.length; ++i) {
				var word = str.charAt(i);
				if(" \t\n　".include(word))
					continue;
				if(theTable.i_words[word])
					theTable.i_words[word].appendRhyme(new Rhyme_T(curRhyme));
				else
					theTable.i_words[word] = new RhymeWord_T(word, new Rhyme_T(curRhyme));
				theTable.i_rhymeMatrix[curRhyme.i_rhyme][curRhyme.i_tone].push(word);
			}
		}
		
		return false;
	}
	
	hm.dom.depthIterateNode(xml.documentElement, rhymeGetter, this);
	
	this.isNullTone = function(word) {
		if(!this.i_words[word])
			return false;
		return this.i_words[word].isNullTone();
	}
	this.isSharpTone = function(word) {
		if(!this.i_words[word])
			return false;
		return this.i_words[word].isSharpTone();
	}
	this.isRuTone = function(word) {
		if(!this.i_words[word])
			return false;
		return this.i_words[word].isRuTone();
	}
}
