document.addEventListener("DOMContentLoaded", function () {

    const headerPlaceholder =
        document.getElementById("header-placeholder");

    if (!headerPlaceholder) {
        return;
    }


    fetch("/Header.html")

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Could not load Header.html");
            }

            return response.text();

        })

        .then(function (html) {

            headerPlaceholder.innerHTML = html;


            /* ==========================================
               MOBILE MENU
            ========================================== */

            const menuButton =
                document.getElementById("menuButton");

            const mobileMenu =
                document.getElementById("mobileMenu");


            if (menuButton && mobileMenu) {

                menuButton.addEventListener(
                    "click",
                    function () {

                        const isOpen =
                            mobileMenu.classList.toggle("show");

                        menuButton.setAttribute(
                            "aria-expanded",
                            isOpen
                        );

                    }
                );

            }


            /* ==========================================
               MOBILE APPROACH
            ========================================== */

            const approachButton =
                document.getElementById(
                    "mobileApproachButton"
                );

            const approachBox =
                document.querySelector(
                    ".mobile-approach"
                );


            if (approachButton && approachBox) {

                approachButton.addEventListener(
                    "click",
                    function () {

                        approachBox.classList.toggle(
                            "open"
                        );

                    }
                );

            }

        })

        .catch(function (error) {

            console.error(
                "Header loading error:",
                error
            );

        });

});