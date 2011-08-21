// Copyright 2002-2007.  Adobe Systems, Incorporated.  All rights reserved.
// Photoshop script to open GIF, crop and save as indivdual files
// Mike Ton : mike.ton@gmail.com
// 8/20/2011

// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
app.bringToFront();

if(app.documents.length > 0){
    //set suspend point for original data just in case
  app.activeDocument.suspendHistory ('exportingGIF', 'exportGifFrames()');
}
else{
  alert('Please load a image.gif to export!');
}

function exportGifFrames(){

  app.preferences.rulerUnits = Units.PIXELS ;
  var bounds = new Array(95, 0, 250, 175)   ;
  //The region parameter is an array of four coordinates, [left, top, right, bottom].
  //var bounds = Array(Array(95, 175), Array(95,0), Array(250,0), Array(250,175), Array(95,175)); //250, 175);
  //app.activeDocument.selection.select(bounds);

  var docRef = app.activeDocument                                 ;
  var docPth = app.activeDocument.fullName.toString().split('\.') ;
  var docTyp = new GIFSaveOptions()                               ;

  var numLayers = app.activeDocument.layers.length ;
  var count     = 0                                ;

  for(var i = numLayers -1; i > -1; i--){                           //Topmost layer == 0; Adobe sucks
    var fileName = docPth[0]+'_'+PrefixInteger(count, 2) ;
    docRef.layers[i].copy()                              ;
      //perform crop and save on temp document
    var docTmp = app.documents.add(docRef.width, docRef.height, docRef.resolution, "mt_TempCopy"+i) ;
    docTmp.paste()                                                                                  ;
    docTmp.flatten()                                                                                ;
    docTmp.crop(bounds)                                                                             ;
    docTmp.saveAs(new File(fileName), docTyp, true)                                                 ;
    docTmp.close(SaveOptions.DONOTSAVECHANGES)                                                      ;

    count++                                                                                         ;
  }
}

  //Snippet from  : http://code.google.com/p/jslibs/wiki/JavascriptTips#language_advanced_Tips_&_Tricks
function PrefixInteger(num, length) {  
  return (Array(length).join('0') + num).slice(-length);
}

//debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
//$.level = 2;
//debugger; // launch debugger on next line
