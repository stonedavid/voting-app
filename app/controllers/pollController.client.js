'use strict';

// This directs client events to the proper routes, which execute controllers

(function () {

   var pollDisplay = document.querySelector('#poll-display');
   var pollUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + "/api/:id/vote";
   var filter = document.querySelector("#filter");
   var newPoll = document.querySelector(("#newPoll"));
   var profilePolls = document.querySelector(("#profilePolls"));
   var query = "";

   function showAllPolls (data) {
      console.log(data);
      
      while (pollDisplay.firstChild) {
               pollDisplay.removeChild(pollDisplay.firstChild);
            }
            
      var pollList = JSON.parse(data);
      for (var i = 0; i<pollList.length; i++) {
         var newPollDisplayDiv = document.createElement("div");
         newPollDisplayDiv.className = "btn btn-block poll-display";
         newPollDisplayDiv.setAttribute("data-poll",JSON.stringify(pollList[i],null,8));
         newPollDisplayDiv.innerHTML = pollList[i].question;
         pollDisplay.appendChild(newPollDisplayDiv);
         
         newPollDisplayDiv.addEventListener("click",voteForm);
         
      }
      
   }
   
   function voteForm() {
      var pollData = JSON.parse(this.getAttribute("data-poll"));
            console.log(pollData);
            while (pollDisplay.firstChild) {
               pollDisplay.removeChild(pollDisplay.firstChild);
            }
            
            var pollFormDiv = document.createElement("div");
            pollFormDiv.className = "container center-block vote-container";
            pollFormDiv.style.width = "80%";
            
            var pollForm = document.createElement("form");
            pollForm.addEventListener("submit",voteSubmit.bind(this,pollData._id));
            pollForm.setAttribute("action"," ");
            
            for (var i = 0; i<pollData.candidates.length; i++) {
               
               var radioWrap = document.createElement("div");
               radioWrap.className = "radio";
               
               var newInput = document.createElement("input");
               newInput.setAttribute("type","radio");
               newInput.setAttribute("name","candidate");
               newInput.setAttribute("value",pollData.candidates[i].candidate);
               
               var inputLabel = document.createElement("label");
               var labelText = document.createTextNode(pollData.candidates[i].candidate);
               inputLabel.appendChild(newInput);
               inputLabel.insertAdjacentHTML("beforeend",pollData.candidates[i].candidate);
               pollForm.appendChild(radioWrap).appendChild(inputLabel);

            }
            
            var submitButton = document.createElement("input");
            submitButton.setAttribute("type","submit");
            submitButton.setAttribute("value","Submit");
            submitButton.className = "btn";
            console.log("submit added");
            
            
            pollDisplay.appendChild(pollFormDiv)
               .appendChild(pollForm)
                  .appendChild(submitButton);
            console.log("appended to pollDisplay");
            
         }
         
   function pollForm() {
      //Clear main display
      while (pollDisplay.firstChild) {
         pollDisplay.removeChild(pollDisplay.firstChild);
         }
         
      var form = pollDisplay.appendChild(document.createElement("form"));
      form.setAttribute("action","/api/:id/polls");
      form.setAttribute("method","post");
      form.setAttribute("enctype","application/x-www-form-urlencoded");
      
      var buttonToolbar = document.createElement("div");
      buttonToolbar.className = "btn-toolbar";
      buttonToolbar.setAttribute("role","toolbar");
      
      form.appendChild(buttonToolbar);
      
      var submitGroup = document.createElement("div");
      submitGroup.className = "btn-group";
      submitGroup.setAttribute("role","group");
      
      buttonToolbar.appendChild(submitGroup);
      
      var addGroup = document.createElement("div");
      addGroup.className = "btn-group pull-right";
      addGroup.setAttribute("role","group");
      
      buttonToolbar.appendChild(addGroup);
      
      var submitButton = document.createElement("input");
      submitButton.setAttribute("type","submit");
      submitButton.setAttribute("value","Submit");
      submitButton.className = "btn btn-secondary";
      submitGroup.appendChild(submitButton);
      
      var cancelButton = document.createElement("button");
      cancelButton.className = "btn btn-secondary";
      cancelButton.setAttribute("type","button");
      cancelButton.innerHTML = "Cancel";
      submitGroup.appendChild(cancelButton);

      
      var rmCandidate = document.createElement("button");
      rmCandidate.className = "btn btn-secondary";
      rmCandidate.setAttribute("type","button");
      rmCandidate.innerHTML = "-";
      addGroup.appendChild(rmCandidate);
      
      var addCandidate = document.createElement("button");
      addCandidate.className = "btn btn-secondary";
      addCandidate.setAttribute("type","button");
      addCandidate.innerHTML = "+";
      addGroup.appendChild(addCandidate);
      
      addCandidate.addEventListener("click",makeField.bind(null,"Candidate: "));
      rmCandidate.addEventListener("click",removeField);
      cancelButton.addEventListener("click", function() {
         ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls);
      });
      
      //Helper function to append fields to form  
      function makeField(field) {   
         
         var fieldRow = document.createElement("div");
         fieldRow.className = "form-group row";
         form.insertBefore(fieldRow,buttonToolbar);
         
         var fieldLabel = document.createElement("label");
         fieldLabel.className = "col-xs-2 col-form-label";
         fieldLabel.setAttribute("for", field + "-input");
         fieldLabel.innerHTML = field;
         fieldRow.appendChild(fieldLabel);
         
         var inputWrapper = document.createElement("div");
         inputWrapper.className = "col-xs-10";
         
         var fieldInput = document.createElement("input");
         fieldInput.className = "form-control";
         fieldInput.setAttribute("type","text");
         fieldInput.setAttribute("id",field + "-input");
         fieldInput.setAttribute("name",form.childElementCount.toString());
         fieldInput.addEventListener("keypress", function(event) {
            var x = event.which;
            if (x === 13) {
            event.preventDefault();
               }
         });
         
         fieldRow
            .appendChild(inputWrapper)
               .appendChild(fieldInput);
      }
      
      function removeField() {
         form.removeChild(buttonToolbar.previousElementSibling);
      }
      
      makeField("Question");
      makeField("Candidate");
      makeField("Candidate");
      makeField("Candidate");
      
   }      
   
   function voteSubmit(id,event) {
      event.preventDefault();
      var candidate = event.currentTarget.querySelector(':checked').value;
      
      ajaxFunctions.ajaxRequest("POST", voteUrl + "?id=" + id +"&candidate=" + candidate, function() {
         ajaxFunctions.ajaxRequest("GET", pollUrl + "?id=" + id, function(data) {
            displayPollData(JSON.parse(data)[0]);
         });
      });
      
   }
   
   function displayPollData(data) {
      
      //helper functions
      
      function makeRow() {
         var row = document.createElement("div");
         row.className = "row";
         return row;
      }
      
      function makeCol(width) {
         var col = document.createElement("div");
         col.className = "col-xs-" + width;
         return col;
      }
      
      //main
      
      while (pollDisplay.firstChild) {
               pollDisplay.removeChild(pollDisplay.firstChild);
            }
            
      var pollDataWrapper = document.createElement("div");
      pollDataWrapper.className = "container vote-container";
      pollDataWrapper.style.width = "80%";
         
      var headingRow = makeRow();
      var headingCol = makeCol(12);
         
      var question = document.createElement("h3");
      question.innerHTML = data.question;
      
      pollDataWrapper
         .appendChild(headingRow)
         .appendChild(headingCol)
         .appendChild(question);
         
      for (var i = 0; i<data.candidates.length; i++) {
         var candidate = data.candidates[i].candidate;
         var votes = data.candidates[i].votes;
         var candidateRow = makeRow();
         var candidateCol = makeCol(9);
         var votesCol = makeCol(3);
         
         candidateCol.innerHTML = candidate;
         votesCol.innerHTML = votes.toString();
         votesCol.style.textAlign = "right";
         
         candidateRow.appendChild(candidateCol);
         candidateRow.appendChild(votesCol);
         
         pollDataWrapper.appendChild(candidateRow);
      }
      
      var backButton = document.createElement("div");
      backButton.className = "btn btn-block";
      backButton.innerHTML = "Back";
      backButton.addEventListener("click", function() {
         ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls);
      });
      
      var topSpacer = makeRow();
      topSpacer.appendChild(document.createElement("hr"));
      
      
      var buttonRow = makeRow();
      var leftSpacer = makeCol(4);
      var rightSpacer = makeCol(4);
      var buttonCol = makeCol(4);
      
      pollDataWrapper.appendChild(topSpacer);
      pollDataWrapper.appendChild(buttonRow).appendChild(leftSpacer);
      buttonRow.appendChild(buttonCol).appendChild(backButton);
      buttonRow.appendChild(rightSpacer);
      
      pollDisplay.appendChild(pollDataWrapper);
      
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls));
   
   
   
   filter.addEventListener("keyup",function() {
      ajaxFunctions.ajaxRequest("GET", pollUrl + "?question=" + this.value, showAllPolls);
   });
   
   newPoll.addEventListener("click",pollForm);
   
   profilePolls.addEventListener("click", function() {
      ajaxFunctions.ajaxRequest("GET", pollUrl + "?profile=1", showAllPolls);
   });
   
   /*addButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('POST', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

   deleteButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('DELETE', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);*/

})();
