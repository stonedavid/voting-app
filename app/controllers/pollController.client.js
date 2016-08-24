'use strict';

// This directs client events to the proper routes, which execute controllers

(function () {

   var pollDisplay = document.querySelector('#poll-display');
   var pollUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + "/api/:id/vote";
   var filter = document.querySelector("#filter");
   var newPoll = document.querySelector(("#newPoll"));
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
            pollFormDiv.className = "container center-block";
            pollFormDiv.style.textAlign = "center";
            
            var pollForm = document.createElement("form");
            pollForm.addEventListener("submit",voteSubmit.bind(this,pollData._id));
            pollForm.setAttribute("action"," ");
            
            for (var i = 0; i<pollData.candidates.length; i++) {
               
               var newInput = document.createElement("input");
               newInput.setAttribute("type","radio");
               newInput.setAttribute("name","candidate");
               newInput.setAttribute("value",pollData.candidates[i].candidate);
               
               var inputLabel = document.createTextNode(pollData.candidates[i].candidate);
               pollForm.appendChild(newInput);
               pollForm.appendChild(inputLabel);
               pollForm.appendChild(document.createElement("br"));
            }
            
            var submitButton = document.createElement("input");
            submitButton.setAttribute("type","submit");
            submitButton.setAttribute("value","Submit");
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
      
      var submitButton = document.createElement("input");
      submitButton.setAttribute("type","submit");
      submitButton.setAttribute("value","Submit");
      submitButton.className = "btn btn-secondary btn-sm";
      form.appendChild(submitButton);
         
      //Helper function to append fields to form  
      function makeField(field) {   
         
         var fieldRow = document.createElement("div");
         fieldRow.className = "form-group row";
         form.insertBefore(fieldRow,submitButton);
         
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
         fieldInput.setAttribute("value","testvalue");
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
         form.removeChild(submitButton.previousElementSibling);
      }
      
      makeField("Question");
      makeField("Candidate");
      makeField("Candidate");
      makeField("Candidate");
      
      var rmCandidate = document.createElement("div");
      rmCandidate.className = "btn btn-secondary btn-sm";
      rmCandidate.innerHTML = "-";
      form.appendChild(rmCandidate);
      
      var addCandidate = document.createElement("div");
      addCandidate.className = "btn btn-secondary btn-sm";
      addCandidate.innerHTML = "+";
      form.appendChild(addCandidate);
      
      addCandidate.addEventListener("click",makeField.bind(null,"Candidate: "));
      rmCandidate.addEventListener("click",removeField);
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
      pollDataWrapper.className = "container";
         
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
         
         candidateRow.appendChild(candidateCol);
         candidateRow.appendChild(votesCol);
         
         pollDataWrapper.appendChild(candidateRow);
      }
         
      pollDisplay.appendChild(pollDataWrapper);
      
      var backButton = document.createElement("div");
      backButton.className = "btn btn-block";
      backButton.innerHTML = "Back to Polls";
      backButton.addEventListener("click", function() {
         ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls);
      });
      
      pollDisplay.appendChild(backButton);
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls));
   
   
   
   filter.addEventListener("keyup",function() {
      ajaxFunctions.ajaxRequest("GET", pollUrl + "?question=" + this.value, showAllPolls);
   });
   
   newPoll.addEventListener("click",pollForm);
   
   console.log("Filter object",filter);
   
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
