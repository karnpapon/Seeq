function Seeq(){
  
  // components installation.
  const Content = require('./content')
  const Sequencer = require('./unused/sequencer')
  const Console = require('./console')
  const Displayer = require('./displayer')
  const Clock = require('./clock')
  const IO = require('./io')
  const { $, el, qs, scale, isChar} = require('./lib/utils')

  this.content = new Content(this)
  this.io = new IO(this)
  this.seq = new Sequencer(this)
  this.masterClock = [new Clock(120)] 
  this.console = new Console(this)
  this.displayer = new Displayer(this)

  // ------------------------------------

  // DOM installation.
  this.appWrapper = el("appwrapper")
  this.el = el("app");
  this.el.style.opacity = 0;
  this.el.id = "seeq";
  this.appWrapper.appendChild(this.el)
  this.wrapper_el = el("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")
  this.infoDisplay
  document.body.appendChild(this.appWrapper);

  // ------------------------------------

  // Ajax.
  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"
  this.isGettingData = false

  // -----------------------------------

  // Cursor.
  this.matchedPosition = []

  // -----------------------------------

  this.start = function(){
    this.console.build()
    this.displayer.build()
    this.content.build()
    this.console.toggleInsert()
    this.io.start()
    setTimeout(seeq.show,200)
  }

  this.show = function () {
    seeq.el.style.opacity = 1;
  }

  this.fetch = function(){
    this.startFetch()
  }

  this.trimmedContents = function(txt){
    let dataText = txt
    var limitedChar = 1090
    var trimmedText = dataText.substring(0, limitedChar)
    return trimmedText
  }

  this.getMatchedPosition = function(){
    var searchFrom = canvas.texts
    let trimmed = this.trimmedContents(searchFrom)
    let target, search, noBracketTarget
    var match, query

    if(this.console.searchType === 'regex'){
      query = this.console.regexInput
      target = query.replace(/[)(]/g, "\\$&");
      if(target){
        try{ search = new RegExp("(" + target + ")","ig")  //TODO: make this configurable.
      } catch(e) { console.log("invalid regular expression")}
      }
    } else {
      target = this.console.searchValue
      noBracketTarget = target.replace(/[\])}[{(]/g, ''); 
      if( noBracketTarget){
        try { search = new RegExp(`(${noBracketTarget})`,"gi") } catch(e) { console.log("invalid value.")}
      }
    }

    if(search && target !== ""){
      canvas.p = []
      this.matchedPosition = []
      if (target !== ""){
        while( match = search.exec(trimmed)){
          this.matchedPosition.push({
            index: match.index, 
            len: match.length == 2? match[0].length:0 
          })
        } 
      }
  
      if(this.matchedPosition){
        this.matchedPosition.forEach(pos => {
          if (pos.len > 0) {
            let len = 0
            for (var i = 0; i < pos.len; i++) {
              canvas.p.push(canvas.seequencer.posAt(pos.index + len))
              len++
            }
          } else {
            canvas.p.push(canvas.seequencer.posAt(pos.index))
          }
        })
      }
    } else {
      canvas.clearMarksPos()
    }
    
  }

  this.startFetch = function(){
    this.getData()
  }

  this.repaint = function(res){
    canvas.reset()
    canvas.writeData(res)
    canvas.clock.reset()
    canvas.update()
  }

  this.getData = function() {
    var data = ""
    var res = ""
    
    seeq.content.loading.classList.add("loading")

    axios({
      method: "get",
      url: seeq.url + seeq.console.fetchSearchInput + seeq.urlEnd,
      responseType: "json"
    })
    .then((resp) => {
      var { pages } = resp.data.query
      Object.keys(pages).map((field) => {
        data = pages[field]
      })
      if(data){
        res = data.extract
        seeq.repaint(res)
        seeq.console.setTotalLenghtCounterDisplay()
        seeq.isGettingData = false
        seeq.content.loading.classList.remove("loading")
      }
    })
    .catch((error) => {
      res = `sorry ${error}, please try again..`
      seeq.isGettingData = false
      seeq.content.loading.classList.remove("loading")
      seeq.repaint(res)
    });
  }

  this.splitArrayNoteAndOctave = function(inputText) {
    var output = [];
    var arr = inputText.split(',');
    arr.forEach(function (item) {
        output.push(item.split(/(\d+)/).filter(Boolean));
    });
    return output;
  }

  this.splitSingleNoteAndOctave = function(note){
    var output = []
    output.push(note.split(/(\d+)/).filter(Boolean));
    return output
  }

  this.parser = function( item, type ){
    let res = []
    if(type == 'note'){
      if (item.indexOf(',') > -1) { 
        res = this.splitArrayNoteAndOctave(item)
      } else {
        res = this.splitSingleNoteAndOctave(item)
      }
    } else {
      if (item.indexOf(',') > -1) { 
        res = item.split(',')
      } else {
        res.push(item)
      }
    }

    return res
  }

  this.getUdpNote = function(note){
    let udpNote
    if (note.length == 2) {
      switch (note) {
        case 'Db':
          udpNote = 'c'
          break;
        case 'Eb':
          udpNote = 'F'
          break;
        case 'Gb':
          udpNote = 'f'
          break;
        case 'Ab':
          udpNote = 'g'
          break;
        case 'Bb':
          udpNote = 'a'
          break;
      }
    } else if (note.length == 1) {
      udpNote = note
    }
    return udpNote
  }

  this.getUdpValue = function(val){
    let conversion, mapRange
    if (val > 9 && val < 17){
      mapRange = val - 10 
      conversion = String.fromCharCode(65 + mapRange ); 
    } else if ( val < 9 && val > (-1) ) {
      conversion = val
    } else {
      conversion = 'f' //fallback.
    }
    return conversion
  }

  this.getUDPvalFrom127 = function(val){
    let limit = 36
    let mapTo36 = Math.floor( scale(val, 0,127,0, limit - 1) )
    let mapToCharRange, temp, itobase36
    if(mapTo36 > 9 && mapTo36 < limit){
      mapToCharRange = mapTo36 - 10
      temp = String.fromCharCode(65 + mapToCharRange );

      // limit to only Char range 
      // range from 37 ~ 131 = A - Z.
      itobase36 = isChar(temp)? temp : mapTo36
    } else if ( mapTo36 < 9) {
      itobase36 = mapTo36
    } else {
      itobase36 = 'D' //fallback.
    }
    return itobase36
  }
}

module.exports = Seeq