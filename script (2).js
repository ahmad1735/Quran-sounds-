// Set the page title to "Quran Sounds"
document.title = "Quran Sounds";

// Variable to track the currently playing audio and its current time
let currentAudio = null;
let currentTime = 0;

// Fetch Quran data from AlQuran.cloud API
async function fetchQuranData(reader) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/quran/${reader}`);
        const data = await response.json();

        if (data.code === 200 && data.data.surahs) {
            return data.data.surahs;
        } else {
            throw new Error("Failed to load Quran data.");
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تحميل بيانات القرآن الكريم. يرجى التحقق من اتصال الإنترنت.");
        return [];
    }
}

// Function to render the list of suras
function renderSuras(suras) {
    const suraList = document.getElementById("suraList");
    suraList.innerHTML = ""; // Clear previous content

    suras.forEach((sura, index) => {
        const suraItem = document.createElement("div");
        suraItem.className = "sura-item";

        const suraName = document.createElement("div");
        suraName.className = "sura-name";
        suraName.textContent = `${index + 1}. ${sura.name} (${sura.ayahs.length} آية)`;

        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "buttons";

        const playButton = document.createElement("button");
        playButton.className = "play-button";
        playButton.textContent = "تشغيل";

        const stopButton = document.createElement("button");
        stopButton.className = "stop-button";
        stopButton.textContent = "إيقاف";

        const downloadButton = document.createElement("button");
        downloadButton.className = "download-button";
        downloadButton.textContent = "تحميل";

        // Play all ayahs in the surah sequentially
        playButton.addEventListener("click", () => {
            const notification = document.getElementById("notification");
            notification.style.display = "block";
            notification.textContent = `جاري تشغيل سورة ${sura.name}...`;

            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0; // Reset the current audio
            }

            const audioSrc = sura.ayahs.map(ayah => ayah.audio);

            function playAyah(index) {
                if (index >= audioSrc.length) {
                    notification.style.display = "none";
                    return; // Stop if all ayahs are played
                }

                const audio = new Audio(audioSrc[index]);
                currentAudio = audio;

                // Set the current time if resuming playback
                audio.currentTime = currentTime;

                audio.play();

                // When the current ayah ends, play the next one
                audio.onended = () => {
                    playAyah(index + 1); // Play the next ayah
                };

                // Handle errors in case an audio file fails to load
                audio.onerror = () => {
                    alert(`فشل في تحميل صوت الآية رقم ${index + 1}`);
                    playAyah(index + 1); // Skip to the next ayah
                };
            }

            playAyah(0); // Start playing from the first ayah
        });

        // Stop the current audio and save the current time
        stopButton.addEventListener("click", () => {
            if (currentAudio) {
                currentTime = currentAudio.currentTime; // Save the current time
                currentAudio.pause();
                currentAudio = null;
                const notification = document.getElementById("notification");
                notification.style.display = "none";
                alert("تم إيقاف الصوت.");
            }
        });

        // Download the surah as an MP3 file
        downloadButton.addEventListener("click", () => {
            sura.ayahs.forEach((ayah, ayahIndex) => {
                const ayahUrl = ayah.audio;
                const ayahFilename = `${sura.name}_verse_${ayahIndex + 1}.mp3`;
                downloadFile(ayahUrl, ayahFilename);
            });
            alert(`بدأ تنزيل سورة ${sura.name} كملفات منفصلة.`);
        });

        buttonsDiv.appendChild(playButton);
        buttonsDiv.appendChild(stopButton);
        buttonsDiv.appendChild(downloadButton);

        suraItem.appendChild(suraName);
        suraItem.appendChild(buttonsDiv);

        suraList.appendChild(suraItem);
    });
}

// Update suras when reader is changed
document.getElementById("reader").addEventListener("change", async function () {
    const selectedReader = this.value;
    const suras = await fetchQuranData(selectedReader);
    renderSuras(suras);
});

// Direct search functionality
function searchSuras() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const selectedReader = document.getElementById("reader").value;

    fetchQuranData(selectedReader).then(suras => {
        const filteredSuras = suras.filter(sura =>
            sura.name.toLowerCase().includes(query)
        );
        renderSuras(filteredSuras);
    });
}

// Initialize the app by fetching and rendering all suras with default reader
const defaultReader = "ar.abdulbasitmurattal"; // Default reader: عبد الباسط عبد الصمد
fetchQuranData(defaultReader).then(suras => {
    renderSuras(suras);
});

// Show prayer times modal
document.getElementById("prayerTimesButton").addEventListener("click", function () {
    const modal = document.getElementById("prayerTimesModal");
    modal.style.display = "block";
});

// Close prayer times modal
document.getElementsByClassName("close")[0].addEventListener("click", function () {
    const modal = document.getElementById("prayerTimesModal");
    modal.style.display = "none";
});

// Function to download a single file
function downloadFile(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}