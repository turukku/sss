   /* =====================================
       CONFIG
    ===================================== */

    const API_URL =
        "https://quiet-morning-de18.kritk8643.workers.dev/";


    /* =====================================
       ELEMENTS
    ===================================== */

    const urlsInput =
        document.getElementById("urls");

    const resultBox =
        document.getElementById("result");

    const shortenBtn =
        document.getElementById("shortenBtn");

    const shortenBtnText =
        document.getElementById("shortenBtnText");

    const urlCount =
        document.getElementById("urlCount");

    const progressWrapper =
        document.getElementById("progressWrapper");

    const progressBar =
        document.getElementById("progressBar");

    const progressStatus =
        document.getElementById("progressStatus");

    const progressPercent =
        document.getElementById("progressPercent");


    /* =====================================
       URL COUNTER
    ===================================== */

    urlsInput.addEventListener(
        "input",
        updateUrlCount
    );


    function updateUrlCount() {

        const urls =
            urlsInput.value
                .split("\n")
                .map(url => url.trim())
                .filter(Boolean);

        urlCount.textContent =
            urls.length;

    }


    /* =====================================
       URL VALIDATION
    ===================================== */

    function isValidUrl(url) {

        try {

            const parsed =
                new URL(url);

            return (
                parsed.protocol === "http:" ||
                parsed.protocol === "https:"
            );

        }

        catch {

            return false;

        }

    }


    /* =====================================
       SHORTEN BUTTON
    ===================================== */

    shortenBtn.addEventListener(
        "click",
        async () => {

            const service =
                document.getElementById(
                    "service"
                ).value;


            const urlList =
                urlsInput.value
                    .split("\n")
                    .map(url => url.trim())
                    .filter(Boolean);


            if (!urlList.length) {

                Swal.fire({
                    icon: "warning",
                    title: "No URLs Found",
                    text:
                        "Masukkan minimal satu URL terlebih dahulu.",
                    confirmButtonColor:
                        "#4f46e5"
                });

                return;

            }


            const invalidUrls =
                urlList.filter(
                    url => !isValidUrl(url)
                );


            if (invalidUrls.length) {

                Swal.fire({
                    icon: "error",
                    title: "Invalid URL",
                    text:
                        "Terdapat URL yang tidak valid."
                });

                return;

            }


            /* RESET */

            resultBox.value = "";

            shortenBtn.disabled = true;

            shortenBtnText.textContent =
                "Processing...";


            progressWrapper.style.display =
                "block";

            progressBar.style.width =
                "0%";

            progressPercent.textContent =
                "0%";


            const total =
                urlList.length;

            let successCount = 0;
            let failCount = 0;


            /* PROCESS ONE BY ONE */

            for (
                let i = 0;
                i < total;
                i++
            ) {

                const url =
                    urlList[i];


                progressStatus.textContent =
                    `Processing ${i + 1} of ${total}`;


                try {

                    const shortened =
                        await shortenURL(
                            service,
                            url
                        );


                    appendResult(
                        shortened
                    );


                    successCount++;

                }

                catch (error) {

                    console.error(
                        error
                    );


                    appendResult(
                        `❌ ${url}\n   ${error.message}`
                    );


                    failCount++;

                }


                /* UPDATE PROGRESS */

                const percentage =
                    Math.round(
                        ((i + 1) / total) * 100
                    );


                progressBar.style.width =
                    percentage + "%";


                progressPercent.textContent =
                    percentage + "%";


                /* REMOVE PROCESSED URL */

                const remaining =
                    urlList.slice(i + 1);


                urlsInput.value =
                    remaining.join("\n");


                updateUrlCount();


                /* DELAY */

                if (i < total - 1) {

                    await sleep(800);

                }

            }


            /* FINISHED */

            progressStatus.textContent =
                `Completed: ${successCount} Success, ${failCount} Failed`;


            shortenBtn.disabled = false;


            shortenBtnText.textContent =
                "Shorten URLs";


            setTimeout(() => {

                progressWrapper.style.display =
                    "none";

            }, 3000);


            Swal.fire({

                icon:
                    failCount === 0
                        ? "success"
                        : "info",

                title:
                    "Process Completed",

                html: `
                    <b>Success:</b>
                    ${successCount}
                    <br>

                    <b>Failed:</b>
                    ${failCount}
                `,

                confirmButtonColor:
                    "#4f46e5"

            });

        }
    );


    /* =====================================
       CLOUDFLARE API REQUEST
    ===================================== */

    async function shortenURL(
        service,
        url
    ) {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => controller.abort(),
                30000
            );


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                service: service,
                                url: url
                            }),

                        signal:
                            controller.signal
                    }
                );


            let data;


            try {

                data =
                    await response.json();

            }

            catch {

                throw new Error(
                    `API mengembalikan response bukan JSON. HTTP ${response.status}`
                );

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.error ||
                    `API Error ${response.status}`
                );

            }


            if (!data.url) {

                throw new Error(
                    "Short URL tidak ditemukan pada response API"
                );

            }


            return data.url;

        }

        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    "Request timeout"
                );

            }


            throw error;

        }

        finally {

            clearTimeout(
                timeout
            );

        }

    }


    /* =====================================
       APPEND RESULT
    ===================================== */

    function appendResult(text) {

        resultBox.value +=
            text + "\n";


        resultBox.scrollTop =
            resultBox.scrollHeight;

    }


    /* =====================================
       SLEEP
    ===================================== */

    function sleep(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );

    }


    /* =====================================
       COPY RESULT
    ===================================== */

    document
        .getElementById("copyBtn")
        .addEventListener(
            "click",
            async () => {

                const text =
                    resultBox.value.trim();


                if (!text) {

                    Swal.fire({

                        icon:
                            "warning",

                        title:
                            "Nothing to Copy",

                        text:
                            "Tidak ada hasil untuk disalin.",

                        confirmButtonColor:
                            "#4f46e5"

                    });

                    return;

                }


                try {

                    await navigator.clipboard
                        .writeText(
                            text
                        );


                    Swal.fire({

                        icon:
                            "success",

                        title:
                            "Copied!",

                        text:
                            "Hasil berhasil disalin.",

                        timer:
                            1800,

                        showConfirmButton:
                            false

                    });

                }

                catch {

                    Swal.fire({

                        icon:
                            "error",

                        title:
                            "Copy Failed",

                        text:
                            "Tidak dapat mengakses clipboard."

                    });

                }

            }
        );
