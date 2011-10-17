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

  var ui               = new Window    ( 'dialog', 'layersToStrip'             )          ; //, {closeButton:'true'} ) ;
  var pSettings        = ui.add        ( 'panel', undefined, 'Settings'        )          ;
  var gEmpty           = pSettings.add ( 'group', undefined, 'Empty'           )          ;
  var gOrient          = pSettings.add ( 'group', undefined, 'Orientation'     )          ;
  var bLandscape       = gOrient.add   ( 'radiobutton', undefined, 'Landscape' )          ;
      bLandscape.value = true                                                             ;
  var bPortrait        = gOrient.add   ( 'radiobutton', undefined, 'Portrait'           ) ;
      gEmpty           = pSettings.add ( 'group', undefined, 'Empty'                    ) ;
  var panel            = pSettings.add ( 'panel', undefined, 'Offset'                   ) ;
  var gOffset          = panel.add     ( 'group', undefined, 'Offset'                   ) ;
  var slidOffset       = gOffset.add   ( 'slider', undefined, 16, 0, 32                 ) ;
  var intOffset        = Math.round    ( slidOffset.value                               ) ;
  var offset           = gOffset.add   ( 'staticText', undefined, intOffset+'px'        ) ;
  var gFunc            = ui.add        ( 'group', undefined, 'Functions'                ) ;
  var bttnAction       = gFunc.add     ( 'button', undefined, 'Ok', {name:'ok'}         ) ;
  var bttnCancel       = gFunc.add     ( 'button', undefined, 'Cancel', {name:'cancel'} ) ;

  slidOffset.onChanging = function(){
    intOffset   = Math.round(slidOffset.value) ;
    offset.text = (intOffset+'px')             ;
  } 

  bttnAction.onClick = function() {
    if(bLandscape.value==true)    { layersToStrip(intOffset, true) ;  }
    else                          { layersToStrip(intOffset, false);  }
    //returns button click id ; also closes process
    this.parent.parent.close(1)                ;
  }

  bttnCancel.onClick = function(){
    this.parent.parent.close(0) ;
  } 

  ui.show();
}

function layersToStrip(offset_IN, bool_Landscape){

  app.preferences.rulerUnits = Units.PIXELS       ;
  var docRef                 = app.activeDocument ;
  var width                  = docRef.width       ;
  var height                 = docRef.height      ;
    //init document
  var numLayers = docRef.layers.length -1          ;
  docRef.layers[numLayers].isBackgroundLayer=false ;  // Adobe really sucks!!! : turn off background layer,
                                                      // else will get error trying to translate pixel in that layer
  for(var i = numLayers ; i > -1; i--){               // Topmost layer == 0; Adobe sucks
    var currentLayer = docRef.layers[i]               ;
    currentLayer.rasterize(RasterizeType.ENTIRELAYER) ; //rasterize content
    currentLayer.visible = true                       ;
  }
    //config landscape/portrait strip
  var offsetX = 0 ;
  var offsetY = 0 ;
  var offsetC = 0 ;
  if(bool_Landscape == true){
    offsetX = width+offset_IN                                    ; //*width ;
    offSetC = (offsetX*(numLayers+1)) - (offset_IN*2)            ;
    docRef.resizeCanvas(offSetC, height, AnchorPosition.TOPLEFT) ;
  }
  else{
    offsetY = height+offset_IN                                  ; //*width ;
    offSetC = (offsetY*(numLayers+1)) - (offset_IN*2)           ;
    docRef.resizeCanvas(width, offSetC, AnchorPosition.TOPLEFT) ;
  }
    //process/xform landscape/portrait layers
  var xpos    = 0 ;
  var ypos    = 0 ;
  for(var i = 0 ; i < numLayers+1; i++){                          
    var currentLayer = docRef.layers[i] ;
    currentLayer.translate(xpos, ypos)  ;
    xpos += offsetX                     ;
    ypos += offsetY                     ;
  }

  docRef = null;
}

function layersToStrip_Init(){
  if(app.documents.length > 0){
    // set suspend point for original data just in case
    app.activeDocument.suspendHistory ('layersToStrip', 'initUI()');
  }
  else{
    debugMessage('Please load a imageSeriesofLayers.psd to layout as strip');
  }
}

function debugMessage(msg){
  alert('debug: '+msg);
}

layersToStrip_Init();
