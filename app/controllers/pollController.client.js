'use strict';

// This directs client events to the proper routes, which execute controllers

(function () {

   var pollDisplay = document.querySelector('#poll-display');
   var pollUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + "/api/:id/vote";
   var query = "";

   function showAllPolls (data) {
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
         
         newPollDisplayDiv.addEventListener("click",function() {
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
            //pollForm.setAttribute("target","_blank");
            
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
            
         });
      }
      
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
