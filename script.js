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

    // 8. Functional Rental Vehicle State & Logic (Queue System)
    const rentalsGrid = document.getElementById('rentals-grid');
    const defaultVehicles = [
        { id: 'v1', name: 'Mahindra Tractor (50HP)', rate: '800', unit: '/ hr', owner: 'Ramesh', loc: '2 km away', img: 'assets/tractor.png', status: 'available', queue: 0 },
        { id: 'v2', name: 'Combine Harvester', rate: '2500', unit: '/ hr', owner: 'Suresh', loc: '5 km away', img: 'assets/combine_harvester.png', status: 'busy', queue: 1 },
        { id: 'v3', name: 'Spraying Drone', rate: '400', unit: '/ acre', owner: 'AgriTech Co', loc: '10 km away', img: 'assets/spraying_drone.png', status: 'available', queue: 0 }
    ];

    let vehicles = JSON.parse(localStorage.getItem('agrimind_vehicles')) || defaultVehicles;
    
    // Migrate old data if necessary
    vehicles = vehicles.map(v => ({...v, queue: v.queue || 0}));

    function saveVehicles() {
        localStorage.setItem('agrimind_vehicles', JSON.stringify(vehicles));
    }

    function renderVehicles() {
        if (!rentalsGrid) return;
        rentalsGrid.innerHTML = '';
        vehicles.forEach(v => {
            const isAvailable = v.status === 'available';
            const queueCount = v.queue;
            
            let badgeClass = isAvailable ? 'available' : 'busy';
            let badgeText = isAvailable ? 'Available' : (queueCount > 0 ? `Busy (Queue: ${queueCount})` : 'Busy');
            let btnText = isAvailable ? 'Book Now' : 'Join Queue';
            
            const card = document.createElement('div');
            card.className = 'equip-card fade-up hover-scale-slight visible';
            
            // Add a small return button if busy to demonstrate queue popping
            const returnBtnHTML = !isAvailable ? `<button class="return-btn" data-id="${v.id}" style="margin-top: 10px; background: transparent; border: 1px solid var(--border-color); padding: 5px 10px; border-radius: 5px; cursor: pointer; width: 100%;"><i class="fa-solid fa-arrow-rotate-left"></i> Return Vehicle</button>` : '';

            card.innerHTML = `
                <div class="equip-img" style="background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${v.img}') center/cover;">
                    <span class="badge ${badgeClass}" data-lang-en="${badgeText}" data-lang-hi="${badgeText}">${badgeText}</span>
                </div>
                <div class="equip-info">
                    <h3 data-lang-en="${v.name}" data-lang-hi="${v.name}">${v.name}</h3>
                    <p class="rate">₹${v.rate} <span data-lang-en="${v.unit}" data-lang-hi="${v.unit}">${v.unit}</span></p>
                    <p class="owner"><i class="fa-solid fa-location-dot"></i> <span data-lang-en="${v.loc} (${v.owner})" data-lang-hi="${v.loc} (${v.owner})">${v.loc} (${v.owner})</span></p>
                    <button class="btn btn-secondary btn-block book-btn" data-id="${v.id}" data-lang-en="${btnText}" data-lang-hi="${btnText}">${btnText}</button>
                    ${returnBtnHTML}
                </div>
            `;
            rentalsGrid.appendChild(card);
        });

        // Attach booking listeners
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vId = e.target.getAttribute('data-id');
                openBookingModal(vId);
            });
        });

        // Attach return listeners
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vId = e.target.getAttribute('data-id');
                const v = vehicles.find(veh => veh.id === vId);
                if (v) {
                    if (v.queue > 0) {
                        v.queue--;
                        alert(`Vehicle returned! Next person in queue automatically takes it. (Remaining queue: ${v.queue})`);
                    } else {
                        v.status = 'available';
                        alert('Vehicle returned and is now available!');
                    }
                    saveVehicles();
                    renderVehicles();
                }
            });
        });
    }

    // Initial render
    renderVehicles();

    // Booking Logic
    const bookingModal = document.getElementById('booking-modal');
    const bookingDetails = document.getElementById('booking-details');
    const cancelBookingBtn = document.getElementById('cancel-booking');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    let currentBookingId = null;

    function openBookingModal(id) {
        const v = vehicles.find(veh => veh.id === id);
        if (!v) return;
        currentBookingId = id;
        
        if (v.status === 'available') {
            bookingDetails.textContent = `You are about to book the ${v.name} for ₹${v.rate}${v.unit}.`;
        } else if (v.status === 'busy') {
            bookingDetails.textContent = `The ${v.name} is currently busy. Would you like to join the queue? (Current queue length: ${v.queue})`;
        }
        
        bookingModal.classList.add('active');
    }

    if (cancelBookingBtn && confirmBookingBtn && bookingModal) {
        cancelBookingBtn.addEventListener('click', () => {
            bookingModal.classList.remove('active');
            currentBookingId = null;
        });

        confirmBookingBtn.addEventListener('click', () => {
            const v = vehicles.find(veh => veh.id === currentBookingId);
            if (v) {
                if (v.status === 'available') {
                    v.status = 'busy';
                } else if (v.status === 'busy') {
                    v.queue++;
                }
                saveVehicles();
                renderVehicles();
            }
            bookingModal.classList.remove('active');
            currentBookingId = null;
        });

        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.classList.remove('active');
                currentBookingId = null;
            }
        });
    }

    // List Vehicle Modal Logic
    const openModalBtn = document.getElementById('open-list-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const listModal = document.getElementById('list-vehicle-modal');
    const listForm = document.getElementById('list-vehicle-form');

    if (openModalBtn && listModal && closeModalBtn && listForm) {
        openModalBtn.addEventListener('click', () => listModal.classList.add('active'));
        closeModalBtn.addEventListener('click', () => listModal.classList.remove('active'));
        listModal.addEventListener('click', (e) => {
            if (e.target === listModal) listModal.classList.remove('active');
        });

        listForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('veh-name').value;
            const rate = document.getElementById('veh-rate').value;
            const unit = document.getElementById('veh-unit').value;
            const owner = document.getElementById('veh-owner').value;
            const loc = document.getElementById('veh-loc').value;
            const photoInput = document.getElementById('veh-photo');
            
            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const newId = 'v' + Date.now();
                    vehicles.unshift({
                        id: newId,
                        name, rate, unit, owner, loc, img: event.target.result, status: 'available'
                    });
                    saveVehicles();
                    renderVehicles();
                    
                    listModal.classList.remove('active');
                    listForm.reset();
                };
                reader.readAsDataURL(photoInput.files[0]);
            }
        });
    }

    // 9. Functional Farmer Marketplace Logic
    const marketGrid = document.getElementById('market-grid');
    const defaultCrops = [
        { id: 'c1', name: 'Organic Wheat', price: '2300', qty: '50', farmer: 'Ramesh Kumar', phone: '919876543210', img: 'assets/wheat_farmer.png' },
        { id: 'c2', name: 'Basmati Rice', price: '6200', qty: '100', farmer: 'Suresh Patil', phone: '919876543211', img: 'assets/rice_farmer.png' }
    ];

    let marketCrops = JSON.parse(localStorage.getItem('agrimind_crops')) || defaultCrops;

    function saveCrops() {
        localStorage.setItem('agrimind_crops', JSON.stringify(marketCrops));
    }

    function renderCrops() {
        if (!marketGrid) return;
        marketGrid.innerHTML = '';
        marketCrops.forEach(c => {
            const card = document.createElement('div');
            card.className = 'market-card fade-up hover-glow visible';
            
            // Format phone number to ensure it starts with country code, default to 91 if length is 10
            let formatPhone = c.phone.replace(/[^0-9]/g, '');
            if (formatPhone.length === 10) formatPhone = '91' + formatPhone;
            
            const message = `Hello ${c.farmer}, I am interested in buying your ${c.qty} Quintals of ${c.name} listed on AgriMind at ₹${c.price}/qtl.`;
            const waLink = `https://wa.me/${formatPhone}?text=${encodeURIComponent(message)}`;

            card.innerHTML = `
                <div class="crop-image" style="background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('${c.img}') center/cover;">
                    <div class="price-tag">₹${c.price}/qtl</div>
                </div>
                <div class="card-content">
                    <h3 data-lang-en="${c.name}" data-lang-hi="${c.name}">${c.name}</h3>
                    <p class="seller"><i class="fa-solid fa-user"></i> <span data-lang-en="${c.farmer}" data-lang-hi="${c.farmer}">${c.farmer}</span></p>
                    <p class="quantity"><i class="fa-solid fa-weight-hanging"></i> <span data-lang-en="${c.qty} Quintals" data-lang-hi="${c.qty} Quintals">${c.qty} Quintals</span></p>
                    <a href="${waLink}" target="_blank" class="btn btn-primary btn-block"><i class="fa-brands fa-whatsapp"></i> <span data-lang-en="Contact" data-lang-hi="संपर्क">Contact</span></a>
                </div>
            `;
            marketGrid.appendChild(card);
        });
    }

    // Initial render
    renderCrops();

    // List Crop Modal Logic
    const openMarketModalBtn = document.getElementById('open-market-modal');
    const closeMarketModalBtn = document.getElementById('close-market-modal');
    const marketModal = document.getElementById('list-market-modal');
    const marketForm = document.getElementById('list-market-form');

    if (openMarketModalBtn && marketModal && closeMarketModalBtn && marketForm) {
        openMarketModalBtn.addEventListener('click', () => marketModal.classList.add('active'));
        closeMarketModalBtn.addEventListener('click', () => marketModal.classList.remove('active'));
        marketModal.addEventListener('click', (e) => {
            if (e.target === marketModal) marketModal.classList.remove('active');
        });

        marketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('crop-name').value;
            const price = document.getElementById('crop-price').value;
            const qty = document.getElementById('crop-qty').value;
            const farmer = document.getElementById('crop-farmer').value;
            const phone = document.getElementById('crop-phone').value;
            const photoInput = document.getElementById('crop-photo');
            
            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const newId = 'c' + Date.now();
                    marketCrops.unshift({
                        id: newId,
                        name, price, qty, farmer, phone, img: event.target.result
                    });
                    saveCrops();
                    renderCrops();
                    
                    marketModal.classList.remove('active');
                    marketForm.reset();
                };
                reader.readAsDataURL(photoInput.files[0]);
            }
        });
    }

});
