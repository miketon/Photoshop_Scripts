// Copyright 2002-2007.  Adobe Systems, Incorporated.  All rights reserved.
// Photoshop script to format strip to layers
// Mike Ton : mike.ton@gmail.com
// 2/14/2012

// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// in case we double clicked the file
app.bringToFront();

function initUI(){
    
  var defaultFrame = app.activeDocument.width/app.activeDocument.height;
  
  var ui               = new Window    ( 'dialog', 'stripToLayers'             )          ; //, {closeButton:'true'} ) ;
  var pSettings        = ui.add        ( 'panel', undefined, 'Settings'        )          ;
  var gEmpty           = pSettings.add ( 'group', undefined, 'Empty'           )          ;

  var panel            = pSettings.add ( 'panel', undefined, 'Frames'                   ) ;
  var gOffset          = panel.add     ( 'group', undefined, 'Frames'                   ) ;
  var slidOffset       = gOffset.add   ( 'slider', undefined, defaultFrame, 1, 32       ) ;
  var intOffset        = Math.round    ( slidOffset.value                               ) ;
  var offset           = gOffset.add   ( 'staticText', undefined, intOffset             ) ;
  var gFunc            = ui.add        ( 'group', undefined, 'Functions'                ) ;
  var bttnAction       = gFunc.add     ( 'button', undefined, 'Ok', {name:'ok'}         ) ;
  var bttnCancel       = gFunc.add     ( 'button', undefined, 'Cancel', {name:'cancel'} ) ;

  slidOffset.onChanging = function(){
    intOffset   = Math.round(slidOffset.value) ;
    offset.text = (intOffset)                  ;
  } 

  bttnAction.onClick = function() {
    stripToLayers(intOffset)    ;
    this.parent.parent.close(1) ; //returns button click id. also closes process
  }

  bttnCancel.onClick = function(){
    this.parent.parent.close(0) ;
  } 

  ui.show();
}

function stripToLayers(frames_IN){

  app.preferences.rulerUnits = Units.PIXELS       ;
  var docRef                 = app.activeDocument ;
  var docPth                                      ;
  if (OperatingSystem=="WINDOWS"){
    docPth = app.activeDocument.fullName.toString().split('\\'); //get path Windows
  }
  else{
    docPth = app.activeDocument.fullName.toString().split('\/') ; //get path Unix/Mac OSX
  }
  var docName     = docPth[docPth.length-1].toString().split('\.')[0] ; //cull suffix and get Name
  var width       = docRef.width                                      ;
  var height      = docRef.height                                     ;
  var width_layer = width/frames_IN                                   ;
  
  docRef.flatten(); 
  
  var docTmp = app.documents.add(width_layer, height, docRef.resolution, docName + "_temp") ;
  
  for(var i = 0; i < frames_IN; i++){               // Topmost layer == 0; Adobe sucks
      //The region parameter is an array of four coordinates, [left, top, right, bottom].
     var x_begin = i * width_layer                                                                                             ;
     var x_end   = x_begin + width_layer                                                                                       ;
     var bounds  = Array(Array(x_begin, height), Array(x_begin,0), Array(x_end,0), Array(x_end,height), Array(x_begin,height)) ;

     app.activeDocument = docRef     ; //set source document
     docRef.selection.select(bounds) ; //set selection marquee
     docRef.selection.copy()         ; //select pixel in marquee
     app.activeDocument = docTmp     ; //set target document
     docTmp.paste()                  ; //paste to target document
  }

  docTmp.layers[frames_IN].remove() ; //removing bottom background layer
  docTmp = null                     ;
  docRef = null                     ;
}

function stripToLayers_Init(){
  if(app.documents.length > 0){
    // set suspend point for original data just in case
    app.activeDocument.suspendHistory ('stripToLayers', 'initUI()');
  }
  else{
    debugMessage('Please load a imageStrip.psd to generate new doc series of layer layout');
  }
}

function debugMessage(msg){
  alert('debug: '+msg);
}

stripToLayers_Init();

