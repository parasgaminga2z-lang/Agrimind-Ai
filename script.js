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

    // 8. AI CHATBOT ASSISTANT LOGIC
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const floatingChatbotBtn = document.getElementById('floating-chatbot-btn');
    const aiChatbotContainer = document.getElementById('ai-chatbot-modal');

    // Toggle Chatbot Visibility
    if (floatingChatbotBtn && aiChatbotContainer) {
        floatingChatbotBtn.addEventListener('click', () => {
            aiChatbotContainer.classList.toggle('active');
            // Focus on input when opened
            if (aiChatbotContainer.classList.contains('active')) {
                setTimeout(() => chatInput.focus(), 300);
            }
        });
    }

    // AI Bot Responses Database
    const aiResponses = {
        'crop-disease': {
            'en': "Common crop diseases include Early Blight, Late Blight, Powdery Mildew, and Rust. For effective prevention: 1) Use disease-resistant seed varieties, 2) Practice crop rotation, 3) Maintain proper spacing for air circulation, 4) Use our AI Photo Diagnostics tool to identify diseases early. Would you like specific treatment recommendations?",
            'hi': "आम फसल की बीमारियों में अर्ली ब्लाइट, लेट ब्लाइट, पाउडरी मिल्ड्यू और रस्ट शामिल हैं। प्रभावी रोकथाम के लिए: 1) रोग प्रतिरोधी बीज किस्मों का उपयोग करें, 2) फसल चक्रण करें, 3) उचित दूरी बनाए रखें, 4) हमारे एआई फोटो डायग्नोस्टिक्स टूल का उपयोग करें। क्या आप विशिष्ट उपचार की सिफारिशें चाहते हैं?"
        },
        'fertilizer': {
            'en': "Smart fertilizer usage is key to healthy crops! Our calculator helps determine exact NPK needs based on crop type and land area. General guidelines: Wheat needs 50kg N per acre, Rice needs 60kg N per acre, Sugarcane needs 100kg N per acre. Using our Fertilizer Calculator saves up to 30% costs while improving yield. Try it now!",
            'hi': "स्मार्ट उर्वरक उपयोग स्वस्थ फसलों की कुंजी है! हमारा कैलकुलेटर फसल के प्रकार और भूमि क्षेत्र के आधार पर सटीक NPK आवश्यकता निर्धारित करने में मदद करता है। सामान्य दिशानिर्देश: गेहूं को प्रति एकड़ 50 किग्रा N की जरूरत है, चावल को 60 किग्रा N की जरूरत है, गन्ने को 100 किग्रा N की जरूरत है। हमारे कैलकुलेटर का उपयोग करके 30% तक लागत बचाएं। अभी आज़माएं!"
        },
        'equipment': {
            'en': "We offer equipment rental services for tractors, harvesters, and drones. Benefits: 1) Affordable hourly/daily rates, 2) Equipment available within 2-10 km, 3) Direct connection with local farmers, 4) Book instantly via WhatsApp. Current availability: Mahindra Tractor ₹800/hr, Combine Harvester ₹2500/hr, Spraying Drone ₹400/acre. Ready to book?",
            'hi': "हम ट्रैक्टर, हार्वेस्टर और ड्रोन के लिए उपकरण किराये की सेवाएं प्रदान करते हैं। लाभ: 1) सस्ती घंटे/दिन दर, 2) उपकरण 2-10 किमी के भीतर उपलब्ध, 3) स्थानीय किसानों के साथ सीधा संपर्क, 4) व्हाट्सएप के माध्यम से तुरंत बुक करें। वर्तमान उपलब्धता: महिंद्रा ट्रैक्टर ₹800/घंटा, कंबाइन हार्वेस्टर ₹2500/घंटा, स्प्रेइंग ड्रोन ₹400/एकड़। बुक करने के लिए तैयार हैं?"
        },
        'schemes': {
            'en': "Government schemes available for farmers: 1) PM-KISAN: ₹6,000 annual income support, 2) PMFBY: Crop insurance coverage, 3) Kisan Credit Card: Easy credit access. We help you check eligibility and apply online. Benefits can transform your farming! Click on 'Schemes' section to learn more about government support programs.",
            'hi': "किसानों के लिए उपलब्ध सरकारी योजनाएं: 1) पीएम-किसान: ₹6,000 वार्षिक आय सहायता, 2) पीएमएफबीवाई: फसल बीमा कवरेज, 3) किसान क्रेडिट कार्ड: आसान ऋण प्रवेश। हम आपको पात्रता जांचने और ऑनलाइन आवेदन करने में मदद करते हैं। लाभ आपकी कृषि को बदल सकते हैं! अधिक जानने के लिए 'योजनाएं' सेक्शन पर क्लिक करें।"
        },
        'default': {
            'en': "Hello! I'm here to help with your farming needs. I can assist with crop diseases, fertilizer calculations, equipment rentals, market prices, and government schemes. What would you like to know?",
            'hi': "नमस्ते! मैं आपकी कृषि जरूरतों में मदद करने के लिए यहाँ हूँ। मैं फसल की बीमारियों, उर्वरक गणना, उपकरण किराये, बाजार की कीमतों और सरकारी योजनाओं में सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?"
        }
    };

    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getAIResponse(query) {
        const lang = currentLang || 'en';
        query = query.toLowerCase().trim();
        
        // Simple keyword matching
        if (query.includes('disease') || query.includes('बीमारी')) {
            return aiResponses['crop-disease'][lang];
        } else if (query.includes('fertilizer') || query.includes('उर्वरक')) {
            return aiResponses['fertilizer'][lang];
        } else if (query.includes('equipment') || query.includes('rent') || query.includes('उपकरण') || query.includes('किराया')) {
            return aiResponses['equipment'][lang];
        } else if (query.includes('scheme') || query.includes('योजना')) {
            return aiResponses['schemes'][lang];
        } else {
            return aiResponses['default'][lang];
        }
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (!message) return;

            addUserMessage(message);
            chatInput.value = '';

            // Simulate AI response delay
            setTimeout(() => {
                const response = getAIResponse(message);
                addBotMessage(response);
            }, 500);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatBtn.click();
            }
        });
    }

    // Quick button handlers
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            const responses = {
                'crop-disease': 'Tell me about crop diseases',
                'fertilizer': 'How do I calculate fertilizer needs?',
                'equipment': 'I want to rent equipment',
                'schemes': 'What government schemes are available?'
            };
            
            addUserMessage(responses[question] || 'Hello');
            
            setTimeout(() => {
                const response = getAIResponse(question);
                addBotMessage(response);
            }, 500);
        });
    });

    // Close chat button
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            aiChatbotContainer.classList.remove('active');
        });
    }

});