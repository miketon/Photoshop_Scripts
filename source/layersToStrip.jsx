// Copyright 2002-2007.  Adobe Systems, Incorporated.  All rights reserved.
// Photoshop script to open PSD, resize height * numOfLayers and stack 
// Mike Ton : mike.ton@gmail.com
// 8/22/2011

// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
app.bringToFront();

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 2 ;
// debugger    ; //launch debugger on next line

if(app.documents.length > 0){
  // set suspend point for original data just in case
  app.activeDocument.suspendHistory ('layersToStrip', 'layersToStrip()');
}
else{
  alert('Please load a imageSeriesofLayers.psd to layout as strip');
}

function layersToStrip(){

  app.preferences.rulerUnits = Units.PIXELS       ;
  var docRef                 = app.activeDocument ;
  var width                  = docRef.width       ;
  var height                 = docRef.height      ;

  var numLayers = docRef.layers.length -1          ;
  docRef.layers[numLayers].isBackgroundLayer=false ;  // Adobe really sucks!!! : turn off background layer,
                                                      // else will get error trying to translate pixel in that layer
  for(var i = numLayers ; i > -1; i--){               // Topmost layer == 0; Adobe sucks
    var currentLayer = docRef.layers[i]               ;
    currentLayer.rasterize(RasterizeType.ENTIRELAYER) ; //rasterize content
  }

  var myRegion = Array(0,0,width,height) ;
  docRef.crop(myRegion)                  ;

  var offsetY = height * 0.10                                                                ;
  var ypos    = 0                                                                            ;
  var debug   = {msg:"", name:"Mike is cool"}                                                ;
  docRef.resizeCanvas(width, ((height + offsetY) * (numLayers+1)), AnchorPosition.TOPCENTER) ;

  for(var i = 0 ; i < numLayers+1; i++){                          

    var currentLayer = docRef.layers[i] ;
    currentLayer.translate(0, ypos)     ;
    ypos += height  + offsetY           ;

  }
  docRef =null;
}
