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

function initUI(){

  var ui            = new Window('dialog', 'layersToStrip')                      ; //, {closeButton:'true'}) ;
  // this.windowRef = ui                                                         ;
  var panel         = ui.add('panel', undefined, 'Offset percentage'           ) ;
  var slidOffset    = panel.add('slider', undefined, 16, 0, 32                 ) ;
  var intOffset     = Math.round(slidOffset.value                              ) ;
  var offset        = panel.add('staticText', undefined, intOffset             ) ;
  var bttnHorizn    = panel.add('button', undefined, 'Horizontal'              ) ;
  var bttnVertcl    = panel.add('button', undefined, 'Vertical'                ) ;
  var bttnCancel    = panel.add('button', undefined, 'Cancel', {name:'cancel'} ) ;

  slidOffset.onChanging = function(){
    intOffset = Math.round(slidOffset.value) ;
    offset.text = intOffset                  ;
  }                                          ;

  bttnHorizn.onClick = function(){
    layersToStrip(intOffset, true)             ;
    //Number call back returns button click id ; also closes process
    this.parent.parent.close(0)                ;
  }                                            ;

  bttnVertcl.onClick = function(){
    layersToStrip(intOffset, false) ;
    this.parent.parent.close(1)     ;
  }                                 ;

  bttnCancel.onClick = function(){
    this.parent.parent.close(2) ;
  }                             ;

  ui.show();
}

function layersToStrip(offset_IN, bool_Landscape){

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

  var offsetX = offset_IN ; //*width  ;
  var offsetY = offset_IN ; //*height ;
  var xpos    = 0         ;
  var ypos    = 0         ;

  if(bool_Landscape == true){
    docRef.resizeCanvas(((width+offsetX)*(numLayers+1))-offsetX*2, height, AnchorPosition.TOPLEFT) ;
  }
  else{
    docRef.resizeCanvas(width, ((height+offsetY)*(numLayers+1))-offsetY*2, AnchorPosition.TOPLEFT) ;
  }

  for(var i = 0 ; i < numLayers+1; i++){                          
    var currentLayer = docRef.layers[i] ;
    if(bool_Landscape == true){
      currentLayer.translate(xpos, 0) ;
      xpos += width + offsetX         ;
    }
    else{
      currentLayer.translate(0, ypos) ;
      ypos += height + offsetY        ;
    }
  }
  docRef =null;
}

function layersToStrip_Init(){
  if(app.documents.length > 0){
    // set suspend point for original data just in case
    app.activeDocument.suspendHistory ('layersToStrip', 'initUI()');
  }
  else{
    alert('Please load a imageSeriesofLayers.psd to layout as strip');
  }
}

function debugMessage(msg){
  alert('debug: '+msg);
}

layersToStrip_Init();
