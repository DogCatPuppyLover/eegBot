var n;

var message;

var domparser;

var doc;

var topLevel;

var checkComment;

var commentId;

var commentUser;

var splitCommand;

var topCommentId = 0;

var append = " | This message was performed automatically. If the bot is malfunctioning, please stop the bot by posting '/eeg stop' and contact @DogCatPuppyLover. RNTAS: "

function send(message, commentUser, append, commentId, studio_id, n) {
  $.getJSON("https://api.scratch.mit.edu/users/" + commentUser, function(data) {
    message = "Welcome! If you haven't already been invited, you'll be invited soon."; //set message
    if (commentId > topCommentId) { //prevent spam
      console.log(message + append + commentId, commentId, data.id, studio_id);
      postComment(message + append + commentId, commentId, data.id, studio_id); //welcome curator
    }
  });
}

function postComment(content, parent_id, commentee_id, studio_id) {
  $.ajax({
    type: "POST",
    url: "https://scratch.mit.edu/site-api/comments/gallery/" + studio_id + "/add/",
    data: JSON.stringify({
      "content": content,
      "parent_id": parent_id,
      "commentee_id": commentee_id
    })
  });
}

function inviteCurator(username, studio_id) {
  $.ajax({
    type: "PUT",
    url: "https://scratch.mit.edu/site-api/users/curators-in/" + studio_id + "/invite_curator/?usernames=" + commentUser
  });
}

function bot(studio_id) {
  console.log("Running bot");
  $.ajax({ //get comment data
    url: "https://scratch.mit.edu/site-api/comments/gallery/" + studio_id,
    success: function(data) {
      domparser = new DOMParser(); //parse string into DOM
      doc = domparser.parseFromString(data, "text/html");
      for (n = 0; n < doc.getElementsByClassName("top-level-reply").length; n++) { //check every comment on the first page
        topLevel = doc.getElementsByClassName("top-level-reply")[n]; //nth top-level comment
        checkComment = topLevel.getElementsByClassName("content")[0].innerHTML.toLowerCase().trim();
        commentId = topLevel.getElementsByTagName("div")[0].getAttribute("data-comment-id");
        commentUser = topLevel.getElementsByTagName("a")[1].innerHTML;
        splitCommand = checkComment.split(" ");
        console.log(checkComment + ", " + commentId + ", " + commentUser);
        if (splitCommand[0] === "/eeg") {
          if (splitCommand[1] === "stop") { //stop command
            setTimeout(send("Stopping bot.", commentUser, append, commentId, commentId, studio_id, n), 2000);
            clearInterval(bot)
          } else if (splitCommand[1] === "invite") { //invite curator
            setTimeout(send("Welcome! If you haven't already been invited, you'll be invited soon.", commentUser, append, commentId, studio_id, n), 2000);
            inviteCurator(commentUser, studio_id); //invite curators
          } else {
            setTimeout(send("Sorry, '" + splitCommand[1] + "' is not a command.", commentUser, append, commentId, studio_id, n), 2000);
          }
        }
        if (n == 0) {
          topCommentId = commentId;
        }
      }
    }
  });
}

setInterval(function() {
  bot("5842709");
}, 300000); //run the script every 10 minutes
