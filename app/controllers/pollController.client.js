'use strict';

// This directs client events to the proper routes, which execute controllers

(function() {
   var pollDisplay = document.querySelector('#poll-display');
   var pollUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + "/api/:id/vote";
   var filter = document.querySelector("#filter");
   var newPoll = document.querySelector(("#newPoll"));
   var profilePolls = document.querySelector(("#profilePolls"));
   var query = window.location.href.split("#")[1] || "";
   var user,userId,userPolls = [];
   var loginOption = document.querySelector("#login-option");

   function showAllPolls(res) {
      res = JSON.parse(res);
      var pollList = res.result;
      user = res.user || null;
      
      if (user) {
         userId = res.user._id;
         userPolls = res.user.polls;
      }
      else {
         console.log("LOST USER!!!");
      }

      while (pollDisplay.firstChild) {
         pollDisplay.removeChild(pollDisplay.firstChild);
      }

         for (var i = 0; i < pollList.length; i++) {
            var newRow = document.createElement("div");
            newRow.className = "row";

            if (userId == pollList[i].author._id || userId == "57b9e3165925e1370d131df2") {
               
               var newPollDisplayDiv = document.createElement("div");
               newPollDisplayDiv.className = "col-xs-11";
               var newPollButton = document.createElement("div");
               newPollButton.className = "btn btn-secondary btn-block";
               newPollButton.style.paddingLeft = "13%";
               newPollButton.style.borderRadius = "5px 0px 0px 5px";
               newPollButton.setAttribute("data-poll", JSON.stringify(pollList[i], null, 8));
               newPollButton.innerHTML = pollList[i].question;
               pollDisplay.appendChild(newRow).appendChild(newPollDisplayDiv).appendChild(newPollButton);

               var deleteWrap = document.createElement("div");
               deleteWrap.className = "col-xs-1";
               deleteWrap.style.padding = "0px 0px";
               var deleteButton = document.createElement("div");
               deleteButton.className = "btn btn-warning btn-block";
               deleteButton.style.padding = "6px 0px";
               deleteButton.style.borderRadius = "0px 5px 5px 0px";
               var deleteGlyphSpan = document.createElement("span");
               deleteGlyphSpan.className = "glyphicon glyphicon-trash";
               //deleteGlyphSpan.style.padding = "4px 0px";
               deleteButton.appendChild(deleteGlyphSpan);
               var id = pollList[i]._id;
               deleteButton.addEventListener("click", pollDelete.bind(null, id));
               newRow.appendChild(deleteWrap).appendChild(deleteButton);

            }
            else {
               
               var newPollDisplayDiv = document.createElement("div");
               newPollDisplayDiv.className = "col-xs-12";
               var newPollButton = document.createElement("div");
               newPollButton.className = "btn btn-secondary btn-block";
               newPollButton.setAttribute("data-poll", JSON.stringify(pollList[i], null, 8));
               newPollButton.innerHTML = pollList[i].question;
               pollDisplay.appendChild(newRow).appendChild(newPollDisplayDiv).appendChild(newPollButton);
            }

            newPollButton.addEventListener("click", voteForm);

         }
      //CASE: ANONYMOUS
      if (user.guest) {
         loginOption.href = "/login";
         loginOption.innerHTML = "Login to Create Polls";
         newPoll.parentNode.removeChild(newPoll);
         profilePolls.parentNode.removeChild(profilePolls);
         filter.parentNode.className = "navbar-form";
      }

   }

   function voteForm() {
      var pollData = JSON.parse(this.getAttribute("data-poll"));

      if (userPolls.indexOf(pollData._id) !== -1 && userId !== "57b9e3165925e1370d131df2") {
         return displayPollData(pollData);
      }

      console.log("Poll Data", pollData);
      while (pollDisplay.firstChild) {
         pollDisplay.removeChild(pollDisplay.firstChild);
      }

      var pollFormDiv = document.createElement("div");
      pollFormDiv.className = "container center-block vote-container";
      pollFormDiv.style.width = "80%";

      var pollForm = document.createElement("form");
      pollForm.addEventListener("submit", voteSubmit.bind(this, pollData._id));
      pollForm.setAttribute("action", " ");

      for (var i = 0; i < pollData.candidates.length; i++) {

         var radioWrap = document.createElement("div");
         radioWrap.className = "radio";

         var newInput = document.createElement("input");
         newInput.setAttribute("type", "radio");
         newInput.setAttribute("name", "candidate");
         newInput.setAttribute("value", pollData.candidates[i].candidate);

         var inputLabel = document.createElement("label");
         var labelText = document.createTextNode(pollData.candidates[i].candidate);
         inputLabel.appendChild(newInput);
         inputLabel.insertAdjacentHTML("beforeend", pollData.candidates[i].candidate);
         pollForm.appendChild(radioWrap).appendChild(inputLabel);

      }

      var submitButton = document.createElement("input");
      submitButton.setAttribute("type", "submit");
      submitButton.setAttribute("value", "Submit");
      submitButton.className = "btn";


      pollDisplay.appendChild(pollFormDiv)
         .appendChild(pollForm)
         .appendChild(submitButton);

   }

   function pollForm() {
      //Clear main display
      while (pollDisplay.firstChild) {
         pollDisplay.removeChild(pollDisplay.firstChild);
      }

      var form = pollDisplay.appendChild(document.createElement("form"));
      form.setAttribute("action", "/api/:id/polls");
      form.setAttribute("method", "post");
      form.setAttribute("enctype", "application/x-www-form-urlencoded");

      var buttonToolbar = document.createElement("div");
      buttonToolbar.className = "btn-toolbar";
      buttonToolbar.setAttribute("role", "toolbar");

      form.appendChild(buttonToolbar);

      var submitGroup = document.createElement("div");
      submitGroup.className = "btn-group";
      submitGroup.setAttribute("role", "group");

      buttonToolbar.appendChild(submitGroup);

      var addGroup = document.createElement("div");
      addGroup.className = "btn-group pull-right";
      addGroup.setAttribute("role", "group");

      buttonToolbar.appendChild(addGroup);

      var submitButton = document.createElement("input");
      submitButton.setAttribute("type", "submit");
      submitButton.setAttribute("value", "Submit");
      submitButton.className = "btn btn-secondary";
      submitGroup.appendChild(submitButton);

      var cancelButton = document.createElement("button");
      cancelButton.className = "btn btn-secondary";
      cancelButton.setAttribute("type", "button");
      cancelButton.innerHTML = "Cancel";
      submitGroup.appendChild(cancelButton);


      var rmCandidate = document.createElement("button");
      rmCandidate.className = "btn btn-secondary";
      rmCandidate.setAttribute("type", "button");
      rmCandidate.innerHTML = "-";
      addGroup.appendChild(rmCandidate);

      var addCandidate = document.createElement("button");
      addCandidate.className = "btn btn-secondary";
      addCandidate.setAttribute("type", "button");
      addCandidate.innerHTML = "+";
      addGroup.appendChild(addCandidate);

      addCandidate.addEventListener("click", makeField.bind(null, "Candidate: "));
      rmCandidate.addEventListener("click", removeField);
      cancelButton.addEventListener("click", function() {
         ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls);
      });

      //Helper function to append fields to form  
      function makeField(field) {

         var fieldRow = document.createElement("div");
         fieldRow.className = "form-group row";
         form.insertBefore(fieldRow, buttonToolbar);

         var fieldLabel = document.createElement("label");
         fieldLabel.className = "col-xs-2 col-form-label";
         fieldLabel.setAttribute("for", field + "-input");
         fieldLabel.innerHTML = field;
         fieldRow.appendChild(fieldLabel);

         var inputWrapper = document.createElement("div");
         inputWrapper.className = "col-xs-10";

         var fieldInput = document.createElement("input");
         fieldInput.className = "form-control";
         fieldInput.setAttribute("type", "text");
         fieldInput.setAttribute("id", field + "-input");
         fieldInput.setAttribute("name", form.childElementCount.toString());
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

   function voteSubmit(id, event) {
      event.preventDefault();
      var candidate = event.currentTarget.querySelector(':checked').value;

      ajaxFunctions.ajaxRequest("POST", voteUrl + "?id=" + id + "&candidate=" + candidate, function() {
         ajaxFunctions.ajaxRequest("GET", pollUrl + "?id=" + id, function(data) {
            displayPollData(JSON.parse(data).result[0]);
         });
      });

   }

   function pollDelete(id) {
      ajaxFunctions.ajaxRequest("DELETE", pollUrl + "?id=" + id, function() {
         ajaxFunctions.ajaxRequest("GET", pollUrl + "?profile=1", function(data) {
            showAllPolls(data);
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

      var labelsAndData = []

      for (var i = 0; i < data.candidates.length; i++) {
         var candidate = data.candidates[i].candidate;
         var votes = data.candidates[i].votes;
         labelsAndData.push([candidate, votes]);
         /*var candidateRow = makeRow();
         var candidateCol = makeCol(9);
         var votesCol = makeCol(3);

         candidateCol.innerHTML = candidate;
         votesCol.innerHTML = votes.toString();
         votesCol.style.textAlign = "right";

         candidateRow.appendChild(candidateCol);
         candidateRow.appendChild(votesCol);

         pollDataWrapper.appendChild(candidateRow);*/
      }

      var bgColors = [];
      var hovColors = [];

      labelsAndData.sort(function(a, b) {
         if (a[1] > b[1]) {
            return -1;
         }
         if (a[1] < b[1]) {
            return 1;
         }
         return 0;
      });

      labelsAndData.forEach(function(point, index) {
         bgColors.push("hsl(" + Math.floor(360 / labelsAndData.length) * index + ",100%,70%)");
         hovColors.push("hsl(" + Math.floor(360 / labelsAndData.length) * index + ",90%,80%)");
      });

      var backButton = document.createElement("div");
      backButton.className = "btn btn-block";
      backButton.innerHTML = "Back";
      backButton.addEventListener("click", function() {
         ajaxFunctions.ajaxRequest('GET', pollUrl, showAllPolls);
      });

      var histButton = document.createElement("div");
      histButton.className = "btn btn-block";
      histButton.innerHTML = "History";
      histButton.addEventListener("click", displayHistory.bind(null, data));

      var topSpacer = makeRow();
      topSpacer.appendChild(document.createElement("hr"));
      
      var linkWrap =  makeRow();
      linkWrap.style.padding = "10px"
      var linkField = document.createElement("div");
      linkField.className = "well well-sm";
      linkField.innerHTML = appUrl +  "/#?id=" + data._id;


      var buttonRow = makeRow();
      buttonRow.style.padding = "10px";
      var leftSpacer = makeCol(2);
      var rightSpacer = makeCol(2);
      var buttonCol = makeCol(4);
      var histCol = makeCol(4);

      pollDataWrapper.appendChild(topSpacer);
      pollDataWrapper.appendChild(linkWrap).appendChild(linkField);
      //pollDataWrapper.appendChild(buttonRow).appendChild(shareWrap).appendChild(shareButton);
      pollDataWrapper.appendChild(buttonRow).appendChild(leftSpacer);
      buttonRow.appendChild(buttonCol).appendChild(backButton);
      buttonRow.appendChild(histCol).appendChild(histButton);
      buttonRow.appendChild(rightSpacer);

      pollDisplay.appendChild(pollDataWrapper);

      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      ctx.canvas.width = 600;
      ctx.canvas.height = 600;
      canvas.style.width = '300px';
      canvas.style.height = '300px';

      pollDataWrapper.insertBefore(canvas, pollDataWrapper.childNodes[1]);

      var chartLabels = [],
         chartData = [];
      labelsAndData.forEach(function(entry) {
         chartLabels.push(entry[0]);
         chartData.push(entry[1]);
      });

      var myChart = new Chart(ctx, {
         type: 'pie',
         data: {
            labels: chartLabels,
            datasets: [{
               label: '# of Votes',
               backgroundColor: bgColors,
               hoverBackgroundColor: hovColors,
               data: chartData,
               borderWidth: 1
            }]
         }
      });



   }

   function displayHistory(data) {
      while (pollDisplay.firstChild) {
         pollDisplay.removeChild(pollDisplay.firstChild);
      }

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

      var history = data["history"];
      history.push({
         date: new Date().toISOString(),
         candidates: data.candidates
      });
      var n_candidates = data.candidates.length;
      console.log("n_candidates", n_candidates);
      var all_points = {};

      history.forEach(function(entry) {
         entry["candidates"].forEach(function(candidate) {
            if (candidate.candidate in all_points) {
               all_points[candidate.candidate].push(candidate.votes);
            }
            else {
               all_points[candidate.candidate] = [candidate.votes];
            }
         });
      });

      var bgColors = [];
      var hovColors = [];

      for (var i = 0; i < n_candidates; i++) {
         bgColors.push("hsl(" + Math.floor(360 / n_candidates) * i + ",100%,70%)");
         hovColors.push("hsl(" + Math.floor(360 / n_candidates) * i + ",90%,80%)");
      }

      var datasets = [];
      i = 0;
      for (var entry in all_points) {
         datasets.push({
            label: entry,
            data: all_points[entry],
            pointRadius: 0,
            pointHitRadius: 10,
            pointHoverRadius: 10,
            lineTension: 0.1
         });
         i += 1;
      }

      datasets.sort(function(a, b) {
         if (a.data[a.data.length - 1] > b.data[b.data.length - 1]) {
            return -1;
         }
         if (a.data[a.data.length - 1] < b.data[b.data.length - 1]) {
            return 1;
         }
         return 0;
      });

      datasets.forEach(function(dataset, i) {
         dataset.backgroundColor = bgColors[i];
      })

      console.log("Datasets", datasets);

      var chartData = {
         datasets: datasets,
         labels: Array(history.length)
      };

      pollDisplay.appendChild(pollDataWrapper);

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

      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      ctx.canvas.width = 600;
      ctx.canvas.height = 600;
      canvas.style.width = '300px';
      canvas.style.height = '300px';

      pollDataWrapper.insertBefore(canvas, pollDataWrapper.childNodes[1]);

      var myChart = new Chart.Line(ctx, {
         data: chartData,
         options: {
            scales: {
               yAxes: [{
                  stacked: true
               }]
            },
            labelsFilter: function(value, index) {
               return (index + 1) % 5 !== 0;
            }

         }
      });



   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollUrl + query, showAllPolls));



   filter.addEventListener("keyup", function() {
      ajaxFunctions.ajaxRequest("GET", pollUrl + "?question=" + this.value, showAllPolls);
   });

   newPoll.addEventListener("click", pollForm);

   profilePolls.addEventListener("click", function() {
      ajaxFunctions.ajaxRequest("GET", pollUrl + "?profile=1", function(data) {
         showAllPolls(data);
      });
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
