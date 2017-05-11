window.onload = function(){
  //localStorage.removeItem("myCourses");
  body = document.getElementsByTagName('body')[0];
  // make navbar
  makeNavBar();
  // eventlistener for loading files
  document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
  // possibly load from storage
  if (localStorage.getItem("myCourses") != null){
    loadStorage();
  }
  $(list).sortable();
}

var creditsTaken = 0;
var creditsMax = 18;
var creditsMin = 15;
var list;
// used to save in local storage
var myCourses;

// puffer for rows
var puffer =  document.createElement('div');
puffer.setAttribute("class", "col-md-1 puffer");

function inc(n){
  creditsTaken += n;
  redraw();
}

function dec(n){
  creditsTaken -= n;
  redraw();
}

function redraw(){
  var progressBar = document.querySelector("#progressBar");
  progressBar.setAttribute("style", "width:" + +((creditsTaken/creditsMax)*100) + "%;");
  progressBar.getElementsByTagName('span')[0].innerHTML = creditsTaken + "/" + creditsMax + " Credits";
  if (creditsTaken>=creditsMin && creditsTaken<=creditsMax){
    progressBar.setAttribute("class", "progress-bar progress-bar-success");
  }
  else if (creditsTaken>creditsMax){
    progressBar.setAttribute("class", "progress-bar progress-bar-danger");
  } else {
    progressBar.setAttribute("class", "progress-bar progress-bar-primary")
  }
}

function Course(title, description, credits, prerequisites){
  this.title = title;
  this.description = description;
  this.credits = credits;
  this.prerequisites = prerequisites;
}

function loadStorage(){
  myCourses = JSON.parse(localStorage.getItem("myCourses"));
  creditsTaken = JSON.parse(localStorage.getItem("creditsTaken"));
  body.innerHTML = myCourses;
  //body.removeChild(document.querySelector("#fileInput"));

  // reload behavior
  creditBtns = document.querySelectorAll('.credit-btn');
  for (credit of creditBtns){
    credit.onclick = function(e){
      handleCreditBtnEvent(e);
    };
  }

  saveBtn = document.querySelector('.save-btn');
  saveBtn.onclick =  function(){
    handleSaveBtnEvent();
    showAlert("Saved!", false);
  };

  list = document.querySelector('ol');
}

function makeNavBar(){
  // list for all the courses
  list = document.createElement('ol');
  list.setAttribute("style", "margin-top:2%");
  body.appendChild(list);

  var navbar = document.querySelector(".navbar-fixed-bottom");

  // progress bar
  var progress = document.createElement('div');
  progress.setAttribute("class", "progress col-md-8");
  progress.setAttribute("style", "margin-top:15px;");
  navbar.appendChild($(puffer).clone()[0]);
  navbar.appendChild(progress);

  var progressBar = document.createElement('div');
  var attr = {"class":"progress-bar",
              "aria-valuenow":"60",
              "aria-valuemin":"0",
              "aria-valuemax":"100",
              "style":"width:" + +((creditsTaken/creditsMax)*100) + "%;",
              "id":"progressBar"};
  setAttributes(progressBar, attr);
  progress.appendChild(progressBar);
  progressBar.innerHTML = '<span class="">0/18 Credits</span>'

  // save button
  var saveBtn = document.createElement('button');
  saveBtn.setAttribute("class", "btn btn-lg btn-primary col-md-1 save-btn");
  $(saveBtn).append('save');
  navbar.appendChild($(puffer).clone()[0]);
  navbar.appendChild(saveBtn);
  saveBtn.onclick =  function(){
    handleSaveBtnEvent();
    showAlert("Saved!", false);
  };
}

function handleSaveBtnEvent(){
  if (typeof(Storage) !== "undefined") {
      // Code for localStorage/sessionStorage.
      myCourses = document.querySelector("body").innerHTML;
      localStorage.setItem("myCourses", JSON.stringify(myCourses));
      localStorage.setItem("creditsTaken", creditsTaken);
  } else {
      alert("Sorry No web Storage support..");
      // Sorry! No Web Storage support..
  }
}


function handleFileSelect(evt) {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  var files = evt.target.files; // FileList object
  var reader = new FileReader();
  var courses = [];      // files is a FileList of File objects. List some properties.

  // For all files ...
  for (var i = 0, f; f = files[i]; i++) {

    reader.onload = function(theFile) {
      var text = theFile.target.result;
      courses = parseText(text);
      printCourses(courses);
    }
    reader.readAsText(f);
  }
}
else {
  showAlert('The File APIs are not fully supported in this browser.', true);
}
}

function showAlert(text, warning){
    var alert = document.createElement('div');
    if (warning){
      attr = {"class":"alert alert-danger navbar-fixed-top", "role":"alert"};
    } else{
      attr = {"class":"alert alert-success navbar-fixed-top", "role":"alert"};
    }
    setAttributes(alert, attr);
    alert.innerHTML = '<strong>'+ text +'</strong>';
    body.appendChild(alert);
    // delete it again
    setTimeout(function() {
      body.removeChild(document.querySelector('.alert'));
    },  800);
}

/*************************** PARSE AND PRINT HELPER FUNC ******************************/

function printCourses(courses){
  // print courses
  for (var course of courses){
    course.print();
  }
}

Course.prototype.print = function(){
  var div = document.createElement('li');
  div.setAttribute("class", "row ");
  list.appendChild(div);
  div.appendChild($(puffer).clone()[0])

  // append row for each property
  var panel =  document.createElement('div');
  panel.setAttribute("class", "panel panel-default col-md-8");
  div.appendChild(panel);

  // clone gives back array with 0, length and previousObject
  div.appendChild($(puffer).clone()[0]);

  // append title
  var title = document.createElement('div');
  title.setAttribute("class", "panel-heading");
  title.innerHTML = '<h3 class="panel-title"> ' + this.title + '</h3>';
  panel.appendChild(title);

  var panelBody = document.createElement('div');
  panelBody.setAttribute("class", "panel-body");
  panel.appendChild(panelBody);

  // append description
  var description = document.createElement('div');
  description.setAttribute("class", "")
  description.innerHTML = "<p><i>" + this.description + "<i></p>";
  panelBody.appendChild(description);

  // append prerequisites
  var prerequisites = document.createElement('div');
  prerequisites.setAttribute("class", "")
  prerequisites.innerHTML = "<p>" + this.prerequisites + "</p>";
  panelBody.appendChild(prerequisites);

  // append credits
  var credits = document.createElement('button');
  credits.setAttribute("class", "btn btn-lg btn-primary credit-btn");
  credits.setAttribute("value", this.credits);
  $(credits).append('<h3>' + this.credits + ' Credits </h3>');
  credits.onclick = function(e){
    handleCreditBtnEvent(e);
  };
  div.appendChild(credits);
}

function handleCreditBtnEvent(e){
  console.log(e);
  if (e.target.classList.contains("btn-primary")){
    inc(+e.target.value);
    e.target.setAttribute("class", "btn btn-lg btn-success credit-btn");
  } else {
    dec(+e.target.value);
    e.target.setAttribute("class", "btn btn-lg btn-primary credit-btn");
  }
}

function parseText(text){
  var courses = [];

  reg = new RegExp('\\s#{4}\\s([^*])+','gm');
  // titles
  titles = text.match(reg);

  // description & prerequisites
  description = text.match(new RegExp('[*]{1}[^*\\s][^*]+','gm'));

  // credits and create course
  for (var i in titles){
    var credits = +titles[i].match(new RegExp('\\[[0-9]',''))[0][1];
    console.log(titles[i] + " : " + credits);
    courses.push(new Course(titles[i],description[i*2],credits,description[(i*2)+1]));
  }

  return courses;
}

// helper function to set multiple attributes
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
