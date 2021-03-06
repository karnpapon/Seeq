'use strict'

function Console(app) {

  const { el,qs } = require('./lib/utils')

  this.el = el("div")
  this.el_elem = `
   <div class="controller-wrapper">
        <div class="header-wrapper console-1">
          <div class="header">
            <div data-logo="seeq" class="title">input</div>
            <input id="content" data-fetch="fetch" placeholder=""  class="input-control">
          </div>
          <div class="header">
            <div class="title">RegExp:</div>
            <input id="regex" type="search-regex" placeholder="" class="input-regex">
          </div>
        </div>
          
        <div class="header-wrapper console-2">
          <div class="header">
            <div class="title">find:</div>
            <div class="normal-search">
              <input id="find" type="search" placeholder="" class="input-control-2">
            </div>
          </div>
          
          <div class="control-info">
          <div class="control-panel">
            <div class="title">Control:</div>
            <div class="control-btn">
              <button data-ctrl="udp" tabindex="-1">udp</button>
              <button data-ctrl="osc" tabindex="-1">osc</button>
              <button data-ctrl="rev" tabindex="-1">rev</button>
              <button data-ctrl="focus" tabindex="-1">focus</button>
            </div>
            </div>
          </div>
        </div>

        <div class="header-line"></div>
        <div class="header-wrapper console-3 flex-col header-wrapper-status">
          <div class="tempo">
            <div class="tempo-details">
              <div>
                <div class="tempo-details">
                  <b>BPM : </b>
                </div>
                <div class="tempo-details">
                  <b>TME : </b>
                </div>
                <div class="tempo-details">
                  <b>LEN : </b> 
                </div>
                <div class="tempo-details">
                  <b>POS : </b>
                </div>
              </div>
              <div class="performance-details">
                <p class="init-bpm" data-ctrl="bpm">120</p>
                <p data-ctrl="current">16th</p> 
                <p data-ctrl="crsrlen">--</p>
                <p data-ctrl="crsrpos">--</p>
              </div>
            </div>
            <div class="counter">
            <div class="control-btn">

              <button data-ctrl="subtract" tabindex="-1">-</button>
              <button data-ctrl="add" tabindex="-1">+</button>
              </div>
            </div>
          </div> 
        </div>
      </div>
  `

  // button.
  this.prevBtn
  this.nextBtn 
  this.configBtn 
  this.inputFetch
  this.linkBtn 
  this.clearBtn 
  this.focusBtn
  this.nudgeBtn 
  this.udpBtn 
  this.oscBtn 
  this.revBtn 
  this.bpmUpBtn
  this.bpmDownBtn
  this.devBtn 

  // this.notationMode 
  // this.extractLines 

  // Input. 
  this.searchInput
  this.searchRegExp
  this.regexInput
  this.fetchSearchInput = ""
  this.searchValue = ""
 
  // Console status display.
  this.bpmNumber
  this.metronomeBtn
  this.currentNumber
  this.cursorLength
  this.cursorPosition
  this.isInfoToggleOpened = false

  // state.
  this.isActive = false
  this.isConfigToggle = false
  this.isLinkToggle = false
  this.isUDPToggled = false
  this.isOSCToggled = false
  this.isReverse = false
  this.isPlaying = false
  this.isFocus = false
  this.isBPMtoggle = false
  this.isInsertable = false
  this.updateMarkType = "normal"
  this.isSearchModeChanged = false
  this.output = ""
  this.beatRatio = '16th'
  
  this.isInputFocused = false
  this.isFindFocused = false
  this.isRegExpFocused = false

  // --------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    const self = app.console
    self.searchInput = qs("input[type='search']")
    self.searchRegExp = qs("input[type='search-regex']")
    // self.prevBtn = qs("button[data-search='prev']")
    // self.nextBtn = qs("button[data-search='next']")
    // self.configBtn = qs("button[data-search='cfg']")
    self.inputFetch = qs("input[data-fetch='fetch']")
    self.getTextBtn = qs("button[data-gettext='gettext']")
    // self.linkBtn = qs("button[data-ctrl='link']")
    // self.clearBtn = qs("button[data-ctrl='clear']")
    self.focusBtn = qs("button[data-ctrl='focus']")
    // self.nudgeBtn = qs("button[data-ctrl='nudge']")
    self.udpBtn = qs("button[data-ctrl='udp']")
    self.oscBtn = qs("button[data-ctrl='osc']")
    self.revBtn = qs("button[data-ctrl='rev']")
    self.bpmUpBtn = qs("button[data-ctrl='add']")
    self.bpmDownBtn = qs("button[data-ctrl='subtract']")
    // self.notationMode = qs("button[data-ctrl='notation-mode']")
    // self.extractLines = qs("button[data-ctrl='extract-line']")
    self.bpmNumber = qs("p[data-ctrl='bpm']")
    // self.metronomeBtn = qs("button[data-ctrl='metronome']")
    self.currentNumber = qs("p[data-ctrl='current']")
    self.cursorLength = qs("p[data-ctrl='crsrlen']")
    self.cursorPosition = qs("p[data-ctrl='crsrpos']")

    // input to get.
    self.inputFetch.addEventListener("input", function () { 
      self.fetchSearchInput = this.value; 
      seeq.displayer.displayMsg("console")
    })
    self.inputFetch.addEventListener("focus", function () { self.isInputFocused = true; self.setFocusStyle(self.inputFetch) })
    self.inputFetch.addEventListener("blur", function () { self.isInputFocused = false; self.removeFocusStyle(self.inputFetch) })

    // find
    self.searchInput.addEventListener("input", function () {
      self.searchValue = this.value;
      self.searchType = "normal"
      seeq.getMatchedPosition()
    });
    self.searchInput.addEventListener("focus", function () { self.isFindFocused = true; self.setFocusStyle(self.searchInput) });
    self.searchInput.addEventListener("blur", function () { self.isFindFocused = false; self.removeFocusStyle(self.searchInput) });

    // RegExp.
    self.searchRegExp.addEventListener("input", function () {
      self.searchType = "regex"
      self.isRegExpFocused = !self.isRegExpFocused
      self.regexInput = this.value
      seeq.getMatchedPosition() //TODO: return value instead.
      seeq.displayer.displayMsg("regex")
    });
    self.searchRegExp.addEventListener("focus", function () { self.setFocusStyle(self.searchRegExp) });
    self.searchRegExp.addEventListener("blur", function () {self.removeFocusStyle(self.searchRegExp) });

    // this.nextBtn.addEventListener("click", function(){
    //   if(seeq.results.length){
    //     seeq.currentIndex += 1
    //   }
    //   if (seeq.currentIndex > seeq.results.length - 1) { 
    //     // reset cursor to top.
    //     seeq.currentIndex = 0;
    //   }
    //   seeq.triggerCursor['counter'] += 1
    //   seeq.jump()
    // })

    // this.prevBtn.addEventListener("click", function(){
    //   if(seeq.results.length){
    //     seeq.currentIndex -= 1
    //   }
    //   if (seeq.currentIndex < 0) {
    //     // prevBtn case to get outbound top to show at to bottom.
    //     seeq.currentIndex = seeq.results.length - 1; 
    //   }
    //   seeq.jump();
    // })

    // seeq.metronomeBtn.addEventListener("click", function(){
    //   seeq.isBPMtoggle = !seeq.isBPMtoggle 
    //   seeq.metronomeBtn.classList.toggle("toggle-btn") 
    // })

    // this.configBtn.addEventListener("click", function(){

    //   let targetCursor
    //   targetCursor = seeq.triggerCursor
    //   seeq.isConfigToggle = !seeq.isConfigToggle

    //   if(seeq.isConfigToggle){
    //     this.classList.add("toggle-btn")
    //     seeq.keys.infoOpr8Hide()
    //     seeq.keys.infoInputShow()
    //     seeq.keys.infoShow()
    //     seeq.info.style.opacity = 0
    //     seeq.setOutputMsg(targetCursor)
    //   } else {
    //     seeq.keys.infoHide()
    //     seeq.info.style.opacity = 1
    //     seeq.keys.infoInputHide()
    //     this.classList.remove("toggle-btn")
    //     seeq.keys.infoOpr8Show()
    //   }
    // })


    // self.linkBtn.addEventListener("click", function () {
    //   self.isLinkToggle = !self.isLinkToggle
    //   app.isPlaying = true
    //   this.classList.toggle("toggle-btn")

    //   if (this.isLinkToggle) {
    //     socket.connect(0)
    //   } else {
    //     socket.disconnect(0);
    //   }
    // })

    self.udpBtn.addEventListener("click", function () {
      self.togglePort('UDP', this)
    })

    self.oscBtn.addEventListener("click", function () {
      self.togglePort('OSC', this)
    })

    self.focusBtn.addEventListener("click", function () {
      self.togglePort('FOCUS', this)
      canvas.toggleShowMarks()
    })

    // self.nudgeBtn.addEventListener("click", function () {
    //   app.nudge()
    // })

    self.bpmUpBtn.addEventListener("click", function(){
      canvas.clock.mod(1)
    })

    self.bpmDownBtn.addEventListener("click", function(){
      canvas.clock.mod(-1)
    })

    self.revBtn.addEventListener("click", function () {
      self.togglePort('REV', this)
    })
  });

  this.build = function () {
    this.el.classList.add("controller-wrapper")
    this.el.innerHTML += this.el_elem
    app.el.appendChild(this.el)
  }
  
  this.setBPMdisplay = function () {
    app.bpmNumber.innerHTML = app.clock().bpm
  }

  this.setCounterDisplay = function () {
    app.currentNumber.innerHTML = this.beatRatio
  }

  this.setCPUUsageDisplay = function(v){
    let trimmedData = v.toFixed(2)
    app.cpuUsage.innerHTML = trimmedData + " " + "%"
  }

  this.setTotalLenghtCounterDisplay = function () {
    this.cursorLength.innerHTML = canvas.texts.length
  }

  this.toggleInsert = function () {
    var inputs;
    inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; ++i) {
      if (this.isInsertable) {
        inputs[i].classList.remove("disable-input")
        inputs[i].disabled = false
      } else {
        inputs[i].classList.add("disable-input")
        inputs[i].disabled = true
      }
    }
    this.inputFetch ? this.inputFetch.focus():""
  }

  this.toggleIsSearchModeChanged = function () {
    this.isSearchModeChanged = !this.isSearchModeChanged
  }

  this.runCmd = function(id){
    let target = document.getElementById(id)

    target.classList.add("trigger-input")
    this.isInputFocused? app.startFetch():() => {}
    setTimeout(() => {
      target.classList.remove("trigger-input") 
    }, 200);
  
  }

  this.togglePort = function(type, bind){
    if(type === 'UDP'){
      this.isUDPToggled = !this.isUDPToggled
    } else if ( type === 'OSC'){
      this.isOSCToggled = !this.isOSCToggled 
    } else if ( type === 'REV'){
      this.isReverse = !this.isReverse
    } else if ( type === 'FOCUS'){
      this.isFocus = !this.isFocus 
    }
    bind.classList.toggle("toggle-btn")
  }

  this.setFocusStyle = function(target){
    target.style.backgroundColor = "#3EFB00" 
  }

  this.removeFocusStyle = function(target){
    target.style.backgroundColor = "#FFFFFF"  
  }

}

module.exports = Console