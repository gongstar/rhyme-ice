
if(typeof(hm) == typeof(aeptuiol72t4iojkdslt4u8))
	hm = new Object;
if(hm.xml == null)
	hm.xml = new Object;

hm.xml.loadXML = function(xmlFile)
{
	var xmlDoc;
	if(window.ActiveXObject) {
		xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
		xmlDoc.async = false;
	}
	else if (document.implementation && document.implementation.createDocument) {
		xmlDoc = document.implementation.createDocument('', '', null);
	}
	else
		return null;

	xmlDoc.async = false;
	xmlDoc.load(xmlFile);
	return xmlDoc;
}
