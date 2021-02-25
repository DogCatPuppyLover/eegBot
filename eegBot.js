var n;

var titlePrefix = "♥️ LGBTQ+ ♥️ ";

var message;

var domparser;

var doc;

var topLevel;

var checkComment;

var commentId;

var commentUser;

var splitCommand;

var topCommentId = 0;

var pastTopCommentId = 0;

var append = " | This message was sent automatically by @EegBot. RNTAS: "

function send(message, commentUser, commentId, studio_id, n) {
  $.getJSON("https://api.scratch.mit.edu/users/" + commentUser, function(data) {
    console.log(message + append + commentId, commentId, data.id, studio_id);
    postComment(message + append + commentId, commentId, data.id, studio_id);
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

function reportComment(comment_id, studio_id) {
  $.ajax({
    type: "POST",
    url: "https://scratch.mit.edu/site-api/comments/gallery/" + studio_id + "/rep/",
    data: JSON.stringify({
      "id": comment_id
    })

  });
}

function changeTitle(title, studio_id) {
  $.ajax({
    type: "PUT",
    url: "https://scratch.mit.edu/site-api/galleries/all/" + studio_id,
    data: JSON.stringify({
      "title": title
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
  pastTopCommentId = topCommentId;
  console.log("Running bot");
  $.ajax({
    url: "https://scratch.mit.edu/site-api/comments/gallery/" + studio_id,
    success: function(data) {
      domparser = new DOMParser();
      doc = domparser.parseFromString(data, "text/html");
      for (n = 0; n < doc.getElementsByClassName("top-level-reply").length; n++) {
        topLevel = doc.getElementsByClassName("top-level-reply")[n];
        checkComment = topLevel.getElementsByClassName("content")[0].innerHTML.toLowerCase().trim();
        commentId = topLevel.getElementsByTagName("div")[0].getAttribute("data-comment-id");
        commentUser = topLevel.getElementsByTagName("a")[1].innerHTML;
        splitCommand = checkComment.split(" ");
        console.log(checkComment + ", " + splitCommand + ", " + commentId + ", " + commentUser + ", " + n);
        if (commentId > pastTopCommentId) {
          if (splitCommand[0] === "/eeg") {
            if (splitCommand[1] === "stop") {
              setTimeout(send("Stopping bot.", commentUser, commentId, commentId, studio_id, n), 2000);
              clearInterval(bot)
            } else if (splitCommand[1] === "invite") {
              setTimeout(send("Welcome to chaos! If you haven't already been invited, you'll be invited soon.", commentUser, commentId, studio_id, n), 2000);
              inviteCurator(commentUser, studio_id)
            } else if (splitCommand[1] === "huggles") {
              setTimeout(send("*huggles*", commentUser, commentId, studio_id, n), 2000);
            } else if (splitCommand[1] === "positivity") {
              changeTitle(titlePrefix + "Positivity hour! <333", studio_id)
              setTimeout(send("Of course! <333", commentUser, commentId, studio_id, n), 2000);
            } else if (splitCommand[1] === "tonetags") {
              setTimeout(send("https://tonetags.carrd.co/#masterlist", commentUser, commentId, studio_id, n), 2000);
            }
            else {
              setTimeout(send("Whoops! '" + splitCommand[1] + "' is not a command. Go here for a list of commands: https://scratch.mit.edu/studios/28961456/comments/", commentUser, commentId, studio_id, n), 2000);
            }
          }
          if (checkComment.includes("[delete]") || checkComment.includes("[remove]") || checkComment.includes("(delete)") || checkComment.includes("(remove)")) {
            setTimeout(send("Please don't try to bypass the filterbot or send links to websites with unmoderated chat.", commentUser, commentId, studio_id, n), 2000);
            reportComment(commentId, studio_id)
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
}, 300000);
