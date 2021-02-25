var rntas = 1;

var n;

var message;

var domparser;

var doc;

var topLevel;

var checkComment;

var commentId;

var commentUser;

var topCommentId = 0;

var append = " | This message was performed automatically. If the bot is malfunctioning, please stop the bot by posting '/bot-stop' and contact @DogCatPuppyLover. RNTAS: "

function send(message, commentUser, append, rntas, commentId, studio_id, n) {
  $.getJSON("https://api.scratch.mit.edu/users/" + commentUser, function(data) {
    message = "Welcome! If you haven't already been invited, you'll be invited soon."; //set message
    if (commentId > topCommentId) { //prevent spam
      console.log(message + append + rntas, commentId, data.id, studio_id);
      postComment(message + append + rntas, commentId, data.id, studio_id); //welcome curator
      if (n == 0) {
        topCommentId = commentId;
      }
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
        checkComment = topLevel.getElementsByClassName("content")[0].innerHTML.toLowerCase();
        commentId = topLevel.getElementsByTagName("div")[0].getAttribute("data-comment-id");
        commentUser = topLevel.getElementsByTagName("a")[1].innerHTML;
        console.log(checkComment + ", " + commentId + ", " + commentUser);
        if (checkComment.includes("/bot-stop")) { //stop command
          setTimeout(send("Stopping bot.", commentUser, append, rntas, commentId, studio_id, n), 2000);
          clearInterval(bot)
        } else if (checkComment.includes("invite") || checkComment.includes("join") || checkComment.includes("curat")) { //invite curator
          setTimeout(send("Welcome! If you haven't already been invited, you'll be invited soon.", commentUser, append, rntas, commentId, studio_id, n), 2000);
          inviteCurator(commentUser, studio_id); //invite curators
        }
        rntas++;
      }
    }
  });
}

setInterval(function(){bot("5842709");}, 300000); //run the script every 10 minutes
