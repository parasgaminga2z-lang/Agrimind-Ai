document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Preloader Logic
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                // Trigger initial scroll animations after preloader disappears
                window.dispatchEvent(new Event('scroll'));
            }, 800);
        }, 1000); // Give the bounce animation some time to play
    });

    // 2. Language Toggle (English <-> Hindi)
    const langToggleBtn = document.getElementById('lang-toggle');
    const currentLangSpan = document.getElementById('current-lang');
    let currentLang = 'en';

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        currentLangSpan.textContent = currentLang.toUpperCase();
        
        const translatableElements = document.querySelectorAll('[data-lang-en]');
        
        translatableElements.forEach(el => {
            if (currentLang === 'hi') {
                el.textContent = el.getAttribute('data-lang-hi');
            } else {
                el.textContent = el.getAttribute('data-lang-en');
            }
        });
    });

    // 3. Advanced Scroll Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .pop-in');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Play once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Parallax Background Effect
    const parallaxBg = document.querySelector('.parallax-bg');
    window.addEventListener('scroll', () => {
        let scrollPos = window.scrollY;
        if (parallaxBg && scrollPos < window.innerHeight) {
            parallaxBg.style.transform = `translate3d(0, ${scrollPos * 0.4}px, 0)`;
        }
    });

    // 5. Navbar Box Shadow on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
        }
    });

    // --- API Configuration ---
    const WEATHER_API_KEY = 'c3247458f45eee51db54eab2b4a5df15';
    const MANDI_API_KEY = '579b464db66ec23bdd000001776f3e1cbc9e487d4f2c3f382521c5c6';
    const PLANTNET_API_KEY = '2b10sO47DlAOwmzyOLR1zhbF'; // PlantNet API Key

    // --- 1. Fetch Real Weather Data ---
    async function fetchWeather(lat = null, lon = null) {
        try {
            if (lat && lon) {
                // Fetch localized weather
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
                const data = await res.json();
                if (data && data.main) {
                    document.getElementById('ticker-weather-1').textContent = `Local (${data.name}): ${Math.round(data.main.temp)}°C, ${data.weather[0].main}`;
                    document.getElementById('ticker-weather-2').textContent = `Local (${data.name}): ${Math.round(data.main.temp)}°C, ${data.weather[0].main}`;
                }
            } else {
                // Default weather
                const cities = ['New Delhi', 'Mumbai'];
                const responses = await Promise.all(cities.map(city => 
                    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},in&appid=${WEATHER_API_KEY}&units=metric`)
                ));
                const data = await Promise.all(responses.map(res => res.json()));
                
                if (data[0] && data[0].main) {
                    document.getElementById('ticker-weather-1').textContent = `${cities[0]}: ${Math.round(data[0].main.temp)}°C, ${data[0].weather[0].main}`;
                }
                if (data[1] && data[1].main) {
                    document.getElementById('ticker-weather-2').textContent = `${cities[1]}: ${Math.round(data[1].main.temp)}°C, ${data[1].weather[0].main}`;
                }
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            document.getElementById('ticker-weather-1').textContent = "Weather data unavailable";
            document.getElementById('ticker-weather-2').textContent = "Weather data unavailable";
        }
    }

    // --- 2. Fetch Real Mandi Prices ---
    async function fetchMandiPrices(stateName = null) {
        try {
            let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json&limit=3`;
            if (stateName) {
                // Mandi API requires exact state names
                url += `&filters[state]=${stateName}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.records && data.records.length > 0) {
                const records = data.records;
                if(records[0]) document.getElementById('ticker-mandi-1').textContent = `${records[0].commodity} (${records[0].state}): ₹${records[0].modal_price}/qtl`;
                if(records[1] || records[0]) document.getElementById('ticker-mandi-2').textContent = `${records[1] ? records[1].commodity : records[0].commodity} (${records[1] ? records[1].state : records[0].state}): ₹${records[1] ? records[1].modal_price : records[0].modal_price}/qtl`;
                if(records[2] || records[0]) document.getElementById('ticker-mandi-3').textContent = `${records[2] ? records[2].commodity : records[0].commodity} (${records[2] ? records[2].state : records[0].state}): ₹${records[2] ? records[2].modal_price : records[0].modal_price}/qtl`;
            } else if (stateName) {
                // Fallback if local state has no recent data
                console.warn("No mandi data for local state, falling back to national");
                fetchMandiPrices();
            }
        } catch (error) {
            console.error('Error fetching mandi prices:', error);
            document.getElementById('ticker-mandi-1').textContent = "Mandi data unavailable";
            document.getElementById('ticker-mandi-2').textContent = "Mandi data unavailable";
            document.getElementById('ticker-mandi-3').textContent = "Mandi data unavailable";
        }
    }

    // Execute API fetches
    fetchWeather();
    fetchMandiPrices();

    // --- 2.5 Geolocation logic ---
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            const originalText = locateBtn.innerHTML;
            locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // 1. Fetch Local Weather
                    fetchWeather(lat, lon);
                    
                    // 2. Fetch State Name via Reverse Geocoding
                    try {
                        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`);
                        const geoData = await geoRes.json();
                        if (geoData && geoData.length > 0) {
                            const stateName = geoData[0].state || geoData[0].name;
                            fetchMandiPrices(stateName);
                        }
                    } catch (error) {
                        console.error("Reverse geocoding failed", error);
                    }
                    
                    locateBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span class="hide-mobile">Found</span>';
                    setTimeout(() => locateBtn.innerHTML = originalText, 3000);
                    
                }, (error) => {
                    console.error("Geolocation error", error);
                    locateBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    setTimeout(() => locateBtn.innerHTML = originalText, 3000);
                    alert("Unable to retrieve your location. Please check your browser permissions.");
                });
            } else {
                alert("Geolocation is not supported by your browser");
                locateBtn.innerHTML = originalText;
            }
        });
    }

    // 3. Mandi Search Logic
    const searchBtn = document.getElementById('crop-search-btn');
    const searchInput = document.getElementById('crop-search-input');
    const resultsContainer = document.getElementById('mandi-results-container');

    if (searchBtn && searchInput && resultsContainer) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();

            resultsContainer.innerHTML = '<div class="loading-message"><i class="fa-solid fa-spinner fa-spin"></i> Fetching live prices...</div>';

            try {
                const response = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json&limit=6&filters[commodity]=${formattedQuery}`);
                const data = await response.json();

                resultsContainer.innerHTML = ''; // Clear loading

                if (data && data.records && data.records.length > 0) {
                    data.records.forEach((record, index) => {
                        const delay = index * 0.1;
                        const card = document.createElement('div');
                        card.className = 'mandi-result-card pop-in visible';
                        card.style.animationDelay = `${delay}s`;
                        
                        let dateStr = record.arrival_date || "Today";
                        
                        card.innerHTML = `
                            <h3>${record.commodity}</h3>
                            <p><i class="fa-solid fa-location-dot"></i> ${record.market}, ${record.state}</p>
                            <p><i class="fa-solid fa-calendar-day"></i> Last Updated: ${dateStr}</p>
                            <div class="price">₹${record.modal_price} <span>/ qtl</span></div>
                        `;
                        resultsContainer.appendChild(card);
                    });
                } else {
                    resultsContainer.innerHTML = `<div class="loading-message">No recent data found for "${formattedQuery}". Please try another crop (e.g. Wheat, Potato, Onion).</div>`;
                }
            } catch (error) {
                console.error("Error searching mandi prices", error);
                resultsContainer.innerHTML = `<div class="loading-message" style="color: var(--error);">Error fetching data. Please try again later.</div>`;
            }
        });

        // Allow Enter key to trigger search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // 6. AI Crop Doctor (Real API Integration)
    const chooseImgBtn = document.getElementById('choose-img-btn');
    const leafUpload = document.getElementById('leaf-image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const loadingImagePreview = document.getElementById('loading-image-preview');
    const simBtn = document.getElementById('sim-btn');
    const resetBtn = document.getElementById('sim-reset');
    
    const uploadState = document.getElementById('upload-state');
    const loadingState = document.getElementById('loading-state');
    const resultState = document.getElementById('result-state');
    
    let base64Image = null;
    let imageFile = null;

    if (chooseImgBtn && leafUpload) {
        chooseImgBtn.addEventListener('click', () => {
            leafUpload.click();
        });

        leafUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                imageFile = file;
                const reader = new FileReader();
                reader.onload = function(event) {
                    base64Image = event.target.result;
                    imagePreview.src = base64Image;
                    loadingImagePreview.src = base64Image;
                    imagePreviewContainer.style.display = 'block';
                    simBtn.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (simBtn) {
        simBtn.addEventListener('click', async () => {
            if (!imageFile) return;

            uploadState.style.display = 'none';
            loadingState.style.display = 'block';
            
            try {
                // Call PlantNet API
                const formData = new FormData();
                formData.append('organs', 'leaf');
                formData.append('images', imageFile);

                const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data && data.results && data.results.length > 0) {
                    const topMatch = data.results[0];
                    const speciesName = topMatch.species.commonNames && topMatch.species.commonNames.length > 0 
                        ? topMatch.species.commonNames[0] 
                        : topMatch.species.scientificNameWithoutAuthor;
                        
                    document.getElementById('disease-name').textContent = speciesName;
                    document.getElementById('disease-probability').textContent = (topMatch.score * 100).toFixed(2) + '%';
                    document.getElementById('result-title').textContent = "Plant Identified";
                    document.getElementById('result-badge').className = "result-badge success pop-in visible";
                } else if (data.statusCode || data.error) {
                    document.getElementById('disease-name').textContent = data.message || "API Error";
                    document.getElementById('disease-probability').textContent = data.statusCode ? `Error ${data.statusCode}` : "Failed";
                    document.getElementById('result-title').textContent = data.error || "Error";
                    document.getElementById('result-badge').className = "result-badge error pop-in visible";
                } else {
                    document.getElementById('disease-name').textContent = "No Plant Detected";
                    document.getElementById('disease-probability').textContent = "Please upload a clear leaf photo";
                    document.getElementById('result-title').textContent = "Analysis Finished";
                    document.getElementById('result-badge').className = "result-badge pop-in visible";
                }
            } catch (error) {
                console.error("Error analyzing image:", error);
                document.getElementById('disease-name').textContent = "API Error";
                document.getElementById('disease-probability').textContent = "Check API Key or Console";
                document.getElementById('result-title').textContent = "Error";
                document.getElementById('result-badge').className = "result-badge error pop-in visible";
            }
            
            loadingState.style.display = 'none';
            resultState.style.display = 'block';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resultState.style.display = 'none';
            uploadState.style.display = 'block';
            base64Image = null;
            imagePreviewContainer.style.display = 'none';
            simBtn.style.display = 'none';
            leafUpload.value = '';
        });
    }

    // 7. Soil Fertilizer Calculator Logic
    const calcBtn = document.getElementById('calc-btn');
    const cropSelect = document.getElementById('crop-type');
    const landAreaInput = document.getElementById('land-area');
    
    const nVal = document.getElementById('n-val');
    const pVal = document.getElementById('p-val');
    const kVal = document.getElementById('k-val');
    
    // Base NPK requirements per acre (kg)
    const cropData = {
        wheat: { n: 50, p: 25, k: 20 },
        rice: { n: 60, p: 30, k: 30 },
        sugarcane: { n: 100, p: 40, k: 40 }
    };

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const crop = cropSelect.value;
            const area = parseFloat(landAreaInput.value) || 0;
            
            if (area <= 0) return;

            const baseReq = cropData[crop];
            
            // Calculate totals
            const totalN = Math.round(baseReq.n * area);
            const totalP = Math.round(baseReq.p * area);
            const totalK = Math.round(baseReq.k * area);

            // Animate numbers
            animateValue(nVal, 0, totalN, 1000);
            animateValue(pVal, 0, totalP, 1000);
            animateValue(kVal, 0, totalK, 1000);
            
            // Add slight highlight effect to grid
            const grid = document.querySelector('.npk-grid');
            grid.style.transform = 'scale(1.05)';
            setTimeout(() => grid.style.transform = 'scale(1)', 300);
        });
    }

});
