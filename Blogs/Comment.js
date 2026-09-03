// =====================================================
// COMMON COMMENTS SYSTEM
// This file is used by ALL blog pages.
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT.appspot.com",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =====================================================
// GET CURRENT BLOG INFORMATION
// =====================================================

// Get filename
const fileName =
    window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");


// Create unique page ID automatically
const PAGE_ID =
    fileName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");


// Get article title automatically
const articleTitle =
    document.querySelector(".article-header h1")?.textContent.trim()
    || document.title;


// =====================================================
// CREATE COMMENT SECTION
// =====================================================

const commentsHTML = `

<section class="comments-section" id="comments">

    <div class="comments-container">

        <div class="comments-heading">

            <span class="comments-label">
                JOIN THE CONVERSATION
            </span>

            <h2>
                What do you think?
            </h2>

            <p>
                Share your thoughts, ideas or experiences
                with us and other readers.
            </p>

        </div>


        <div class="comment-form-card">

            <form id="commentForm">

                <div class="comment-form-grid">

                    <div class="comment-field">

                        <label for="commentName">
                            Your name
                        </label>

                        <input
                            type="text"
                            id="commentName"
                            placeholder="Enter your name"
                            maxlength="80"
                            required>

                    </div>


                    <div class="comment-field">

                        <label for="commentEmail">
                            Email <span>(optional)</span>
                        </label>

                        <input
                            type="email"
                            id="commentEmail"
                            placeholder="you@example.com">

                    </div>

                </div>


                <div class="comment-field">

                    <label for="commentMessage">
                        Your comment
                    </label>

                    <textarea
                        id="commentMessage"
                        rows="6"
                        maxlength="500"
                        placeholder="Write your thoughts..."
                        required></textarea>

                    <div class="character-count">

                        <span id="characterCount">0</span>
                        / 500

                    </div>

                </div>


                <div
                    id="commentStatus"
                    class="comment-status">
                </div>


                <button
                    type="submit"
                    class="comment-submit"
                    id="commentSubmit">

                    Post Comment

                    <span>→</span>

                </button>

            </form>

        </div>


        <div class="comments-list-wrapper">

            <div class="comments-list-header">

                <h3>
                    Reader Comments
                </h3>

                <span id="commentCount">
                    0 comments
                </span>

            </div>


            <div
                id="commentsList"
                class="comments-list">

                <div class="comments-loading">
                    Loading comments...
                </div>

            </div>

        </div>

    </div>

</section>

`;


// =====================================================
// INSERT COMMENTS BEFORE FOOTER
// =====================================================

const footer =
    document.querySelector("footer");


if (footer) {

    footer.insertAdjacentHTML(
        "beforebegin",
        commentsHTML
    );

}
else {

    document.body.insertAdjacentHTML(
        "beforeend",
        commentsHTML
    );

}


// =====================================================
// ELEMENTS
// =====================================================

const form =
    document.getElementById("commentForm");

const nameInput =
    document.getElementById("commentName");

const emailInput =
    document.getElementById("commentEmail");

const messageInput =
    document.getElementById("commentMessage");

const submitButton =
    document.getElementById("commentSubmit");

const status =
    document.getElementById("commentStatus");

const commentsList =
    document.getElementById("commentsList");

const commentCount =
    document.getElementById("commentCount");

const characterCount =
    document.getElementById("characterCount");


// =====================================================
// CHARACTER COUNT
// =====================================================

messageInput.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            messageInput.value.length;

    }
);


// =====================================================
// STATUS MESSAGE
// =====================================================

function showStatus(message, type) {

    status.textContent = message;

    status.className =
        "comment-status " + type;

}


// =====================================================
// SUBMIT COMMENT
// =====================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const message =
            messageInput.value.trim();


        if (!name) {

            showStatus(
                "Please enter your name.",
                "error"
            );

            return;

        }


        if (!message) {

            showStatus(
                "Please write a comment.",
                "error"
            );

            return;

        }


        submitButton.disabled = true;

        submitButton.innerHTML =
            "Posting...";


        try {

            await addDoc(
                collection(db, "comments"),
                {

                    pageId: PAGE_ID,

                    pageTitle: articleTitle,

                    name: name,

                    email: email,

                    message: message,

                    createdAt:
                        serverTimestamp()

                }
            );


            form.reset();

            characterCount.textContent = "0";


            showStatus(
                "Your comment has been posted successfully.",
                "success"
            );

        }
        catch (error) {

            console.error(error);

            showStatus(
                "Unable to post your comment. Please try again.",
                "error"
            );

        }
        finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                'Post Comment <span>→</span>';

        }

    }
);


// =====================================================
// LOAD COMMENTS FOR CURRENT BLOG
// =====================================================

const commentsQuery = query(

    collection(db, "comments"),

    where(
        "pageId",
        "==",
        PAGE_ID
    ),

    orderBy(
        "createdAt",
        "desc"
    )

);


onSnapshot(
    commentsQuery,
    (snapshot) => {

        commentsList.innerHTML = "";

        const total =
            snapshot.size;


        commentCount.textContent =
            total === 1
                ? "1 comment"
                : `${total} comments`;


        if (total === 0) {

            commentsList.innerHTML = `

                <div class="comments-empty">

                    Be the first to share your thoughts.

                </div>

            `;

            return;

        }


        snapshot.forEach(
            (doc) => {

                const data =
                    doc.data();


                const item =
                    document.createElement("article");

                item.className =
                    "comment-item";


                const avatar =
                    document.createElement("div");

                avatar.className =
                    "comment-avatar";


                avatar.textContent =
                    (data.name || "R")
                        .charAt(0)
                        .toUpperCase();


                const content =
                    document.createElement("div");

                content.className =
                    "comment-content";


                const top =
                    document.createElement("div");

                top.className =
                    "comment-top";


                const author =
                    document.createElement("strong");

                author.className =
                    "comment-author";

                author.textContent =
                    data.name || "Reader";


                const date =
                    document.createElement("span");

                date.className =
                    "comment-date";


                if (data.createdAt) {

                    date.textContent =
                        data.createdAt
                            .toDate()
                            .toLocaleDateString(
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                }
                            );

                }
                else {

                    date.textContent =
                        "Just now";

                }


                top.appendChild(author);
                top.appendChild(date);


                const text =
                    document.createElement("p");

                text.className =
                    "comment-text";

                text.textContent =
                    data.message || "";


                content.appendChild(top);
                content.appendChild(text);


                item.appendChild(avatar);
                item.appendChild(content);


                commentsList.appendChild(item);

            }
        );

    },

    (error) => {

        console.error(
            "Comments error:",
            error
        );

        commentsList.innerHTML = `

            <div class="comments-empty">

                Unable to load comments right now.

            </div>

        `;

    }

);